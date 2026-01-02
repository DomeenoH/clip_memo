import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { CheckCircle2, BookOpen, Film, Music, Code, Tag, Loader2, Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  searchTerm?: string;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete, onTagClick, searchTerm }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (showConfirmDelete) {
      const timer = setTimeout(() => setShowConfirmDelete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmDelete]);

  // Auto-reset copy feedback after 2 seconds
  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const date = new Date(note.timestamp);
  const formattedTime = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const getResourceLabel = (type?: string | null) => {
    switch (type) {
      case 'read': return '阅读';
      case 'watch': return '观看';
      case 'listen': return '收听';
      case 'code': return '代码';
      default: return '资源';
    }
  };

  const getResourceIcon = () => {
    if (!note.aiAnalysis?.isResource) return null;
    switch (note.aiAnalysis.resourceType) {
      case 'read': return <BookOpen size={14} className="text-blue-500" />;
      case 'watch': return <Film size={14} className="text-purple-500" />;
      case 'listen': return <Music size={14} className="text-pink-500" />;
      case 'code': return <Code size={14} className="text-green-600" />;
      default: return <BookOpen size={14} className="text-blue-500" />;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(note.content).then(() => {
        setHasCopied(true);
    }).catch(err => {
        console.error('Copy failed', err);
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showConfirmDelete) {
      onDelete(note.id);
    } else {
      setShowConfirmDelete(true);
    }
  };

  // Helper to highlight text simply
  const renderContent = () => {
    if (searchTerm && searchTerm.trim()) {
      const parts = note.content.split(new RegExp(`(${searchTerm})`, 'gi'));
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {parts.map((part, i) => 
            part.toLowerCase() === searchTerm.toLowerCase() 
              ? <mark key={i}>{part}</mark> 
              : part
          )}
        </div>
      );
    }
    
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className="prose prose-stone prose-sm max-w-none text-gray-800 leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 prose-pre:bg-stone-100 prose-pre:text-stone-800 prose-pre:border prose-pre:border-stone-200"
      >
        {note.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      
      {/* Header: Metadata */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 opacity-60 text-xs font-medium text-gray-400">
          <span>{formattedTime}</span>
          {note.isProcessing && (
             <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
               <Loader2 size={10} className="animate-spin" /> AI 分析中
             </span>
          )}
          {!note.isProcessing && note.aiAnalysis?.isTodo && (
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> 待办
            </span>
          )}
          {!note.isProcessing && note.aiAnalysis?.isResource && (
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
              {getResourceIcon()} {getResourceLabel(note.aiAnalysis.resourceType)}
            </span>
          )}
        </div>
        
        {/* Actions: Always visible, subtle by default */}
        <div className="flex gap-1 items-center z-10">
           <button 
             type="button"
             onClick={handleCopy} 
             className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${
                hasCopied 
                ? 'bg-green-50 text-green-600 px-2 ring-1 ring-green-100' 
                : 'text-gray-300 hover:text-stone-600 hover:bg-stone-100'
             }`} 
             title="复制文本"
           >
            {hasCopied ? (
                <>
                    <Check size={12} />
                    <span className="text-xs font-bold whitespace-nowrap">已复制</span>
                </>
            ) : (
                <Copy size={14} />
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleDeleteClick} 
            className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${
                showConfirmDelete 
                ? 'bg-red-50 text-red-600 w-auto px-2 ring-1 ring-red-100' 
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
            }`} 
            title="删除"
          >
            {showConfirmDelete ? (
                <>
                    <AlertCircle size={12} />
                    <span className="text-xs font-bold whitespace-nowrap">确认?</span>
                </>
            ) : (
                <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[24px]">
        {renderContent()}
      </div>

      {/* Tags */}
      {!note.isProcessing && note.aiAnalysis?.tags && note.aiAnalysis.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.aiAnalysis.tags.map((tag, idx) => (
            <button 
              key={idx} 
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md hover:bg-stone-200 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <Tag size={10} /> {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteItem;