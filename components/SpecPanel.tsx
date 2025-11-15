
import React, { useState, useEffect } from 'react';
import type { GoogleGenAI } from '@google/genai';
import type { SelectableItem, SelectedItemType, Feature, Page, DatabaseTable } from '../types';
import { generateHtmlPreview } from '../services/geminiService';
import { CheckIcon, EditIcon, TrashIcon, SpecIcon } from './Icons';

interface SpecPanelProps {
  selectedItem: SelectableItem | null;
  selectedType: SelectedItemType | null;
  getFeatureName: (id: number) => string;
  ai: GoogleGenAI | null;
}

const getStatusPill = (status: string) => {
    const colors: { [key: string]: string } = {
        'complete': 'bg-green-500',
        'in-progress': 'bg-yellow-500',
        'pending': 'bg-blue-500'
    };
    return (
        <div className="flex items-center space-x-2">
            <div className={`${colors[status] || 'bg-gray-500'} w-2 h-2 rounded-full`}></div>
            <span className="text-sm font-medium text-text-primary capitalize">{status.replace('-', ' ')}</span>
        </div>
    );
};

const SpecDetailCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <h4 className="text-sm font-medium mb-3 text-text-primary">{title}</h4>
        {children}
    </div>
);

const FeatureSpec: React.FC<{ item: Feature }> = ({ item }) => (
    <div className="space-y-4 animate-slide-up">
        <div className="bg-gradient-to-br from-bg-tertiary to-bg-quaternary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">STATUS</span>
                {getStatusPill(item.status)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-text-tertiary">Priority</div><div className="font-medium text-text-primary">{item.priority}</div></div>
                <div><div className="text-xs text-text-tertiary">Complexity</div><div className="font-medium text-text-primary">{item.complexity}</div></div>
            </div>
        </div>
        <SpecDetailCard title="Description"><p className="text-sm text-text-secondary">{item.description}</p></SpecDetailCard>
        <SpecDetailCard title={`Requirements (${item.requirements?.length || 0})`}>
            <div className="space-y-2">
                {item.requirements?.map((req, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm">
                        <CheckIcon className="text-primary-400 mt-0.5 w-4 h-4 flex-shrink-0" />
                        <span className="text-text-secondary">{req}</span>
                    </div>
                ))}
            </div>
        </SpecDetailCard>
        <SpecDetailCard title={`Dependencies (${item.dependencies?.length || 0})`}>
             <div className="space-y-2">
                {item.dependencies?.map((dep, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm p-2 bg-bg-primary rounded">
                        <span className="text-primary-400">→</span>
                        <span className="text-text-secondary">{dep}</span>
                    </div>
                ))}
            </div>
        </SpecDetailCard>
    </div>
);

const PageSpec: React.FC<{ item: Page, getFeatureName: (id: number) => string }> = ({ item, getFeatureName }) => (
    <div className="space-y-4 animate-slide-up">
        <SpecDetailCard title="Page Type"><p className="text-sm text-text-secondary">{item.type || 'Standard Page'}</p></SpecDetailCard>
        <SpecDetailCard title={`Features Used (${item.features?.length || 0})`}>
            <div className="space-y-2">
                {item.features?.map(featureId => (
                    <button key={featureId} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-primary hover:bg-bg-quaternary text-sm transition-all hover:translate-x-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            <span>{getFeatureName(featureId)}</span>
                        </div>
                    </button>
                ))}
            </div>
        </SpecDetailCard>
    </div>
);

const DatabaseSpec: React.FC<{ item: DatabaseTable }> = ({ item }) => (
    <div className="space-y-4 animate-slide-up">
        <SpecDetailCard title={`Fields (${item.fields})`}>
            <div className="space-y-2 text-sm">
                <div className="p-2 bg-bg-primary rounded"><div className="font-mono text-xs text-primary-400">id: string (primary)</div></div>
                <div className="p-2 bg-bg-primary rounded"><div className="font-mono text-xs text-blue-400">name: string</div></div>
                <div className="p-2 bg-bg-primary rounded"><div className="font-mono text-xs text-purple-400">createdAt: datetime</div></div>
            </div>
        </SpecDetailCard>
    </div>
);


export const SpecPanel: React.FC<SpecPanelProps> = ({ selectedItem, selectedType, getFeatureName, ai }) => {
  const [tab, setTab] = useState<'spec' | 'preview'>('spec');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  useEffect(() => {
    setPreviewHtml(null);
    setTab('spec');
  }, [selectedItem]);

  const handlePreviewClick = async () => {
    if (!selectedItem || !selectedType || !ai) return;
    setTab('preview');
    if (previewHtml) return;

    setIsPreviewLoading(true);
    try {
        const html = await generateHtmlPreview(ai, selectedItem, selectedType);
        setPreviewHtml(html);
    } catch (error) {
        console.error(error);
        setPreviewHtml('<html><body>Error loading preview.</body></html>');
    } finally {
        setIsPreviewLoading(false);
    }
  };

  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center h-full">
          <div className="text-text-muted">
            <SpecIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select an item from the file tree<br />to view its specification</p>
          </div>
        </div>
      );
    }

    if (tab === 'preview') {
      if (isPreviewLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-tertiary p-4">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm">Generating live preview...</p>
            </div>
        );
      }
      return (
        <div className="animate-fade-in p-4 h-full">
          <iframe 
            srcDoc={previewHtml || ''} 
            title="Preview" 
            className="w-full h-full bg-white rounded-lg shadow-lg border-none"
            sandbox="allow-scripts"
          />
        </div>
      );
    }
    
    return (
        <div className="p-4">
            {selectedType === 'feature' && <FeatureSpec item={selectedItem as Feature} />}
            {selectedType === 'page' && <PageSpec item={selectedItem as Page} getFeatureName={getFeatureName} />}
            {selectedType === 'database' && <DatabaseSpec item={selectedItem as DatabaseTable} />}
        </div>
    );
  };
  
  return (
    <aside className="w-96 bg-bg-secondary border-l border-border-primary flex-col hidden lg:flex">
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-text-primary">{selectedItem ? selectedItem.name : 'Specification'}</h3>
            {selectedItem && (
                <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors duration-200"><EditIcon className="w-4 h-4" /></button>
                    <button className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors duration-200"><TrashIcon className="w-4 h-4" /></button>
                </div>
            )}
        </div>
        <div className="flex border-b border-border-primary -mx-4 px-2">
            <button onClick={() => setTab('spec')} className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 hover:text-text-primary -mb-px ${tab === 'spec' ? 'border-primary-500 text-primary-500' : 'border-transparent text-text-tertiary'}`}>
                Specification
            </button>
            <button onClick={handlePreviewClick} disabled={!selectedItem} className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 hover:text-text-primary -mb-px disabled:opacity-50 disabled:cursor-not-allowed ${tab === 'preview' ? 'border-primary-500 text-primary-500' : 'border-transparent text-text-tertiary'}`}>
                Preview
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {renderContent()}
      </div>
    </aside>
  );
};
