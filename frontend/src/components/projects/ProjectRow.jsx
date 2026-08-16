import React, { useState } from 'react';
import { Folder, Pencil, Trash2, Check, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectRow = ({ project, onClick, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditName(project.name);
    setIsEditing(true);
    setOpenDropdown(false);
  };

  const handleEditSave = (e) => {
    e.stopPropagation();
    if (editName.trim() && editName.trim() !== project.name) {
      onRename(project.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditName(project.name);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project.id);
    setOpenDropdown(false);
  };

  return (
    <div 
      onClick={!isEditing ? onClick : undefined}
      className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm shrink-0 border border-[var(--border)]">
          <Folder size={16} />
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSave(e);
              if (e.key === 'Escape') handleEditCancel(e);
            }}
            onBlur={handleEditSave}
            className="flex-1 max-w-sm bg-[var(--surface)] border border-[var(--primary)] rounded px-2 py-1 text-[14px] font-medium text-[var(--text)] focus:outline-none min-w-0"
            autoFocus
          />
        ) : (
          <span className="text-[14px] font-semibold text-[var(--text)] truncate">
            {project.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 shrink-0 pl-4">
        <span className="text-sm text-[var(--text-secondary)] w-20 text-right">
          {format(new Date(project.updated_at), 'MMM d')}
        </span>
        
        <div className="relative flex items-center justify-end w-8">
          {isEditing ? (
            <button onClick={handleEditSave} className="p-1.5 text-green-500 hover:bg-[var(--surface)] rounded-md transition-all" title="Save">
              <Check size={16} />
            </button>
          ) : (
            <>
              <button 
                onClick={(e) => {
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
                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdown(false); }} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
                    >
                      <button
                        onClick={handleEditStart}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Pencil size={14} className="text-[var(--text-secondary)]" />
                        Rename
                      </button>
                      
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
