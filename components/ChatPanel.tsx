
import React, { forwardRef } from 'react';
import type { Message, SelectableItem } from '../types';
import { CloseIcon, AttachmentIcon, SendIcon } from './Icons';

interface ChatPanelProps {
  messages: Message[];
  isFlexiTyping: boolean;
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onQuickStart: (message: string) => void;
  selectedItem: SelectableItem | null;
  onClearContext: () => void;
}

const FlexiAvatar = ({ isTyping }: { isTyping?: boolean }) => (
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E"
        className={`w-8 h-8 rounded-full flex-shrink-0 ${isTyping ? 'typing' : ''}`} alt="Flexi" />
);

const TypingIndicator = () => (
    <div className="flex items-start space-x-3 mb-4 animate-fade-in">
        <FlexiAvatar />
        <div className="rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] bg-bg-tertiary border border-border-primary">
            <div className="typing-dots-animation">
                <span className="w-2 h-2 bg-primary-500 rounded-full inline-block mx-0.5"></span>
                <span className="w-2 h-2 bg-primary-500 rounded-full inline-block mx-0.5"></span>
                <span className="w-2 h-2 bg-primary-500 rounded-full inline-block mx-0.5"></span>
            </div>
        </div>
    </div>
);

const WelcomeScreen: React.FC<{ onQuickStart: (message: string) => void }> = ({ onQuickStart }) => (
    <div className="text-center py-12 animate-fade-in">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E"
            className="w-20 h-20 mx-auto mb-4 flexi-avatar" alt="Flexi" />
        <h3 className="text-xl font-semibold mb-2 text-text-primary">Hey there! I'm Flexi 👋</h3>
        <p className="text-text-tertiary mb-6 max-w-md mx-auto">I'm here to help you build your Hospital Management system. Ask me anything or select an item from the sidebar to get started!</p>
        <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => onQuickStart('Show me the dashboard')} className="px-4 py-2 bg-bg-tertiary hover:bg-bg-quaternary rounded-lg text-sm text-text-secondary transition">
                💬 Show me the dashboard
            </button>
            <button onClick={() => onQuickStart('Add a new feature for billing')} className="px-4 py-2 bg-bg-tertiary hover:bg-bg-quaternary rounded-lg text-sm text-text-secondary transition">
                ✨ Add a new feature
            </button>
            <button onClick={() => onQuickStart('Explain the architecture')} className="px-4 py-2 bg-bg-tertiary hover:bg-bg-quaternary rounded-lg text-sm text-text-secondary transition">
                🏗️ Explain the architecture
            </button>
        </div>
    </div>
);

export const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(({ messages, isFlexiTyping, messageInput, setMessageInput, onSendMessage, onQuickStart, selectedItem, onClearContext }, ref) => {
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };
    
    return (
        <div className="flex-1 flex flex-col bg-bg-primary/50 backdrop-blur-sm">
            <div className="bg-bg-secondary/95 backdrop-blur-sm border-b border-border-primary px-6 py-3 flex-shrink-0 hidden md:block">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EF%3C/text%3E%3C/svg%3E"
                                className={`w-10 h-10 rounded-full flexi-avatar ${isFlexiTyping ? 'typing' : ''}`} alt="Flexi" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-400 rounded-full border-2 border-bg-secondary"></div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Flexi</h2>
                            <p className="text-xs text-text-tertiary">Your AI building companion</p>
                        </div>
                    </div>
                </div>
                 {selectedItem && (
                    <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-l-4 border-primary-500 rounded-lg px-4 py-2 mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">Context: <span className="text-primary-400">{selectedItem.name}</span></span>
                        <button onClick={onClearContext} className="text-text-tertiary hover:text-text-primary transition-colors duration-200"><CloseIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            
            <div ref={ref} className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-6 space-y-4">
                {messages.length === 0 && !isFlexiTyping ? (
                    <WelcomeScreen onQuickStart={onQuickStart} />
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start space-x-3'} mb-4 animate-slide-down`}>
                            {message.role === 'assistant' && <FlexiAvatar />}
                            <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${message.role === 'user' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white ml-auto' : 'bg-bg-tertiary border border-border-primary'}`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))
                )}
                {isFlexiTyping && <TypingIndicator />}
            </div>

            <div className="border-t border-border-primary bg-bg-secondary/95 backdrop-blur-sm flex-shrink-0 p-4">
                <div className="flex items-end space-x-2">
                    <button className="p-3 hover:bg-bg-quaternary rounded-lg text-text-tertiary hover:text-text-primary flex-shrink-0 transition">
                        <AttachmentIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 bg-bg-primary rounded-xl border border-border-primary focus-within:border-primary-500 transition">
                        <textarea 
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedItem ? `Ask Flexi about ${selectedItem.name}...` : 'Ask Flexi anything...'} 
                            rows={1} 
                            className="w-full bg-transparent px-4 py-3 text-sm text-text-primary focus:outline-none resize-none scrollbar-thin" 
                            style={{maxHeight: '120px'}}
                        />
                    </div>
                    <button onClick={onSendMessage} disabled={!messageInput.trim()} className={`p-3 rounded-lg text-white flex-shrink-0 transition ${messageInput.trim() ? 'bg-primary-500 hover:bg-primary-600' : 'bg-bg-quaternary cursor-not-allowed'}`}>
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});
