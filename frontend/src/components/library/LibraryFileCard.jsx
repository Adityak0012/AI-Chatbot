import React from 'react';
import { FileImage, FileText, FileCode, File as FileIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ICONS = {
  image: FileImage,
  pdf: FileText,
  code: FileCode,
  document: FileIcon,
};

export const LibraryFileCard = ({ file, isSelected, onToggleSelect }) => {
  const Icon = ICONS[file.file_type] || FileIcon;
  const fileUrl = `${API_BASE_URL}${file.file_path}`;
  const isImage = file.file_type === 'image';

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect(file.id);
  };

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex flex-col rounded-xl border bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors overflow-hidden group",
        isSelected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40" : "border-[var(--border)]"
      )}
    >
      <button
        onClick={handleCheckboxClick}
        className={cn(
          "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
          isSelected
            ? "bg-[var(--primary)] border-[var(--primary)] opacity-100"
            : "bg-black/40 border-white/70 opacity-0 group-hover:opacity-100"
        )}
        title={isSelected ? "Deselect" : "Select"}
      >
        {isSelected && <Check size={14} className="text-white" />}
      </button>

      <div className="aspect-square w-full bg-[var(--surface-2)] flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={fileUrl} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Icon size={40} className="text-[var(--text-secondary)]" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[var(--text)] truncate">{file.filename}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {format(new Date(file.created_at), 'MMM d, h:mm a')}
        </p>
      </div>
    </a>
  );
};
