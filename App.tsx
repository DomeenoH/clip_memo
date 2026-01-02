import React, { useState, useEffect, useMemo, useRef } from 'react';
import NoteInput from './components/NoteInput';
import NoteItem from './components/NoteItem';
import Header from './components/Header';
import AuthGate, { checkAuthToken, getAuthToken, clearAuthToken } from './components/AuthGate';
import { Note, FilterType } from './types';
import { analyzeNoteWithGemini } from './services/geminiService';

const STORAGE_KEY = 'clip_memo_data_v1';

// Helper to group notes by date
const groupNotesByDate = (notes: Note[]) => {
  const groups: { [key: string]: Note[] } = {
    '今天': [],
    '昨天': [],
    '过去七天': [],
    '更早': []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const lastWeek = today - 86400000 * 7;

  notes.forEach(note => {
    if (note.timestamp >= today) {
      groups['今天'].push(note);
    } else if (note.timestamp >= yesterday) {
      groups['昨天'].push(note);
    } else if (note.timestamp >= lastWeek) {
      groups['过去七天'].push(note);
    } else {
      groups['更早'].push(note);
    }
  });

  return groups;
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // UI feedback for network
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuthToken();
      setIsAuthenticated(isValid);
      setIsCheckingAuth(false);
    };
    verifyAuth();
  }, []);

  // Load from Cloud (KV)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchNotes = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`/api/notes?token=${encodeURIComponent(token || '')}`);
        
        if (res.status === 401) {
           clearAuthToken();
           setIsAuthenticated(false);
           return;
        }

        if (res.ok) {
          const cloudNotes = await res.json();
          // Optional: Merge with local storage if needed? 
          // For now, strict cloud source of truth.
          if (Array.isArray(cloudNotes)) {
             setNotes(cloudNotes);
          }
        }
      } catch (e) {
        console.error("Failed to load notes from cloud", e);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchNotes();
  }, [isAuthenticated]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save to Cloud (KV)
  useEffect(() => {
    if (!isAuthenticated || !isLoaded) return;
    
    // Debounce save to avoid too many requests
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        const token = getAuthToken();
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, notes })
        });
      } catch (e) {
        console.error("Failed to save to cloud", e);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [notes, isAuthenticated, isLoaded]);

  const handleAddNote = async (content: string) => {
    const tempId = Date.now().toString();
    const newNote: Note = {
      id: tempId,
      content,
      timestamp: Date.now(),
      isProcessing: true,
    };

    // Optimistic UI update: Add note immediately at the top
    setNotes(prev => [newNote, ...prev]);
    setIsProcessingAI(true);

    try {
      // Analyze with Cloudflare AI (via the updated service)
      const analysis = await analyzeNoteWithGemini(content);
      
      // Update the note with analysis
      setNotes(prev => prev.map(n => 
        n.id === tempId 
          ? { ...n, aiAnalysis: analysis, isProcessing: false }
          : n
      ));
    } catch (error) {
      console.error("AI Analysis failed", error);
      // Ensure processing state is cleared even on error
      setNotes(prev => prev.map(n => 
        n.id === tempId 
          ? { ...n, isProcessing: false }
          : n
      ));
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    // Confirmation is now handled in NoteItem component for better UX
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    const header = `# Clip Memo 导出\n生成时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;
    const content = notes.map(n => {
      const date = new Date(n.timestamp).toLocaleString('zh-CN');
      let meta = '';
      if (n.aiAnalysis?.isTodo) meta += `[待办] `;
      if (n.aiAnalysis?.isResource) meta += `[资源: ${n.aiAnalysis.resourceType || '通用'}] `;
      const tags = n.aiAnalysis?.tags.map(t => `#${t}`).join(' ') || '';
      return `### ${date} ${meta}\n${n.content}\n\n${tags ? `> 标签: ${tags}\n` : ''}\n---\n`;
    }).join('\n');

    const blob = new Blob([header + content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clip-memo-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            note.aiAnalysis?.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (filter === FilterType.TODO) return note.aiAnalysis?.isTodo;
      if (filter === FilterType.RESOURCE) return note.aiAnalysis?.isResource;
      
      return true;
    });
  }, [notes, searchTerm, filter]);

  const groupedNotes = useMemo(() => groupNotesByDate(filteredNotes), [filteredNotes]);
  const hasNotes = notes.length > 0;
  const hasFilteredResults = filteredNotes.length > 0;

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-stone-400 animate-pulse">加载中...</div>
      </div>
    );
  }

  // Show auth gate if not authenticated
  if (!isAuthenticated) {
    return <AuthGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      <Header 
        ref={searchInputRef}
        onExport={handleExport}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        totalNotes={notes.length}
      />
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 bg-stone-800 text-white text-xs px-2 py-1 rounded-full opacity-50 animate-pulse">
            云同步中...
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {!hasNotes ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-medium text-stone-400 mb-2">大脑已清空。</p>
            <p className="text-sm text-stone-400">在下方输入或语音记录想法。</p>
          </div>
        ) : !hasFilteredResults ? (
          <div className="text-center py-10 text-stone-400">
             未找到关于 "{searchTerm}" 的记忆。
             <button 
               onClick={() => setSearchTerm('')} 
               className="block mx-auto mt-2 text-blue-500 hover:underline text-sm"
             >
               清除搜索
             </button>
          </div>
        ) : (
          <div className="space-y-8">
             {Object.entries(groupedNotes).map(([group, groupNotes]: [string, Note[]]) => {
              if (groupNotes.length === 0) return null;
              return (
                <div key={group} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Sticky Header */}
                  <div className="sticky top-[105px] z-30 bg-[#fafafa]/95 backdrop-blur-sm py-2 mb-2 -ml-4 pl-4 border-l-2 border-stone-200 w-[calc(100%+2rem)]">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      {group}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {groupNotes.map(note => (
                      <NoteItem 
                        key={note.id} 
                        note={note} 
                        onDelete={handleDeleteNote}
                        onTagClick={handleTagClick}
                        searchTerm={searchTerm}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <NoteInput onAddNote={handleAddNote} isProcessing={isProcessingAI} />
    </div>
  );
};

export default App;