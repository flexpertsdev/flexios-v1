
import React from 'react';
import type { SelectedLibraryItemType, Documentation, ChangelogEntry, RoadmapPhase } from '../types';
import { CheckIcon } from './Icons';

interface LibraryPanelProps {
  selectedLibraryItem: SelectedLibraryItemType;
  selectedDoc: Documentation | null;
  changelog: ChangelogEntry[];
  roadmap: RoadmapPhase[];
  vision: any; // from constants
  architecture: any; // from constants
  isMobile?: boolean;
}

const getChangeTypeStyle = (type: string) => {
    const styles: {[key: string]: {color: string, icon: string}} = {
        'feature': { color: 'bg-primary-500', icon: '✨' },
        'update': { color: 'bg-blue-500', icon: '🔄' },
        'database': { color: 'bg-orange-500', icon: '🗄️' },
        'vision': { color: 'bg-purple-500', icon: '🔮' },
        'bugfix': { color: 'bg-red-500', icon: '🐛' },
    };
    return styles[type] || { color: 'bg-gray-500', icon: '•' };
};

const ChangelogView: React.FC<{ changelog: ChangelogEntry[] }> = ({ changelog }) => (
    <div className="space-y-6">
        {changelog.map((entry, index) => (
            <div key={entry.date} className="relative flex">
                <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-1.5"></div>
                    {index < changelog.length - 1 && <div className="w-0.5 h-full bg-border-primary my-2"></div>}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="text-lg font-semibold text-text-primary">{entry.date}</div>
                        <div className="text-xs text-text-muted">{entry.time}</div>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4 space-y-3">
                        {entry.changes.map(change => {
                            const style = getChangeTypeStyle(change.type);
                            return (
                                <div key={change.id} className="flex items-start space-x-3">
                                    <div className={`${style.color} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white`}><span className="text-xs">{style.icon}</span></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-text-primary">{change.title}</div>
                                        <div className="text-xs text-text-tertiary mt-1">{change.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const VisionView: React.FC<{ vision: any }> = ({ vision }) => (
    <div className="space-y-6">
        <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-text-primary"><span>🎯</span><span>Vision Statement</span></h4>
            <p className="text-text-secondary leading-relaxed">{vision?.statement}</p>
        </div>
        <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
             <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-text-primary"><span>👥</span><span>Target Users</span></h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vision?.targetUsers.map((user: any) => (
                    <div key={user.title} className="bg-bg-primary rounded-lg p-4">
                        <div className="text-2xl mb-2">{user.emoji}</div>
                        <div className="font-medium mb-1">{user.title}</div>
                        <div className="text-xs text-text-tertiary">{user.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const RoadmapView: React.FC<{ roadmap: RoadmapPhase[] }> = ({ roadmap }) => {
    const getPhaseStatusClass = (status: string) => {
        const classes: {[key: string]: string} = { 'Completed': 'bg-green-500/20 text-green-400', 'In Progress': 'bg-yellow-500/20 text-yellow-400', 'Planned': 'bg-blue-500/20 text-blue-400' };
        return classes[status] || 'bg-gray-500/20 text-gray-400';
    };
    return (
        <div className="space-y-6">
            {roadmap.map(phase => (
                <div key={phase.id} className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-semibold text-text-primary">{phase.name}</h4>
                            <p className="text-sm text-text-tertiary">{phase.timeline}</p>
                        </div>
                        <span className={`${getPhaseStatusClass(phase.status)} px-3 py-1 rounded-full text-xs font-medium`}>{phase.status}</span>
                    </div>
                    <div className="space-y-2">
                        {phase.items.map(item => (
                            <div key={item} className="flex items-center space-x-2 text-sm text-text-secondary">
                                <CheckIcon className="w-4 h-4 text-primary-400" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-primary">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-tertiary">Progress</span>
                            <span className="font-medium text-text-primary">{phase.progress}%</span>
                        </div>
                        <div className="mt-2 h-2 bg-bg-quaternary rounded-full overflow-hidden">
                            <div style={{width: `${phase.progress}%`}} className="h-full bg-primary-500 transition-all"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const ArchitectureView: React.FC<{ architecture: any }> = ({ architecture }) => (
    <div className="space-y-6">
        <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold mb-4 text-text-primary">Tech Stack</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {architecture?.techStack.map((tech: any) => (
                    <div key={tech.title} className="bg-bg-primary rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">{tech.emoji}</div>
                        <div className="font-medium text-text-primary">{tech.title}</div>
                        <div className="text-xs text-text-tertiary">{tech.desc}</div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold mb-4 text-text-primary">Architecture Layers</h4>
            <div className="space-y-3">
                 {architecture?.layers.map((layer: any) => (
                    <div key={layer.title} className={`bg-gradient-to-r from-${layer.color}-500/20 to-${layer.color}-600/20 border border-${layer.color}-500/30 rounded-lg p-4`}>
                        <div className="font-medium text-text-primary">{layer.title}</div>
                        <div className="text-sm text-text-tertiary">{layer.desc}</div>
                    </div>
                 ))}
            </div>
        </div>
    </div>
);

const DocView: React.FC<{ doc: Documentation }> = ({ doc }) => (
    <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all prose" dangerouslySetInnerHTML={{ __html: doc.content }}></div>
);


export const LibraryPanel: React.FC<LibraryPanelProps> = ({ selectedLibraryItem, selectedDoc, changelog, roadmap, vision, architecture, isMobile }) => {
    
    const titles: {[key: string]: {title: string, desc: string}} = {
        changelog: { title: 'Project Changelog', desc: 'Complete history of all changes to your project specifications' },
        vision: { title: 'Vision & Goals', desc: 'The guiding principles and objectives for this project' },
        doc: { title: selectedDoc?.title || "Documentation", desc: selectedDoc?.description || '' },
        roadmap: { title: 'Project Roadmap', desc: 'Planned features and milestones' },
        architecture: { title: 'System Architecture', desc: 'Technical overview and design patterns' },
    };

    const currentTitle = titles[selectedLibraryItem];

    const renderContent = () => {
        switch (selectedLibraryItem) {
            case 'changelog': return <ChangelogView changelog={changelog} />;
            case 'vision': return vision ? <VisionView vision={vision} /> : null;
            case 'roadmap': return <RoadmapView roadmap={roadmap} />;
            case 'architecture': return architecture ? <ArchitectureView architecture={architecture} /> : null;
            case 'doc': return selectedDoc ? <DocView doc={selectedDoc} /> : <p>Select a document to view.</p>;
            default: return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {!isMobile && (
                <div className="bg-bg-secondary border-b border-border-primary px-6 py-3">
                    <h2 className="text-lg font-medium text-text-primary">{currentTitle.title}</h2>
                </div>
            )}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                <div className="max-w-4xl animate-slide-up mx-auto">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2 text-text-primary">{currentTitle.title}</h3>
                        <p className="text-text-tertiary">{currentTitle.desc}</p>
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
