
import React, { useState } from 'react';

interface SetupModalProps {
  onSave: (geminiKey: string, githubToken: string) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onSave }) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [githubToken, setGithubToken] = useState('');

    const handleSave = () => {
        if (geminiKey.trim() && githubToken.trim()) {
            onSave(geminiKey, githubToken);
        }
    };

    return (
        <div className="fixed inset-0 bg-bg-primary bg-opacity-95 z-50 flex items-center justify-center animate-fade-in p-4">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
                <div className="text-center">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E"
                        className="w-16 h-16 mx-auto mb-4" alt="Flexi" />
                    <h2 className="text-2xl font-bold mb-2 text-text-primary">Welcome to FlexOS Builder</h2>
                    <p className="text-text-tertiary mb-6">To get started, please provide your API keys. These are stored securely in your browser's local storage and are only sent directly to their respective services.</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="gemini-key" className="block text-sm font-medium text-text-secondary mb-1">Gemini API Key</label>
                        <input
                            id="gemini-key"
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="w-full bg-bg-primary rounded-md border border-border-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            placeholder="Enter your Gemini API key"
                        />
                         <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google AI Studio</a>
                    </div>
                    <div>
                        <label htmlFor="github-token" className="block text-sm font-medium text-text-secondary mb-1">GitHub Personal Access Token</label>
                        <input
                            id="github-token"
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            className="w-full bg-bg-primary rounded-md border border-border-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            placeholder="Enter your GitHub PAT"
                        />
                        <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Generate a new token with `repo` scope</a>
                    </div>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={!geminiKey.trim() || !githubToken.trim()}
                    className="w-full mt-8 bg-primary-500 text-white rounded-lg px-4 py-3 font-semibold flex items-center justify-center space-x-2 transition hover:bg-primary-600 disabled:bg-bg-quaternary disabled:cursor-not-allowed">
                    Save and Start Building
                </button>
            </div>
        </div>
    );
};
