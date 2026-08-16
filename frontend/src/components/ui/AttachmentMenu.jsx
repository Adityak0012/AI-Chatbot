import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Image as ImageIcon, 
  Folder, 
  Brain, 
  Globe,
  Camera,
  FolderPlus
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../utils/cn';
import { AttachmentModal } from './AttachmentModal';

const MENU_ITEMS = [
  { id: 'files', icon: Folder, label: 'Add files or photos' },
  { id: 'screenshot', icon: Camera, label: 'Take a screenshot' },
  { id: 'project', icon: FolderPlus, label: 'Add to project' },
  { id: 'skills', icon: Brain, label: 'Skills' },
  { id: 'search', icon: Globe, label: 'Web search' }
];

export const SKILLS = [
  { id: 'frontend', label: 'Frontend Development' },
  { id: 'backend', label: 'Backend Development' },
  { id: 'data_science', label: 'Data Science' },
  { id: 'devops', label: 'DevOps' },
  { id: 'mobile', label: 'Mobile Development' },
  { id: 'ui_ux', label: 'UI/UX Design' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'machine_learning', label: 'Machine Learning' },
];

export const AttachmentMenu = ({ onFilesSelected, activeSkill, onSkillChange, isWebSearchOn, onWebSearchToggle, currentSessionId }) => {
  const { projects, fetchProjects, assignSessionToProject } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [menuView, setMenuView] = useState('main');
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    content: ''
  });

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setMenuView('main');
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setMenuView('main');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      if (onFilesSelected) onFilesSelected(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTakeScreenshot = async () => {
    setIsOpen(false);
    try {
      const target = document.querySelector('#chat-messages-area') || document.body;
      const canvas = await html2canvas(target, { backgroundColor: null, useCORS: true });
      canvas.toBlob((blob) => {
        if (blob && onFilesSelected) {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
          onFilesSelected([file]);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  const handleItemClick = async (id) => {
    switch (id) {
      case 'files':
        fileInputRef.current?.click();
        setIsOpen(false);
        break;
      case 'screenshot':
        handleTakeScreenshot();
        break;
      case 'project':
        await fetchProjects();
        setMenuView('project');
        break;
      case 'skills':
        setMenuView('skills');
        break;

      case 'search':
        onWebSearchToggle();
        // Do not close popup automatically for toggle actions so user can see it change
        break;
      default:
        setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 mb-1 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors rounded-xl hover:bg-[var(--surface-2)]",
            isOpen && "bg-[var(--surface-2)] text-[var(--text)]"
          )}
          title="Attach files"
        >
          <Paperclip size={20} />
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip,audio/*,video/*"
        />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full left-0 md:-left-2 mb-3 w-56 sm:w-64 p-2 rounded-2xl bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 origin-bottom-left"
            >
              <div className="flex flex-col space-y-0.5">
                {menuView === 'main' && (
                  MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = (item.id === 'search' && isWebSearchOn) || (item.id === 'skills' && !!activeSkill);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-medium transition-colors group",
                          isActive 
                            ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                            : "text-[var(--text)] hover:bg-[var(--hover)]"
                        )}
                      >
                        <Icon 
                          size={18} 
                          className={cn(
                            "transition-colors shrink-0",
                            isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text)]"
                          )} 
                        />
                        <span className="truncate">
                          {item.label}
                          {item.id === 'search' && isActive && " (ON)"}
                          {item.id === 'skills' && activeSkill && ` (${SKILLS.find(s => s.id === activeSkill)?.label})`}
                        </span>
                      </button>
                    );
                  })
                )}
                {menuView === 'skills' && (
                  <>
                    <button
                      onClick={() => setMenuView('main')}
                      className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--hover)] mb-1"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => { onSkillChange(null); setIsOpen(false); setMenuView('main'); }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-medium transition-colors",
                        !activeSkill ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                      )}
                    >
                      None
                    </button>
                    {SKILLS.map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => { onSkillChange(skill.id); setIsOpen(false); setMenuView('main'); }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-medium transition-colors",
                          activeSkill === skill.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                        )}
                      >
                        {skill.label}
                      </button>
                    ))}
                  </>
                )}
                {menuView === 'project' && (
                  <>
                    <button
                      onClick={() => setMenuView('main')}
                      className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--hover)] mb-1"
                    >
                      ← Back
                    </button>
                    {projects.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">No projects yet</div>
                    ) : (
                      projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={async () => {
                            if (currentSessionId) {
                              await assignSessionToProject(currentSessionId, project.id);
                            }
                            setIsOpen(false);
                            setMenuView('main');
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          {project.name}
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AttachmentModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        content={modalConfig.content}
      />
    </>
  );
};
