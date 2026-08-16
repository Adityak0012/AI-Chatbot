import React, { useState } from 'react';
import { FileImage, FileText, FileCode, File as FileIcon, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ICONS = {
  image: FileImage,
  pdf: FileText,
  code: FileCode,
  document: FileIcon,
};

const formatBytes = (bytes, decimals = 1) => {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return 'Unknown size';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const LibraryFileRow = ({ file, onDelete }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const Icon = ICONS[file.file_type] || FileIcon;
  const fileUrl = `${API_BASE_URL}${file.file_path}`;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(file.id);
    setOpenDropdown(false);
  };

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm shrink-0 border border-[var(--border)]">
          <Icon size={16} />
        </div>
        
        <span className="text-[14px] font-semibold text-[var(--text)] truncate">
          {file.filename}
        </span>
      </div>

      <div className="flex items-center gap-6 shrink-0 pl-4">
        <span className="text-sm text-[var(--text-secondary)] w-32 text-right">
          {format(new Date(file.created_at), 'MMM d, h:mm a')}
        </span>

        <span className="text-sm text-[var(--text-secondary)] w-24 text-right">
          {formatBytes(file.file_size)}
        </span>
        
        <div className="relative flex items-center justify-end w-8">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenDropdown(!openDropdown);
            }}
            className={`p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition-all ${openDropdown ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title="More options"
          >
            <MoreHorizontal size={18} />
          </button>

          <AnimatePresence>
            {openDropdown && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdown(false); }} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
                >
                  <a
                    href={fileUrl}
                    download
                    onClick={(e) => {
                      e.stopPropagation(); // let default download action happen
                      setOpenDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                  >
                    <Download size={14} className="text-[var(--text-secondary)]" />
                    Download
                  </a>
                  
                  <div className="h-px bg-[var(--border)] my-1 mx-2" />
                  
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-[var(--hover)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </a>
  );
};
