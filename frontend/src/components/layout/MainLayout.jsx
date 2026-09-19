import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Plus, ChevronDown, Download, FileText, FileDown, Share2, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { handleNewChat, messages, sessions, currentSessionId } = useChat();

  const currentSession = sessions?.find(s => s.id === currentSessionId);
  const chatTitle = currentSession?.title || 'Chat Export';

  const exportAsMarkdown = () => {
    const lines = messages.map(msg => {
      const role = msg.role === 'ai' ? '**AI**' : '**You**';
      return `${role}:\n\n${msg.content}\n\n---\n`;
    });
    const content = `# ${chatTitle}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${chatTitle}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
      h1 { font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 24px; }
      .message { margin-bottom: 20px; }
      .role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
      .role.user { color: #6366f1; }
      .role.ai { color: #eab308; }
      .content { background: #f8f8f8; border-left: 3px solid #eab308; padding: 12px 16px; border-radius: 0 8px 8px 0; white-space: pre-wrap; font-size: 14px; word-break: break-word; }
      .content.user { border-left-color: #6366f1; background: #f0f0ff; }
      hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    </style>
  </head>
  <body>
    <h1>${chatTitle}</h1>
    ${messages.map(msg => `
      <div class="message">
        <div class="role ${msg.role === 'ai' ? 'ai' : 'user'}">${msg.role === 'ai' ? 'AI Assistant' : 'You'}</div>
        <div class="content ${msg.role === 'ai' ? 'ai' : 'user'}">${msg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div><hr/>
    `).join('')}
  </body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const shareChat = () => {
    const lines = messages.map(msg => {
      const role = msg.role === 'ai' ? 'AI' : 'You';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
    const shareText = `${chatTitle}\n\n${lines}`;

    if (navigator.share) {
      navigator.share({
        title: chatTitle,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

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

          {/* Right side — Export + Mobile new chat */}
          <div className="flex items-center gap-2">
            {isChatPage && messages.length > 0 && (
              <>
                {/* Share button */}
                <button
                  onClick={shareChat}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium transition-all duration-150"
                >
                  {shareCopied ? (
                    <>
                      <Check size={13} className="text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} />
                      Share
                    </>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(prev => !prev)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium transition-all duration-150"
                  >
                    <Download size={13} />
                    Export
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 top-10 z-40 w-48 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="text-xs text-[var(--text-secondary)] font-medium">Export chat as</p>
                        </div>
                        <button
                          onClick={exportAsMarkdown}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          <FileText size={15} className="text-[var(--primary)]" />
                          Markdown (.md)
                        </button>
                        <button
                          onClick={exportAsPDF}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          <FileDown size={15} className="text-[var(--primary)]" />
                          PDF (.html → print)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            <button 
              onClick={handleNewChat}
              className="md:hidden p-2 -mr-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};
