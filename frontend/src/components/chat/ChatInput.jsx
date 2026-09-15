import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Square, X, FileText, ChevronUp, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { cn } from '../../utils/cn';
import { AttachmentMenu } from '../ui/AttachmentMenu';

export const ChatInput = ({ onSend, isSending, currentSessionId }) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [effort, setEffort] = useState(() => localStorage.getItem('chat_effort') || 'medium');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [menuView, setMenuView] = useState('main');
  const [activeSkill, setActiveSkill] = useState(() => localStorage.getItem('chat_skill') || null);
  const [webSearchOn, setWebSearchOn] = useState(false);

  useEffect(() => {
    if (activeSkill) {
      localStorage.setItem('chat_skill', activeSkill);
    } else {
      localStorage.removeItem('chat_skill');
    }
  }, [activeSkill]);

  const textAreaRef = useAutoResizeTextArea(input);

  const EFFORT_OPTIONS = [
    { id: 'low', label: 'Low', description: 'Short, quick answers' },
    { id: 'medium', label: 'Medium', description: 'Balanced (default)' },
    { id: 'high', label: 'High', description: 'Thorough, detailed answers' },
  ];

  const handleSelectEffort = (id) => {
    setEffort(id);
    localStorage.setItem('chat_effort', id);
    setMenuView('main');
  };

  const MODEL_OPTIONS = [
    { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', description: 'Flagship, best quality (default)' },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Large, versatile' },
    { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', description: 'Smaller, faster' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', description: 'Fastest, lightweight' },
  ];

  const [model, setModel] = useState(() => localStorage.getItem('chat_model') || MODEL_OPTIONS[0].id);

  const handleSelectModel = (id) => {
    setModel(id);
    localStorage.setItem('chat_model', id);
    setIsPickerOpen(false);
    setMenuView('main');
  };

  const currentModelOption = MODEL_OPTIONS.find(m => m.id === model) || MODEL_OPTIONS[0];
  const currentEffortOption = EFFORT_OPTIONS.find(e => e.id === effort) || EFFORT_OPTIONS[1];

  // Holds the text that existed before the current speech segment started,
  // so live (interim) words can be shown without being lost or duplicated.
  const baseTextRef = useRef('');

  const handleTranscript = useCallback(({ final, interim }) => {
    if (final) {
      baseTextRef.current = baseTextRef.current
        ? baseTextRef.current + ' ' + final
        : final;
      setInput(baseTextRef.current);
    } else if (interim) {
      setInput(
        baseTextRef.current
          ? baseTextRef.current + ' ' + interim
          : interim
      );
    }
  }, []);

  const { isListening, supported, toggleListening } = useSpeechToText(handleTranscript);

  // Capture whatever was already typed the moment listening starts, so
  // speech gets appended to it instead of overwriting it.
  useEffect(() => {
    if (isListening) {
      baseTextRef.current = input;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || isSending) return;
    onSend(input, files, effort, model, null, activeSkill, webSearchOn);
    setInput('');
    setFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const [fileError, setFileError] = useState('');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndAddFiles = (newFiles) => {
    setFileError('');
    const valid = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`File type not supported: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File too large (max 10MB): ${file.name}`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      validateAndAddFiles(Array.from(e.clipboardData.files));
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-4 pt-4 pb-6 flex flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        "relative flex flex-col bg-[var(--surface)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transition-all focus-within:ring-2 focus-within:ring-[var(--primary)]/50 focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.16)]",
        isDragging ? "border-[var(--primary)] border-dashed border-2 bg-[var(--primary)]/5" : "border-[var(--border)]"
      )}>
        {fileError && (
          <div className="px-4 pt-2 pb-0">
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {fileError}
            </div>
          </div>
        )}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--surface)]/90 rounded-2xl pointer-events-none">
            <p className="text-sm font-medium text-[var(--primary)]">Drop files to attach</p>
          </div>
        )}

        {/* Image Preview Strip */}
        {files.length > 0 && (
          <div className="flex gap-3 p-3 pb-0 overflow-x-auto custom-scrollbar">
            {files.map((file, index) => (
              <div key={index} className="relative group w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm flex items-center justify-center bg-[var(--surface-2)]">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <FileText size={24} className="text-[var(--text-secondary)]" />
                )}
                <button 
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} 
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-2 pl-4">
          <AttachmentMenu onFilesSelected={(newFiles) => validateAndAddFiles(newFiles)} activeSkill={activeSkill} onSkillChange={setActiveSkill} isWebSearchOn={webSearchOn} onWebSearchToggle={() => setWebSearchOn(prev => !prev)} currentSessionId={currentSessionId} />

          <textarea
            ref={textAreaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message AI Chatbot Pro..."
            className="flex-1 max-h-[200px] bg-transparent border-none focus:ring-0 resize-none py-3 text-[var(--text)] placeholder-[var(--placeholder)] outline-none text-base custom-scrollbar"
            rows={1}
            disabled={isSending}
          />

        <div className="flex items-center gap-1 mb-1">
          <div className="relative">
            <button
              onClick={() => { setIsPickerOpen(prev => !prev); setMenuView('main'); }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              title="Model & effort"
            >
              <span className="hidden sm:inline text-[var(--text)]">{currentModelOption.label}</span>
              <span>{currentEffortOption.label}</span>
              <ChevronUp size={12} className={cn("transition-transform", isPickerOpen ? "rotate-0" : "rotate-180")} />
            </button>

            {isPickerOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
                <div className="absolute bottom-full mb-2 left-0 z-40 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-1.5">
                  {menuView === 'main' && (
                    <>
                      <div className="px-3 py-2.5 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{currentModelOption.label}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{currentModelOption.description}</p>
                        </div>
                        <Check size={16} className="text-[var(--primary)] mt-0.5 shrink-0" />
                      </div>
                      <div className="h-px bg-[var(--border)] my-1" />
                      <button
                        onClick={() => setMenuView('effort')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <span>Effort</span>
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          {currentEffortOption.label}
                          <ChevronRight size={14} />
                        </span>
                      </button>
                      <button
                        onClick={() => setMenuView('models')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <span>More models</span>
                        <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                      </button>
                    </>
                  )}

                  {menuView === 'effort' && (
                    <>
                      <button
                        onClick={() => setMenuView('main')}
                        className="w-full flex items-center gap-1 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)]"
                      >
                        <ChevronLeft size={14} /> Effort
                      </button>
                      <div className="h-px bg-[var(--border)] my-1" />
                      {EFFORT_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectEffort(opt.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                            effort === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{opt.description}</p>
                          </div>
                          {effort === opt.id && <Check size={16} />}
                        </button>
                      ))}
                    </>
                  )}

                  {menuView === 'models' && (
                    <>
                      <button
                        onClick={() => setMenuView('main')}
                        className="w-full flex items-center gap-1 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)]"
                      >
                        <ChevronLeft size={14} /> More models
                      </button>
                      <div className="h-px bg-[var(--border)] my-1" />
                      {MODEL_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectModel(opt.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                            model === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{opt.description}</p>
                          </div>
                          {model === opt.id && <Check size={16} />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {supported && (
            <button
              onClick={toggleListening}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isListening 
                  ? "bg-red-500/10 text-red-500 animate-pulse" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
              title={isListening ? "Stop listening" : "Use microphone"}
            >
              <Mic size={20} />
            </button>
          )}

          {isSending ? (
            <button
              className="p-2 bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-xl transition-colors"
              title="Stop generating (UI only)"
            >
              <Square size={20} fill="currentColor" className="scale-75" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={(!input.trim() && files.length === 0)}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
                (input.trim() || files.length > 0)
                  ? "bg-[var(--primary)] text-white hover:opacity-90 shadow-[0_2px_10px_var(--shadow)]"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
              )}
              title="Send message"
            >
              <Send size={20} />
            </button>
          )}
        </div>
        </div>
      </div>
      <div className="text-center mt-3 text-xs text-[var(--text-secondary)]">
        AI Chatbot Pro can make mistakes. Consider verifying important information.
        <span className="ml-2 text-[10px] text-[var(--placeholder)]">{input.length} chars</span>
      </div>
    </div>
  );
};
