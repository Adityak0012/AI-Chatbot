import React, { useState, useEffect } from 'react';
import { Clock, Plus, Pause, Play, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import CreateTaskModal from '../components/scheduled/CreateTaskModal';
import ScheduledTaskCard from '../components/scheduled/ScheduledTaskCard';

const ScheduledTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, paused
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/scheduled-tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch scheduled tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdate = async (taskData) => {
    try {
      if (editingTask) {
        await api.patch(`/scheduled-tasks/${editingTask.id}`, taskData);
      } else {
        await api.post('/scheduled-tasks', taskData);
      }
      fetchTasks();
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (confirm('Are you sure you want to delete this scheduled task?')) {
      try {
        await api.delete(`/scheduled-tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  const handleToggleActive = async (task) => {
    try {
      await api.patch(`/scheduled-tasks/${task.id}`, { is_active: !task.is_active });
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task status', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.is_active;
    if (filter === 'paused') return !task.is_active;
    return true;
  });

  return (
    <>
      <div className="flex flex-col h-full w-full bg-[var(--bg)] text-[var(--text)]">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pt-6 pb-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>Scheduled Tasks</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage automated prompts and recurring AI tasks.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {['all', 'active', 'paused'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-150"
                      style={{
                        background: filter === f ? 'var(--text)' : 'transparent',
                        color: filter === f ? 'var(--bg)' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; } }}
                      onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-95"
                  style={{ background: 'var(--text)', color: 'var(--bg)' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  <Plus size={16} />
                  Create Task
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--border)]"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20 bg-[var(--surface)] rounded-2xl border border-[var(--border)] border-dashed">
                <Clock size={48} className="mx-auto mb-4 opacity-40" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No scheduled tasks found</h3>
                <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                  {filter === 'all' ? "Automate your workflow by creating recurring prompts that run on a schedule." : `You don't have any ${filter} tasks right now.`}
                </p>
                {filter === 'all' && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Plus size={18} />
                    Create your first task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <ScheduledTaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete(task.id)}
                    onToggleActive={() => handleToggleActive(task)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleCreateOrUpdate}
        initialData={editingTask}
      />
    </>
  );
};

export default ScheduledTasks;
