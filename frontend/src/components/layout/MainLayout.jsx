import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Plus, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { handleNewChat } = useChat();

  return (
    <div className="flex w-screen h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans transition-colors duration-300">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg)] relative shadow-[-10px_0_20px_-10px_var(--shadow)] z-10 transition-colors duration-300">
        <div className="flex items-center justify-between p-3 md:p-4 shrink-0 bg-transparent z-20 border-b border-transparent absolute top-0 left-0 right-0">
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            {isChatPage && (
              <div className="flex items-center gap-1 cursor-pointer hover:bg-[var(--hover)] px-1.5 py-1 md:px-2 md:py-1 rounded-lg transition-colors -ml-3 -mt-1">
                <span className="font-[600] text-[18px] text-[var(--text)]">Chatbot</span>
                <ChevronDown size={20} className="text-[var(--text-secondary)] opacity-70" />
              </div>
            )}
          </div>
          <button 
            onClick={handleNewChat}
            className="md:hidden p-2 -mr-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] rounded-lg transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};
