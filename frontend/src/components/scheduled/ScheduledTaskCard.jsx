import React from 'react';
import { Play, Pause, Edit2, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ScheduledTaskCard = ({ task, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className={`relative flex flex-col p-5 bg-[var(--surface)] border ${task.is_active ? 'border-[var(--border)]' : 'border-[var(--border)] opacity-75'} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group`}>
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[16px] text-[var(--text)] truncate">
              {task.title}
            </h3>
            {task.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                <Pause size={10} />
                Paused
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono bg-[var(--surface-2)] inline-flex px-2 py-1 rounded-md">
            <Clock size={12} />
            {task.cron_expression} ({task.timezone})
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onToggleActive}
            className={`p-1.5 rounded-md transition-colors ${task.is_active ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
            title={task.is_active ? "Pause Schedule" : "Resume Schedule"}
          >
            {task.is_active ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            onClick={onEdit}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-md transition-colors"
            title="Edit Task"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface-2)] rounded-md transition-colors"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 mt-2">
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
          {task.prompt}
        </p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
      </div>
    </div>
  );
};

export default ScheduledTaskCard;
