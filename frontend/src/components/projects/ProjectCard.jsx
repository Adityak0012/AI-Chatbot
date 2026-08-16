import React, { useState } from 'react';
import { Folder, Pencil, Trash2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProjectCard = ({ project, onClick, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditName(project.name);
    setIsEditing(true);
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
  };

  return (
    <div 
      onClick={!isEditing ? onClick : undefined}
      className="flex flex-col bg-[var(--surface-2)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[var(--primary)] group text-left h-[160px]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Folder size={20} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleEditSave} className="p-1.5 text-green-500 hover:bg-[var(--surface)] rounded-md transition-all" title="Save">
                <Check size={16} />
              </button>
              <button onClick={handleEditCancel} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface)] rounded-md transition-all" title="Cancel">
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEditStart} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-md transition-all" title="Rename Project">
                <Pencil size={16} />
              </button>
              <button onClick={handleDelete} className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface)] rounded-md transition-all" title="Delete Project">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
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
          className="mb-1 bg-[var(--surface)] border border-[var(--primary)] rounded px-1.5 py-0.5 text-lg font-semibold text-[var(--text)] focus:outline-none"
          autoFocus
        />
      ) : (
        <h3 className="text-lg font-semibold text-[var(--text)] mb-1 truncate">
          {project.name}
        </h3>
      )}
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-auto">
        {project.description || 'No description provided.'}
      </p>
      <div className="mt-3 text-xs text-[var(--text-secondary)] opacity-70 group-hover:opacity-100 transition-opacity">
        Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
};
