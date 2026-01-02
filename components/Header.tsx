import React, { forwardRef } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import { FilterType } from '../types';

interface HeaderProps {
  onExport: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  totalNotes: number;
}

const Header = forwardRef<HTMLInputElement, HeaderProps>(({ 
  onExport, 
  searchTerm, 
  setSearchTerm, 
  filter, 
  setFilter,
  totalNotes
}, ref) => {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <span className="w-2 h-6 bg-stone-800 rounded-sm"></span>
            Clip Memo
            <span className="text-xs font-normal text-gray-400 ml-2 bg-gray-100 px-2 py-1 rounded-full">
              {totalNotes} 条记录
            </span>
          </h1>
          <button 
            onClick={onExport}
            className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} />
            <span className="hidden sm:inline">导出 MD</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-stone-600 transition-colors" size={16} />
            <input
              ref={ref}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索记忆 (Cmd+K)"
              className="w-full bg-gray-50 text-sm border border-transparent focus:border-stone-300 focus:bg-white rounded-lg pl-9 pr-3 py-2 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter(FilterType.ALL)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filter === FilterType.ALL ? 'bg-white shadow-sm text-stone-800' : 'text-gray-500 hover:text-stone-700'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter(FilterType.TODO)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filter === FilterType.TODO ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-stone-700'
              }`}
            >
              待办
            </button>
            <button
              onClick={() => setFilter(FilterType.RESOURCE)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filter === FilterType.RESOURCE ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-stone-700'
              }`}
            >
              阅览
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Header;