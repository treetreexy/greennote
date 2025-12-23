
import React from 'react';
import { Paper } from '../types';
import { IconAnalyze, IconGrade } from '../components/Icons';

interface PaperDetailProps {
  paper: Paper;
  onBack: () => void;
  onAnalyze: () => void;
  onGrade: () => void;
}

const PaperDetail: React.FC<PaperDetailProps> = ({ paper, onBack, onAnalyze, onGrade }) => {
  return (
    <div className="absolute inset-0 bg-white z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 truncate px-4">{paper.name}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
         <div className="space-y-4">
            {paper.pages.map((p, i) => (
              <div key={i} className="rounded-[32px] overflow-hidden border border-gray-100 shadow-soft bg-gray-900">
                 <img src={p} className="w-full h-auto" alt={`Page ${i+1}`} />
                 <div className="p-3 text-center text-[10px] font-black text-white/40 uppercase tracking-widest bg-black/20">
                    第 {i+1} 页
                 </div>
              </div>
            ))}
         </div>

         <div className="bg-gray-50 p-6 rounded-[32px] grid grid-cols-2 gap-4">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属学科</p>
               <p className="text-sm font-black text-gray-800">{paper.subject}</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">适用年级</p>
               <p className="text-sm font-black text-gray-800">{paper.grade}</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">导入时间</p>
               <p className="text-sm font-black text-gray-800">{new Date(paper.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">页数</p>
               <p className="text-sm font-black text-gray-800">{paper.pages.length} P</p>
            </div>
         </div>
      </div>

      <div className="p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-bottom">
         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onAnalyze}
              className="py-4 bg-orange-500 text-white rounded-full font-black text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <IconAnalyze size={18} color="white" />
               <span>解析错题</span>
            </button>
            <button 
              onClick={onGrade}
              className="py-4 bg-primary text-white rounded-full font-black text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <IconGrade size={18} color="white" />
               <span>开始批改</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default PaperDetail;
