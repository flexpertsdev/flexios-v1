
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { Mode, Message, SelectableItem, SelectedItemType, SelectedLibraryItemType, Documentation, VFile, Feature, Page, DatabaseTable, ChangelogEntry, RoadmapPhase } from './types';
import * as seedData from './constants';
import { getAiClient, getFlexiResponse, generateHtmlPreview } from './services/geminiService';
import { createGitHubRepo, createFilesInRepo } from './githubService';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { SpecPanel } from './components/SpecPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { MobileHeader } from './components/MobileHeader';
import { MobileSheet } from './components/MobileSheet';
import { SetupModal } from './components/SetupModal';

async function seedDatabase() {
    console.log("Seeding database...");
    const filesToSeed: VFile[] = [];
    
    seedData.features.forEach(f => filesToSeed.push({ id: `features/${f.id}`, content: JSON.stringify(f) }));
    seedData.pages.forEach(p => filesToSeed.push({ id: `pages/${p.id}`, content: JSON.stringify(p) }));
    seedData.database.forEach(d => filesToSeed.push({ id: `database/${d.id}`, content: JSON.stringify(d) }));
    seedData.documentation.forEach(d => filesToSeed.push({ id: `library/docs/${d.id}`, content: JSON.stringify(d) }));
    
    filesToSeed.push({ id: 'library/changelog', content: JSON.stringify(seedData.changelog) });
    filesToSeed.push({ id: 'library/roadmap', content: JSON.stringify(seedData.roadmap) });
    filesToSeed.push({ id: 'library/vision', content: JSON.stringify(seedData.vision) });
    filesToSeed.push({ id: 'library/architecture', content: JSON.stringify(seedData.architecture) });
    filesToSeed.push({ id: 'design/system', content: JSON.stringify({id: 'design', name: 'Design System', type: 'design'})});

    await db.files.bulkPut(filesToSeed);
    console.log("Database seeded.");
}

export default function App() {
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('geminiApiKey'));
  const [githubPat, setGithubPat] = useState(() => localStorage.getItem('githubPat'));
  const aiClient = useMemo(() => geminiApiKey ? getAiClient(geminiApiKey) : null, [geminiApiKey]);

  const [mode, setMode] = useState<Mode>('files');
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedItemType | null>(null);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<SelectedLibraryItemType>('changelog');
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isFlexiTyping, setIsFlexiTyping] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const [showSidebarSheet, setShowSidebarSheet] = useState(false);
  
  const chatPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDb = async () => {
      const count = await db.files.count();
      if (count === 0) {
        await seedDatabase();
      }
    };
    checkDb();
  }, []);

  useEffect(() => {
    if (chatPanelRef.current) {
        chatPanelRef.current.scrollTop = chatPanelRef.current.scrollHeight;
    }
  }, [messages, isFlexiTyping]);
  
  // --- Live Data from Dexie ---
  const features = useLiveQuery(() => db.files.where('id').startsWith('features/').toArray().then(files => files.map(f => JSON.parse(f.content) as Feature)), []) || [];
  const pages = useLiveQuery(() => db.files.where('id').startsWith('pages/').toArray().then(files => files.map(f => JSON.parse(f.content) as Page)), []) || [];
  const database = useLiveQuery(() => db.files.where('id').startsWith('database/').toArray().then(files => files.map(f => JSON.parse(f.content) as DatabaseTable)), []) || [];
  const documentation = useLiveQuery(() => db.files.where('id').startsWith('library/docs/').toArray().then(files => files.map(f => JSON.parse(f.content) as Documentation)), []) || [];
  const changelog = useLiveQuery(async () => {
      const file = await db.files.get('library/changelog');
      return file ? JSON.parse(file.content) as ChangelogEntry[] : [];
  }, []) || [];
  const roadmap = useLiveQuery(async () => {
      const file = await db.files.get('library/roadmap');
      return file ? JSON.parse(file.content) as RoadmapPhase[] : [];
  }, []) || [];
   const vision = useLiveQuery(async () => {
      const file = await db.files.get('library/vision');
      return file ? JSON.parse(file.content) : null;
  }, null);
   const architecture = useLiveQuery(async () => {
      const file = await db.files.get('library/architecture');
      return file ? JSON.parse(file.content) : null;
  }, null);


  const handleSaveKeys = (geminiKey: string, githubToken: string) => {
    localStorage.setItem('geminiApiKey', geminiKey);
    localStorage.setItem('githubPat', githubToken);
    setGeminiApiKey(geminiKey);
    setGithubPat(githubToken);
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !aiClient) return;

    const userMessage: Message = { role: 'user', content: messageInput };
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsFlexiTyping(true);

    try {
        const response = await getFlexiResponse(aiClient, userMessage.content);
        const assistantMessage: Message = { role: 'assistant', content: response };
        setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
        console.error(error);
        const errorMessage: Message = { role: 'assistant', content: "I'm sorry, something went wrong." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsFlexiTyping(false);
    }
  }, [messageInput, aiClient]);
  
  const handleSelectItem = useCallback((item: SelectableItem, type: SelectedItemType) => {
      setSelectedItem(item);
      setSelectedType(type);
      setShowSidebarSheet(false);
  }, []);

  const handleSelectLibraryItem = useCallback((type: SelectedLibraryItemType, doc: Documentation | null = null) => {
      setSelectedLibraryItem(type);
      setSelectedDoc(doc);
      setShowSidebarSheet(false);
  }, []);

  const getFeatureName = (id: number): string => features.find(f => f.id === id)?.name || 'Unknown Feature';
  
  const handleQuickStart = (message: string) => {
    setMessageInput(message);
    setTimeout(() => {
        if (aiClient) {
            const sendMessageWithPrompt = async () => {
                const userMessage: Message = { role: 'user', content: message };
                setMessages(prev => [...prev, userMessage]);
                setMessageInput('');
                setIsFlexiTyping(true);
                try {
                const response = await getFlexiResponse(aiClient, message);
                const assistantMessage: Message = { role: 'assistant', content: response };
                setMessages(prev => [...prev, assistantMessage]);
                } catch (error) {
                console.error(error);
                const errorMessage: Message = { role: 'assistant', content: "I'm sorry, something went wrong." };
                setMessages(prev => [...prev, errorMessage]);
                } finally {
                setIsFlexiTyping(false);
                }
            };
            sendMessageWithPrompt();
        }
    }, 0);
  };

  const handleBuildProject = useCallback(async () => {
    if (!githubPat) {
        alert("GitHub Personal Access Token is not set.");
        return;
    }
    const projectName = prompt("Enter a name for your new GitHub repository (e.g., hospital-management-specs):");
    if (!projectName || !projectName.trim()) return;
    
    setIsBuilding(true);
    try {
        const repoData = await createGitHubRepo(githubPat, projectName.trim());
        const owner = repoData.owner.login;

        const allFiles = await db.files.toArray();
        const repoFiles = allFiles.map(file => {
            const path = `${file.id.replace(/\//g, '-')}.json`; // Simple flattening
            return { path, content: file.content };
        });

        await createFilesInRepo(githubPat, owner, projectName.trim(), repoFiles, "Initial commit from FlexOS Builder");
        
        alert(`Successfully created and populated repository!\n\nYou can view it at: ${repoData.html_url}`);

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Failed to build project:", error);
        alert(`Error: ${message}`);
    } finally {
        setIsBuilding(false);
    }
}, [githubPat]);


  if (!geminiApiKey || !githubPat) {
    return <SetupModal onSave={handleSaveKeys} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-primary text-text-primary">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <MobileHeader 
        mode={mode} 
        setMode={setMode} 
        onMenuClick={() => setShowSidebarSheet(true)}
        onBuildProject={handleBuildProject}
        isBuilding={isBuilding}
      />

      <div className="hidden md:flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          mode={mode}
          setMode={setMode}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onSelectItem={handleSelectItem}
          selectedLibraryItem={selectedLibraryItem}
          selectedDoc={selectedDoc}
          onSelectLibraryItem={handleSelectLibraryItem}
          features={features}
          pages={pages}
          database={database}
          documentation={documentation}
          onBuildProject={handleBuildProject}
          isBuilding={isBuilding}
        />

        <main className="flex-1 flex overflow-hidden">
            {mode === 'files' ? (
                <>
                    <ChatPanel
                        ref={chatPanelRef}
                        messages={messages}
                        isFlexiTyping={isFlexiTyping}
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        onSendMessage={handleSendMessage}
                        onQuickStart={handleQuickStart}
                        selectedItem={selectedItem}
                        onClearContext={() => { setSelectedItem(null); setSelectedType(null); }}
                    />
                    <SpecPanel ai={aiClient} selectedItem={selectedItem} selectedType={selectedType} getFeatureName={getFeatureName} />
                </>
            ) : (
                <LibraryPanel 
                    selectedLibraryItem={selectedLibraryItem} 
                    selectedDoc={selectedDoc}
                    changelog={changelog}
                    roadmap={roadmap}
                    vision={vision}
                    architecture={architecture}
                />
            )}
        </main>
      </div>

      <div className="md:hidden flex-1 flex flex-col overflow-hidden relative z-10">
         {mode === 'files' ? (
             <ChatPanel
                ref={chatPanelRef}
                messages={messages}
                isFlexiTyping={isFlexiTyping}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={handleSendMessage}
                onQuickStart={handleQuickStart}
                selectedItem={selectedItem}
                onClearContext={() => { setSelectedItem(null); setSelectedType(null); }}
              />
          ) : (
              <LibraryPanel 
                selectedLibraryItem={selectedLibraryItem} 
                selectedDoc={selectedDoc}
                changelog={changelog}
                roadmap={roadmap}
                vision={vision}
                architecture={architecture}
                isMobile
              />
          )}
      </div>

      <MobileSheet isOpen={showSidebarSheet} onClose={() => setShowSidebarSheet(false)}>
        <Sidebar
            isMobile
            mode={mode}
            setMode={setMode}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onSelectItem={handleSelectItem}
            selectedLibraryItem={selectedLibraryItem}
            selectedDoc={selectedDoc}
            onSelectLibraryItem={handleSelectLibraryItem}
            features={features}
            pages={pages}
            database={database}
            documentation={documentation}
            onBuildProject={handleBuildProject}
            isBuilding={isBuilding}
        />
      </MobileSheet>
    </div>
  );
}
