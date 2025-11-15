
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import type { Mode, Message, SelectableItem, SelectedItemType, SelectedLibraryItemType, Documentation, VFile, Feature, Page, DatabaseTable, ChangelogEntry, RoadmapPhase } from './types';
import * as seedData from './constants';
import { getAiClient, getFlexiResponse, generateHtmlPreview } from './services/geminiService';
import { createGitHubRepo, getRepoContents, pushToRepo } from './githubService';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { SpecPanel } from './components/SpecPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { MobileHeader } from './components/MobileHeader';
import { MobileSheet } from './components/MobileSheet';
import { SetupModal } from './components/SetupModal';
import { GitHubSync } from './components/GitHubSync';

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

  const [syncedRepo, setSyncedRepo] = useState<{owner: string, repo: string} | null>(() => {
    const saved = localStorage.getItem('syncedRepo');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [mode, setMode] = useState<Mode>('files');
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedItemType | null>(null);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<SelectedLibraryItemType>('changelog');
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isFlexiTyping, setIsFlexiTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [showSidebarSheet, setShowSidebarSheet] = useState(false);
  
  const chatPanelRef = useRef<HTMLDivElement>(null);
  
  const allFiles = useLiveQuery(() => db.files.toArray(), []);

  useEffect(() => {
    const checkDb = async () => {
      const count = await db.files.count();
      const isRepoSynced = !!localStorage.getItem('syncedRepo');
      if (count === 0 && !isRepoSynced) {
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

  useEffect(() => {
      if (syncedRepo) {
          localStorage.setItem('syncedRepo', JSON.stringify(syncedRepo));
      } else {
          localStorage.removeItem('syncedRepo');
      }
  }, [syncedRepo]);
  
  // --- Live Data from Dexie ---
  const features = useLiveQuery(() => 
      db.files.where('id').startsWith('features/').toArray().then(files => 
          files.map(f => JSON.parse(f.content) as Feature)), 
  []) || [];
  
  const pages = useLiveQuery(() => 
      db.files.where('id').startsWith('pages/').toArray().then(files => 
          files.map(f => JSON.parse(f.content) as Page)), 
  []) || [];

  const database = useLiveQuery(() => 
      db.files.where('id').startsWith('database/').toArray().then(files => 
          files.map(f => JSON.parse(f.content) as DatabaseTable)), 
  []) || [];

  const documentation = useLiveQuery(() => 
      db.files.where('id').startsWith('library/docs/').toArray().then(files => 
          files.map(f => JSON.parse(f.content) as Documentation)), 
  []) || [];

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
  }, []);

   const architecture = useLiveQuery(async () => {
      const file = await db.files.get('library/architecture');
      return file ? JSON.parse(file.content) : null;
  }, []);


  const handleSaveKeys = (geminiKey: string, githubToken: string) => {
    localStorage.setItem('geminiApiKey', geminiKey);
    localStorage.setItem('githubPat', githubToken);
    setGeminiApiKey(geminiKey);
    setGithubPat(githubToken);
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !aiClient || !allFiles) return;

    const userMessage: Message = { role: 'user', content: messageInput };
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsFlexiTyping(true);

    try {
        const aiResponse = await getFlexiResponse(aiClient, userMessage.content, allFiles);
        
        const assistantMessage: Message = { role: 'assistant', content: aiResponse.chatResponse };
        setMessages(prev => [...prev, assistantMessage]);

        if (aiResponse.fileOperations && aiResponse.fileOperations.length > 0) {
            for (const op of aiResponse.fileOperations) {
                if (op.action === 'write') {
                    await db.files.put(op.file);
                } else if (op.action === 'delete') {
                    await db.files.delete(op.file.id);
                }
            }
        }

    } catch (error) {
        console.error(error);
        const errorMessage: Message = { role: 'assistant', content: "I'm sorry, something went wrong. I couldn't process that request." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsFlexiTyping(false);
    }
  }, [messageInput, aiClient, allFiles]);
  
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
        if (aiClient && allFiles) {
            // This is a bit repetitive, but ensures the state is captured correctly for the async call
            handleSendMessage();
        }
    }, 100); // Small delay to allow state to update before sending
  };
  
  // --- GitHub Sync Handlers ---
  const handleCloneRepo = useCallback(async (repoUrl: string) => {
    if (!githubPat) {
        alert("GitHub PAT not set.");
        return;
    }
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
        alert("Invalid GitHub URL format. Use https://github.com/owner/repo");
        return;
    }
    const [, owner, repo] = match;
    setIsSyncing(true);
    try {
        const files = await getRepoContents(githubPat, owner, repo.replace('.git', ''));
        await db.files.clear();
        if (files.length > 0) {
            await db.files.bulkPut(files);
        }
        setSyncedRepo({ owner, repo });
        alert(`Successfully cloned ${owner}/${repo} and updated local state.`);
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        alert(`Error cloning repository: ${message}`);
    } finally {
        setIsSyncing(false);
    }
  }, [githubPat]);

  const handleCreateAndSyncRepo = useCallback(async (repoName: string) => {
      if (!githubPat || !allFiles) return;
      setIsSyncing(true);
      try {
          const repoData = await createGitHubRepo(githubPat, repoName);
          const { owner: { login: owner } } = repoData;
          await pushToRepo(githubPat, owner, repoName, allFiles, "Initial commit from FlexOS Builder");
          setSyncedRepo({ owner, repo: repoName });
          alert(`Successfully created and synced ${owner}/${repoName}.`);
      } catch(e) {
          const message = e instanceof Error ? e.message : "An unknown error occurred.";
          alert(`Error creating repository: ${message}`);
      } finally {
          setIsSyncing(false);
      }
  }, [githubPat, allFiles]);

  const handlePushToRepo = useCallback(async () => {
    if (!githubPat || !syncedRepo || !allFiles) {
        alert("Not connected to a repository or missing PAT.");
        return;
    }
    setIsSyncing(true);
    try {
        const commitMessage = prompt("Enter a commit message:", `Update specs from FlexOS ${new Date().toISOString()}`);
        if (!commitMessage) {
            setIsSyncing(false);
            return;
        }
        await pushToRepo(githubPat, syncedRepo.owner, syncedRepo.repo, allFiles, commitMessage);
        alert("Successfully pushed changes to GitHub.");
    } catch(e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        alert(`Error pushing to repository: ${message}`);
    } finally {
        setIsSyncing(false);
    }
  }, [githubPat, syncedRepo, allFiles]);


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
        onBuildClick={handlePushToRepo}
        isBuilding={isSyncing}
        isRepoConnected={!!syncedRepo}
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
        >
            <GitHubSync 
                syncedRepo={syncedRepo}
                onClone={handleCloneRepo}
                onCreate={handleCreateAndSyncRepo}
                onPush={handlePushToRepo}
                isSyncing={isSyncing}
            />
        </Sidebar>

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
        >
             <GitHubSync 
                syncedRepo={syncedRepo}
                onClone={handleCloneRepo}
                onCreate={handleCreateAndSyncRepo}
                onPush={handlePushToRepo}
                isSyncing={isSyncing}
            />
        </Sidebar>
      </MobileSheet>
    </div>
  );
}
