
const GITHUB_API_BASE = 'https://api.github.com';

interface RepoFile {
    path: string;
    content: string;
}

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

export async function createFilesInRepo(token: string, owner: string, repo: string, files: RepoFile[], commitMessage: string): Promise<void> {
    for (const file of files) {
        try {
            const content = btoa(unescape(encodeURIComponent(file.content)));
            const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file.path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content,
                }),
            });
            if (!response.ok) {
                console.error(`Failed to create file: ${file.path}`, await response.json());
            }
        } catch (e) {
             console.error(`Error encoding file ${file.path}:`, e);
        }
    }
}
