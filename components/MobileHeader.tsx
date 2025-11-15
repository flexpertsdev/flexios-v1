
import React from 'react';
import type { Mode } from '../types';
import { MenuIcon } from './Icons';

interface MobileHeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  onMenuClick: () => void;
  onBuildClick: () => void;
  isBuilding: boolean;
  isRepoConnected: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ mode, setMode, onMenuClick, onBuildClick, isBuilding, isRepoConnected }) => (
  <div className="md:hidden bg-bg-secondary border-b border-border-primary flex-shrink-0 relative z-10">
    <div className="px-4 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 -ml-2 hover:bg-bg-tertiary rounded-lg transition">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center space-x-2">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E" className="w-8 h-8 rounded-lg" alt="Flexi" />
        <div>
          <div className="font-semibold text-sm text-text-primary">Flexi</div>
          <div className="text-xs text-primary-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <span>Ready to help!</span>
          </div>
        </div>
      </div>
      <button 
        onClick={onBuildClick} 
        disabled={isBuilding || !isRepoConnected} 
        className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBuilding ? 'Syncing...' : 'Sync'}
      </button>
    </div>

    <div className="grid grid-cols-2 bg-bg-primary">
      <button onClick={() => setMode('files')} className={`px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition ${mode === 'files' ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-transparent text-text-tertiary'}`}>
        <span>💬</span>
        <span>Chat</span>
      </button>
      <button onClick={() => setMode('library')} className={`px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition ${mode === 'library' ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-transparent text-text-tertiary'}`}>
        <span>📚</span>
        <span>Library</span>
      </button>
    </div>
  </div>
);
