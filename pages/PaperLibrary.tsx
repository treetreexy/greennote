
import React from 'react';
import { Paper, Subject } from '../types';
import { IconFolder, IconPlus } from '../components/Icons';

interface PaperLibraryProps {
  papers: Paper[];
  onBack: () => void;
  onSelectPaper: (paper: Paper) => void;
  onAddPaper: () => void;
  isEmbedded?: boolean;
}

const PaperLibrary: React.FC<PaperLibraryProps> = ({ papers, onBack, onSelectPaper, onAddPaper, isEmbedded = false }) => {
  return (
    <div className={`h-full flex flex-col animate-fadeIn overflow-hidden ${isEmbedded ? '' : 'bg-gray-50'}`}>
      {!isEmbedded && (
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">我的试卷库</h2>
          <button onClick={onAddPaper} className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg">
             <IconPlus size={20} color="white" strokeWidth={3} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar pb-32">
        {papers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6 mt-10 opacity-30">
             <IconFolder size={80} color="#CBD5E1" />
             <p className="text-sm font-black">试卷库暂无内容</p>
             <button onClick={onAddPaper} className="px-8 py-3 bg-primary text-white rounded-full text-xs font-black">立即导入试卷</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {papers.map(p => (
              <div 
                key={p.id} 
                onClick={() => onSelectPaper(p)}
                className="bg-white rounded-[32px] overflow-hidden shadow-soft border border-gray-100 active:scale-95 transition-all cursor-pointer group flex flex-col"
              >
                <div className="aspect-[3/4] bg-gray-200 relative">
                   <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                   <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      <span className="text-[8px] px-1.5 py-0.5 bg-primary text-white rounded font-black">{p.subject}</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-black/40 text-white rounded font-black">{p.pages.length} 页</span>
                   </div>
                   {p.isGraded && (
                     <div className="absolute top-3 right-3 bg-teal text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">已批改</div>
                   )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                   <h3 className="text-[11px] font-black text-gray-800 line-clamp-2 leading-snug">{p.name}</h3>
                   <div className="flex justify-between items-center mt-auto">
                      <span className="text-[8px] font-black text-gray-300 uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                      <div className={`w-2 h-2 rounded-full ${p.isAnalyzed ? 'bg-teal' : 'bg-orange-500 animate-pulse'}`}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperLibrary;
