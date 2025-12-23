
import React, { useState, useMemo, useEffect } from 'react';
import { Subject, WrongItem, Mastery, Grade, Paper, QuestionType, ErrorReason, Worksheet } from '../types';
import { SUBJECT_ICONS, PRIMARY_COLOR } from '../constants';
import { IconSearch, IconSchedule, IconFolder, IconDocument } from '../components/Icons';
import PaperLibrary from './PaperLibrary';

interface WrongBookProps {
  items: WrongItem[];
  papers: Paper[];
  worksheets: Worksheet[];
  initialSegment?: string;
  initialSelectionMode?: boolean;
  initialKpFilter?: string;
  onItemClick: (item: WrongItem) => void;
  onSelectPaper: (paper: Paper) => void;
  onSelectWorksheet: (worksheet: Worksheet) => void;
  onAddPaper: () => void;
  onExport: (items: WrongItem[]) => void;
  onDeleteItems: (ids: string[]) => void;
  children?: React.ReactNode;
}

const WrongBook: React.FC<WrongBookProps> = ({ 
  items, 
  papers, 
  worksheets,
  initialSegment = 'bank', 
  initialSelectionMode = false,
  initialKpFilter = '',
  onItemClick, 
  onSelectPaper, 
  onSelectWorksheet,
  onAddPaper, 
  onExport,
  onDeleteItems,
  children
}) => {
  const [activeSegment, setActiveSegment] = useState(initialSegment);
  const [isSelectionMode, setIsSelectionMode] = useState(initialSelectionMode);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(initialKpFilter !== '');
  
  const [filters, setFilters] = useState({
    subject: 'all' as Subject | 'all',
    difficulty: 'all' as number | 'all',
    type: 'all' as QuestionType | 'all',
    reason: 'all' as ErrorReason | 'all',
    mastery: 'all' as Mastery | 'all',
    sourceSearch: '',
    kpSearch: initialKpFilter
  });

  useEffect(() => { setActiveSegment(initialSegment); }, [initialSegment]);
  useEffect(() => { setIsSelectionMode(initialSelectionMode); }, [initialSelectionMode]);
  useEffect(() => { 
    if (initialKpFilter) {
      setFilters(f => ({ ...f, kpSearch: initialKpFilter }));
      setShowFilters(true);
    }
  }, [initialKpFilter]);

  const filteredItems = useMemo(() => {
    let res = [...items];
    if (filters.subject !== 'all') res = res.filter(i => i.subject === filters.subject);
    if (filters.difficulty !== 'all') res = res.filter(i => i.difficulty === filters.difficulty);
    if (filters.type !== 'all') res = res.filter(i => i.questionType === filters.type);
    if (filters.reason !== 'all') res = res.filter(i => i.reason.includes(filters.reason as ErrorReason));
    if (filters.mastery !== 'all') res = res.filter(i => i.mastery === filters.mastery);
    if (filters.sourceSearch.trim()) {
      res = res.filter(i => i.source?.toLowerCase().includes(filters.sourceSearch.toLowerCase()));
    }
    if (filters.kpSearch.trim()) {
      res = res.filter(i => i.knowledgePoints.some(kp => kp.includes(filters.kpSearch)) || i.text.includes(filters.kpSearch));
    }
    res.sort((a, b) => b.collectedAt - a.collectedAt);
    return res;
  }, [items, filters]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedIds.length} 道错题吗？删除后不可撤销。`)) {
      onDeleteItems(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      subject: 'all',
      difficulty: 'all',
      type: 'all',
      reason: 'all',
      mastery: 'all',
      sourceSearch: '',
      kpSearch: ''
    });
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-[#121212] flex flex-col relative overflow-hidden transition-colors">
      <div className="bg-white/95 dark:bg-[#1e1e1e] backdrop-blur-md p-2 flex border-b border-gray-100 dark:border-[#333] sticky top-0 z-[100] shadow-sm shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
          {[
            { id: 'bank', label: '错题库' },
            { id: 'papers', label: '试卷库' },
            { id: 'plan', label: '学习计划' },
            { id: 'worksheet', label: '成品库' }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => { setActiveSegment(seg.id); setIsSelectionMode(false); }}
              className={`flex-none px-6 py-2.5 text-[12px] font-black rounded-2xl transition-all ${activeSegment === seg.id ? 'bg-[#2FB16A] text-white shadow-lg' : 'text-gray-400'}`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        {activeSegment === 'papers' ? (
          <PaperLibrary papers={papers} onBack={() => setActiveSegment('bank')} onSelectPaper={onSelectPaper} onAddPaper={onAddPaper} isEmbedded={true} />
        ) : activeSegment === 'plan' ? (
          children
        ) : activeSegment === 'worksheet' ? (
          <div className="p-4 space-y-4 animate-fadeIn">
            {worksheets.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center opacity-40 py-24">
                 <div className="mb-6"><IconFolder size={64} color="#CBD5E1" /></div>
                 <p className="text-sm font-black text-gray-800 dark:text-gray-200">成品库为空</p>
                 <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-wider">生成的 PDF 试卷与笔记将存放在此处</p>
              </div>
            ) : (
              worksheets.map(work => (
                <div 
                  key={work.id} 
                  onClick={() => onSelectWorksheet(work)}
                  className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] shadow-soft border border-gray-100 dark:border-[#333] flex items-center justify-between active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-inner-soft">
                      <IconDocument size={20} color="#6366F1" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-gray-900 dark:text-white">{work.title}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {work.subject} • {work.items.length} 道题 • {new Date(work.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-primary px-4 py-2 bg-primary/10 rounded-xl">查看文档</button>
                </div>
              ))
            )}
          </div>
        ) : activeSegment === 'bank' ? (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="p-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-[#333] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                   <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${showFilters ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-[#333]'}`}
                   >
                     <IconSearch size={12} strokeWidth={3} />
                     多维筛选
                   </button>
                   {Object.values(filters).some(v => v !== 'all' && v !== '') && (
                     <button onClick={resetFilters} className="px-3 py-2 text-[10px] font-black text-red-500">清除</button>
                   )}
                </div>
                <div className="flex gap-2">
                  {isSelectionMode && (
                    <button 
                      onClick={toggleSelectAll}
                      className="px-4 py-2 rounded-xl text-[10px] font-black bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#333] active:scale-95 transition-all"
                    >
                      {selectedIds.length === filteredItems.length ? '取消全选' : '全选'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      if (isSelectionMode) setSelectedIds([]);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all shadow-soft ${isSelectionMode ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-[#1e1e1e] text-primary border-gray-100 dark:border-[#333]'}`}
                  >
                    {isSelectionMode ? '取消选择' : '批量管理'}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="space-y-4 pt-2 pb-2 animate-fadeIn">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">知识点搜索</p>
                       <input 
                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs p-2.5 font-bold dark:text-white"
                        placeholder="输入知识点..."
                        value={filters.kpSearch}
                        onChange={e => setFilters({...filters, kpSearch: e.target.value})}
                       />
                     </div>
                     <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">来源搜索</p>
                       <input 
                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs p-2.5 font-bold dark:text-white"
                        placeholder="输入题目来源..."
                        value={filters.sourceSearch}
                        onChange={e => setFilters({...filters, sourceSearch: e.target.value})}
                       />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <FilterGroup label="科目" value={filters.subject} options={['all', ...Object.values(Subject)]} onChange={v => setFilters({...filters, subject: v as any})} />
                      <FilterGroup label="题型" value={filters.type} options={['all', ...Object.values(QuestionType)]} onChange={v => setFilters({...filters, type: v as any})} />
                      <FilterGroup label="难度" value={filters.difficulty} options={['all', 1, 2, 3, 4, 5]} onChange={v => setFilters({...filters, difficulty: v as any})} />
                      <FilterGroup label="掌握度" value={filters.mastery} options={['all', ...Object.values(Mastery)]} onChange={v => setFilters({...filters, mastery: v as any})} />
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-4 grid grid-cols-1 gap-4">
              {filteredItems.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                   <div className="mb-4"><IconSearch size={64} color="#CBD5E1" /></div>
                   <p className="text-sm font-black dark:text-white">错题库为空，请先去导入错题</p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => isSelectionMode ? (setSelectedIds(isSelected ? selectedIds.filter(id => id !== item.id) : [...selectedIds, item.id])) : onItemClick(item)}
                      className={`bg-white dark:bg-[#1e1e1e] p-3 rounded-[32px] shadow-soft border-2 transition-all flex gap-3 items-center ${isSelected ? 'border-primary' : 'border-transparent'}`}
                    >
                      {isSelectionMode && (
                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-white/20'}`}>
                          {isSelected && '✓'}
                        </div>
                      )}
                      
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shrink-0 shadow-inner-soft overflow-hidden">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt="Thumb" />
                        ) : (
                          SUBJECT_ICONS[item.subject]
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 line-clamp-1 leading-relaxed mb-1">{item.text}</p>
                        <p className="text-[9px] text-gray-400 font-bold truncate mb-1">来源：{item.source || '未知'}</p>
                        <div className="flex flex-wrap gap-1">
                           <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded font-black uppercase tracking-wider">{item.grade}</span>
                           <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${item.mastery === Mastery.MASTERED ? 'bg-teal/10 text-teal' : 'bg-red/10 text-red'}`}>{item.mastery}</span>
                           {item.wrongCount > 1 && (
                             <span className="text-[8px] px-1.5 py-0.5 bg-red text-white rounded font-black uppercase tracking-wider">做错 {item.wrongCount} 次</span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center opacity-40 py-24">
             <div className="mb-6"><IconSchedule size={64} color="#CBD5E1" /></div>
             <p className="text-sm font-black text-gray-800 dark:text-gray-100">智能复习计划</p>
             <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">基于艾宾浩斯曲线生成的每日任务</p>
          </div>
        )}
      </div>

      {isSelectionMode && (
         <div className="absolute bottom-[20px] left-6 right-6 bg-gray-900/95 dark:bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-4 flex items-center justify-between animate-fadeIn z-[150] border border-white/10 dark:border-black/10">
            <div className="flex flex-col ml-4">
              <span className="text-sm font-black text-white dark:text-gray-900">{selectedIds.length} 题已选</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">批量管理中</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
                className={`px-4 py-3 rounded-2xl font-black text-xs transition-all ${selectedIds.length > 0 ? 'bg-red text-white active:scale-95' : 'bg-gray-800 dark:bg-gray-200 text-gray-600 dark:text-gray-400'}`}
              >
                批量删除
              </button>
              <button 
                onClick={() => selectedIds.length > 0 && onExport(items.filter(i => selectedIds.includes(i.id)))}
                disabled={selectedIds.length === 0}
                className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${selectedIds.length > 0 ? 'bg-primary text-white active:scale-95 shadow-lg shadow-primary/20' : 'bg-gray-800 dark:bg-gray-200 text-gray-600 dark:text-gray-400'}`}
              >
                生成文档
              </button>
            </div>
         </div>
      )}
    </div>
  );
};

const FilterGroup = ({ label, value, options, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black text-gray-400 uppercase ml-1">{label}</label>
    <select 
      className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl text-[11px] p-2.5 font-bold outline-none dark:text-white" 
      value={value} 
      onChange={e => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt} value={opt}>{opt === 'all' ? '全部' : opt}</option>
      ))}
    </select>
  </div>
);

export default WrongBook;
