
import React, { useState } from 'react';

interface GitHubSyncProps {
    syncedRepo: { owner: string; repo: string } | null;
    onClone: (repoUrl: string) => void;
    onCreate: (repoName: string) => void;
    onPush: () => void;
    isSyncing: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export const GitHubSync: React.FC<GitHubSyncProps> = ({ syncedRepo, onClone, onCreate, onPush, isSyncing }) => {
    const [tab, setTab] = useState<'create' | 'clone'>('create');
    const [repoUrl, setRepoUrl] = useState('');
    const [newRepoName, setNewRepoName] = useState('');

    const handleCreate = () => {
        if (newRepoName.trim()) {
            onCreate(newRepoName.trim());
        }
    };

    const handleClone = () => {
        if (repoUrl.trim()) {
            onClone(repoUrl.trim());
        }
    };

    if (syncedRepo) {
        return (
            <div className="space-y-2 text-center">
                 <p className="text-xs text-text-tertiary">Synced with:</p>
                 <a 
                    href={`https://github.com/${syncedRepo.owner}/${syncedRepo.repo}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-primary-400 hover:underline break-all"
                 >
                    {syncedRepo.owner}/{syncedRepo.repo}
                 </a>
                <button 
                    onClick={onPush} 
                    disabled={isSyncing} 
                    className="w-full bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg px-4 py-3 font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                    {isSyncing ? <LoadingSpinner /> : '🚀'}
                    <span>{isSyncing ? 'Pushing...' : 'Push to GitHub'}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex bg-bg-tertiary p-1 rounded-lg">
                <button onClick={() => setTab('create')} className={`flex-1 text-xs px-2 py-1 rounded-md transition ${tab === 'create' ? 'bg-primary-500 text-white' : 'text-text-secondary'}`}>Create New</button>
                <button onClick={() => setTab('clone')} className={`flex-1 text-xs px-2 py-1 rounded-md transition ${tab === 'clone' ? 'bg-primary-500 text-white' : 'text-text-secondary'}`}>Sync Existing</button>
            </div>

            {tab === 'create' && (
                <div className="space-y-2">
                     <input
                        type="text"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="new-repo-name"
                        className="w-full bg-bg-primary rounded-md border border-border-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                    />
                    <button onClick={handleCreate} disabled={isSyncing || !newRepoName.trim()} className="w-full bg-primary-500/80 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center space-x-2 transition hover:bg-primary-500 disabled:opacity-50 disabled:cursor-wait">
                        {isSyncing ? <LoadingSpinner /> : null}
                        <span>Create & Sync</span>
                    </button>
                </div>
            )}

            {tab === 'clone' && (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="w-full bg-bg-primary rounded-md border border-border-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                    />
                    <button onClick={handleClone} disabled={isSyncing || !repoUrl.trim()} className="w-full bg-primary-500/80 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center space-x-2 transition hover:bg-primary-500 disabled:opacity-50 disabled:cursor-wait">
                        {isSyncing ? <LoadingSpinner /> : null}
                        <span>Clone & Sync</span>
                    </button>
                </div>
            )}
        </div>
    );
};
