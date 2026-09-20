import React, { useState, useMemo } from 'react';
import { Plus, Folder, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { ProjectRow } from '../components/projects/ProjectRow';
import { ProjectModal } from '../components/projects/ProjectModal';
import { cn } from '../utils/cn';

const ProjectsContent = () => {
  const { projects, createProject, deleteProject, renameProject } = useChat();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Section */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text)]">Projects</h1>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search projects"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shrink-0"
                style={{ background: '#111827', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-4">
            {[
              { id: 'all', label: 'All' },
              { id: 'created', label: 'Created by you' },
              { id: 'shared', label: 'Shared with you' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: activeTab === tab.id ? '#111827' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : '#6b7280',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; } }}
                onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 mt-20">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[var(--border)]">
                <Folder size={32} className="text-[var(--text-secondary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
                {searchQuery ? 'No matching projects' : 'No projects yet'}
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms.' 
                  : 'Create your first project to organize your chats effectively.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-lg"
                  style={{ background: '#111827', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <Plus size={20} />
                  New Project
                </button>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 w-full">
              {/* Table Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <div>Name</div>
                <div className="flex items-center gap-6 pr-12">
                  <div className="w-20 text-right">Modified</div>
                </div>
              </div>
              
              {/* Rows */}
              <div className="flex flex-col">
                {filteredProjects.map(project => (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    onDelete={deleteProject}
                    onRename={renameProject}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createProject}
      />
    </>
  );
};

const Projects = () => {
  return (
    <ProjectsContent />
  );
};

export default Projects;
