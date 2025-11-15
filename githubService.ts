
import { VFile } from "./types";

const GITHUB_API_BASE = 'https://api.github.com';

export async function createGitHubRepo(token: string, name: string): Promise<any> {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            private: true,
            description: 'Project specifications managed by FlexOS Builder.',
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        const message = error.errors?.[0]?.message || error.message || 'An unknown error occurred';
        throw new Error(`GitHub repo creation failed: ${message}`);
    }
    return response.json();
}

async function getRepoContentsRecursive(token: string, owner: string, repo: string, path: string = ''): Promise<VFile[]> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if (response.status === 404) return []; // Empty repo or path
        throw new Error(`Failed to fetch repo contents for path: ${path}. Status: ${response.status}`);
    }

    const contents = await response.json();
    let files: VFile[] = [];

    for (const item of contents) {
        // Only pull files from our 'flexos' directory
        if (item.type === 'dir' && item.path === 'flexos') {
            const nestedFiles = await getRepoContentsRecursive(token, owner, repo, item.path);
            files = files.concat(nestedFiles);
        }
        // Check if it's a file *inside* flexos (or a root file we want)
        else if (item.type === 'file' && (item.path.startsWith('flexos/') || item.path === 'README.md')) {
             if (item.download_url) {
                const fileResponse = await fetch(item.download_url);
                if (fileResponse.ok) {
                    const content = await fileResponse.text();
                    files.push({ id: item.path, content }); // Use the path as the ID
                }
             }
        }
    }
    return files;
}

export async function getRepoContents(token: string, owner: string, repo: string): Promise<VFile[]> {
    return getRepoContentsRecursive(token, owner, repo, '');
}


export async function pushToRepo(token: string, owner: string, repo: string, files: VFile[], commitMessage: string): Promise<void> {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    // 1. Get main branch ref
    const refResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/main`, { headers });
    
    let latestCommitSha: string | null = null;
    let baseTreeSha: string | null = null;
    const isUpdate = refResponse.ok;

    if (isUpdate) {
        const refData = await refResponse.json();
        latestCommitSha = refData.object.sha;
        
        const commitResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
        if (!commitResponse.ok) throw new Error("Failed to get latest commit.");
        const commitData = await commitResponse.json();
        baseTreeSha = commitData.tree.sha;
    }

    // 2. Create a blob for each file
    const treeBlobs = await Promise.all(
        files.map(async (file) => {
            const blobResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: btoa(unescape(encodeURIComponent(file.content))),
                    encoding: 'base64',
                }),
            });
            if (!blobResponse.ok) throw new Error(`Failed to create blob for ${file.id}`);
            const blobData = await blobResponse.json();
            return {
                path: file.id, // Use the ID as the literal path
                mode: '100644',
                type: 'blob',
                sha: blobData.sha,
            };
        })
    );
    
    // Add a README to the root
     const readmeBlobResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: btoa(unescape(encodeURIComponent(`# ${repo}\n\nProject specs managed by FlexOS Builder.`))),
            encoding: 'base64',
        }),
    });
    const readmeBlobData = await readmeBlobResponse.json();
    const tree = [...treeBlobs, {
        path: 'README.md',
        mode: '100644',
        type: 'blob',
        sha: readmeBlobData.sha
    }];


    // 3. Create a new tree
    const treePayload: { tree: any[]; base_tree?: string } = { tree };
    if (isUpdate && baseTreeSha) {
        // This diffs the trees instead of replacing
        treePayload.base_tree = baseTreeSha;
    }
    const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(treePayload),
    });
    if (!treeResponse.ok) {
        console.error("Tree creation failed:", await treeResponse.json());
        throw new Error("Failed to create new tree.");
    }
    const treeData = await treeResponse.json();
    const newTreeSha = treeData.sha;

    // 4. Create a new commit
    const commitPayload: { message: string, tree: string, parents?: string[] } = {
        message: commitMessage,
        tree: newTreeSha,
    };
    if (latestCommitSha) {
        commitPayload.parents = [latestCommitSha];
    }
    const newCommitResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(commitPayload),
    });
    if (!newCommitResponse.ok) throw new Error("Failed to create new commit.");
    const newCommitData = await newCommitResponse.json();
    const newCommitSha = newCommitData.sha;

    // 5. Update or Create the main branch reference
    if (isUpdate) {
        // Update existing branch
        await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/main`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sha: newCommitSha, force: false }),
        });
    } else {
        // Create new branch
        await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ref: 'refs/heads/main',
                sha: newCommitSha,
            }),
        });
    }
}
