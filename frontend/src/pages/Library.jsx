import React, { useRef, useState, useMemo } from 'react';
import { Upload, Search, Plus, Filter, LayoutGrid, List, Download, Trash2, X, CheckCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { LibraryFileRow } from '../components/library/LibraryFileRow';
import { LibraryFileCard } from '../components/library/LibraryFileCard';
import { cn } from '../utils/cn';

const Library = () => {
  const { libraryFiles, uploadLibraryFiles, deleteLibraryFile } = useChat();
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const clearSelection = () => setSelectedIds([]);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleDeleteFile = async (id) => {
    await deleteLibraryFile(id);
    showToast('File deleted');
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} file(s)? This can't be undone.`)) return;
    const count = selectedIds.length;
    for (const id of selectedIds) {
      await deleteLibraryFile(id);
    }
    clearSelection();
    showToast(`${count} file${count > 1 ? 's' : ''} deleted`);
  };

  const handleBulkDownload = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    selectedIds.forEach(id => {
      const file = libraryFiles.find(f => f.id === id);
      if (!file) return;
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${file.file_path}`;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadLibraryFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredFiles = useMemo(() => {
    return libraryFiles.filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'images') {
        matchesTab = file.file_type === 'image';
      } else if (activeTab === 'documents') {
        matchesTab = ['pdf', 'document', 'code'].includes(file.file_type); // Grouping pdf/doc/code under documents
      }
      
      return matchesSearch && matchesTab;
    });
  }, [libraryFiles, searchQuery, activeTab]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-green-600 text-white pl-4 pr-2 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle size={18} />
          {toastMessage}
          <button
            onClick={() => setToastMessage('')}
            className="ml-1 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip,.py,.js,.jsx,.ts,.tsx,.html,.css,.json,.java,.c,.cpp,.go,.rb,.php,.sql,.sh,.yml,.yaml,.md"
      />

      {/* Header Section */}
      <div className="px-6 md:px-8 pt-6 pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text)] mb-1">Library</h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--border)] transition-colors"
              />
            </div>

            <button
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shrink-0"
              style={{ background: '#111827', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111827'; }}
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Views */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0",
                activeTab === 'all' 
                  ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-sm" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-transparent"
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0",
                activeTab === 'images' 
                  ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-sm" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-transparent"
              )}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0",
                activeTab === 'documents' 
                  ? "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-sm" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-transparent"
              )}
            >
              Documents
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer" title="Filter">
              <Filter size={18} />
            </button>
            <div className="w-px h-5 bg-[var(--border)] mx-1" />
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                viewMode === 'grid' ? "text-[var(--primary)] bg-[var(--surface-2)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                viewMode === 'list' ? "text-[var(--primary)] bg-[var(--surface-2)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="px-6 md:px-8 pb-4 shrink-0 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={handleBulkDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:bg-[var(--hover)] transition-colors"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <div className="flex items-center gap-1 ml-2 text-sm text-[var(--text-secondary)]">
            {selectedIds.length} selected
            <button onClick={clearSelection} className="p-1 rounded-full hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* List Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 mt-20">
            <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[var(--border)]">
              <Upload size={32} className="text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
              {searchQuery || activeTab !== 'all' ? 'No matching files' : 'No files uploaded yet'}
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
              {searchQuery || activeTab !== 'all'
                ? 'Try adjusting your search terms or filters.' 
                : 'Files you upload here or attach in chats will show up in your Library.'}
            </p>
            {(!searchQuery && activeTab === 'all') && (
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl transition-all font-medium shadow-sm"
              >
                <Upload size={20} />
                Upload Files
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="animate-in fade-in duration-500 w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFiles.map(file => (
              <LibraryFileCard
                key={file.id}
                file={file}
                isSelected={selectedIds.includes(file.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
            {/* Table Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <div>Name</div>
              <div className="flex items-center gap-6 pr-12">
                <div className="w-32 text-right">Uploaded</div>
                <div className="w-24 text-right">Size</div>
              </div>
            </div>
            
            {/* Rows */}
            <div className="flex flex-col">
              {filteredFiles.map(file => (
                <LibraryFileRow
                  key={file.id}
                  file={file}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
