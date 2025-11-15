
import React, { useState } from 'react';
import type { Mode, SelectableItem, SelectedItemType, SelectedLibraryItemType, Documentation, Feature, Page, DatabaseTable } from '../types';
import { ChevronRightIcon } from './Icons';

interface SidebarProps {
  children?: React.ReactNode;
  isMobile?: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  selectedItem: SelectableItem | null;
  selectedType: SelectedItemType | null;
  onSelectItem: (item: SelectableItem, type: SelectedItemType) => void;
  selectedLibraryItem: SelectedLibraryItemType;
  selectedDoc: Documentation | null;
  onSelectLibraryItem: (type: SelectedLibraryItemType, doc?: Documentation) => void;
  features: Feature[];
  pages: Page[];
  database: DatabaseTable[];
  documentation: Documentation[];
}

const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = { 'complete': 'bg-green-500', 'in-progress': 'bg-yellow-500', 'pending': 'bg-blue-500' };
    return colors[status] || 'bg-gray-500';
};

const Section: React.FC<{title: string; count: number; children: React.ReactNode;}> = ({ title, count, children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
        <div className="mb-3">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-text-tertiary hover:text-text-primary transition-colors duration-200">
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{title}</span>
                    <span className="text-xs text-text-muted">({count})</span>
                </div>
            </div>
            {isExpanded && <div className="space-y-0.5 animate-slide-down ml-6">{children}</div>}
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, mode, setMode, selectedItem, selectedType, onSelectItem, selectedLibraryItem, selectedDoc, onSelectLibraryItem, features, pages, database, documentation, children }) => {
  
  const sidebarContent = (
    <>
      <div className={`p-4 border-b border-border-primary flex-shrink-0 ${isMobile ? 'hidden' : ''}`}>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-lg truncate text-text-primary">Hospital Management</div>
            <div className="text-xs text-text-tertiary">{features.length + pages.length + database.length} files</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setMode('files')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-primary-600 ${mode === 'files' ? 'bg-primary-500 text-white' : 'bg-bg-tertiary text-text-secondary'}`}>
            📁 Files
          </button>
          <button onClick={() => setMode('library')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-primary-600 ${mode === 'library' ? 'bg-primary-500 text-white' : 'bg-bg-tertiary text-text-secondary'}`}>
            📚 Library
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {mode === 'files' ? (
          <>
            <Section title="Features" count={features.length}>
              {features.map(feature => (
                <button key={feature.id} onClick={() => onSelectItem(feature, 'feature')}
                  className={`w-full px-2 py-1.5 rounded text-left text-sm flex items-center space-x-2 border-l-2 transition-all duration-200 ${selectedItem?.id === feature.id && selectedType === 'feature' ? 'bg-primary-500/20 border-primary-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary/50'}`}>
                  <div className={`${getStatusColor(feature.status)} w-2 h-2 rounded-full flex-shrink-0`}></div>
                  <span className="flex-1 truncate">{feature.name}</span>
                </button>
              ))}
            </Section>
            <Section title="Pages" count={pages.length}>
              {pages.map(page => (
                <button key={page.id} onClick={() => onSelectItem(page, 'page')}
                  className={`w-full px-2 py-1.5 rounded text-left text-sm flex items-center space-x-2 border-l-2 transition-all duration-200 ${selectedItem?.id === page.id && selectedType === 'page' ? 'bg-blue-500/20 border-blue-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary/50'}`}>
                  <span className="flex-shrink-0">📄</span>
                  <span className="flex-1 truncate">{page.name}</span>
                </button>
              ))}
            </Section>
            <Section title="Database" count={database.length}>
              {database.map(table => (
                <button key={table.id} onClick={() => onSelectItem(table, 'database')}
                  className={`w-full px-2 py-1.5 rounded text-left text-sm flex items-center space-x-2 border-l-2 transition-all duration-200 ${selectedItem?.id === table.id && selectedType === 'database' ? 'bg-orange-500/20 border-orange-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary/50'}`}>
                  <span className="flex-shrink-0">🗄️</span>
                  <span className="flex-1 truncate">{table.name}</span>
                </button>
              ))}
            </Section>
             <div>
                <button onClick={() => onSelectItem({id: 'design', name: 'Design System', type: 'design'}, 'design')}
                  className={`w-full px-2 py-1.5 rounded text-left text-sm flex items-center space-x-2 border-l-2 transition-all duration-200 ${selectedType === 'design' ? 'bg-purple-500/20 border-purple-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary/50'}`}>
                  <span>🎨</span>
                  <span className="flex-1">Design System</span>
                </button>
              </div>
          </>
        ) : (
          <div className="space-y-1">
             <button onClick={() => onSelectLibraryItem('changelog')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center space-x-3 border-l-2 transition-all ${selectedLibraryItem === 'changelog' ? 'bg-primary-500/20 border-primary-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary'}`}>
                <span className="text-lg">📝</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">Changelog</div><div className="text-xs text-text-tertiary truncate">Project history timeline</div></div>
             </button>
             <button onClick={() => onSelectLibraryItem('vision')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center space-x-3 border-l-2 transition-all ${selectedLibraryItem === 'vision' ? 'bg-purple-500/20 border-purple-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary'}`}>
                <span className="text-lg">🔮</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">Vision & Goals</div><div className="text-xs text-text-tertiary truncate">Project purpose and objectives</div></div>
             </button>
             <Section title="Documentation" count={documentation.length}>
                {documentation.map(doc => (
                    <button key={doc.id} onClick={() => onSelectLibraryItem('doc', doc)}
                        className={`w-full px-2 py-1.5 rounded text-left text-xs flex items-center space-x-2 border-l-2 transition-all ${selectedDoc?.id === doc.id ? 'bg-blue-500/20 border-blue-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary'}`}>
                        <span>📄</span>
                        <span className="flex-1 truncate">{doc.title}</span>
                    </button>
                ))}
            </Section>
            <button onClick={() => onSelectLibraryItem('roadmap')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center space-x-3 border-l-2 mt-3 transition-all ${selectedLibraryItem === 'roadmap' ? 'bg-orange-500/20 border-orange-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary'}`}>
                <span className="text-lg">🎯</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">Roadmap</div><div className="text-xs text-text-tertiary truncate">Future planning</div></div>
            </button>
            <button onClick={() => onSelectLibraryItem('architecture')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center space-x-3 border-l-2 transition-all ${selectedLibraryItem === 'architecture' ? 'bg-indigo-500/20 border-indigo-500 text-text-primary' : 'border-transparent hover:bg-bg-tertiary'}`}>
                <span className="text-lg">🏗️</span>
                <div className="flex-1 min-w-0"><div className="font-medium truncate">Architecture</div><div className="text-xs text-text-tertiary truncate">System design overview</div></div>
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border-primary p-3 flex-shrink-0">
        {children}
      </div>
    </>
  );

  return (
    <div className={`flex flex-col ${isMobile ? 'h-full' : 'w-72 bg-bg-secondary/95 backdrop-blur-sm border-r border-border-primary'}`}>
      {sidebarContent}
    </div>
  );
};
