
import React from 'react';

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileSheet: React.FC<MobileSheetProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"></div>
      <div 
        className={`md:hidden fixed inset-x-0 bottom-0 top-20 bg-bg-secondary z-50 flex flex-col rounded-t-3xl overflow-hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-4 border-b border-border-primary flex-shrink-0">
          <div className="w-12 h-1 bg-bg-quaternary rounded-full mx-auto mb-4"></div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </>
  );
};
