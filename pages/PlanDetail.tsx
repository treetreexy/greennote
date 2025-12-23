
import React, { useState } from 'react';
import { LearningPlan } from '../types';
import { IconBookX } from '../components/Icons';

interface PlanDetailProps {
  plan: LearningPlan;
  onBack: () => void;
  onStartPractice: (taskIndex: number) => void;
  onDelete: (id: string) => void;
}

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onBack, onStartPractice, onDelete }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const completedCount = plan.tasks.filter(t => t.isCompleted).length;
  const progress = Math.round((completedCount / plan.tasks.length) * 100);

  const allQuestions = plan.tasks[0]?.questions || [];

  return (
    <div className="absolute inset-0 bg-gray-50 z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 truncate px-4">{plan.title}</h2>
        <button 
          onClick={() => window.confirm("确定删除计划吗？") && onDelete(plan.id)}
          className="w-10 h-10 flex items-center justify-center bg-red/10 text-red rounded-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 space-y-4">
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">总体进度</p>
                 <p className="text-2xl font-black text-gray-900">第 {completedCount} 次 / 共 {plan.tasks.length} 次</p>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${progress === 100 ? 'bg-teal/10 text-teal' : 'bg-primary/10 text-primary'}`}>
                 {progress === 100 ? '计划达成' : `已完成 ${progress}%`}
              </span>
           </div>
           <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="flex gap-4 pt-2">
              <div className="flex-1">
                 <p className="text-[9px] font-black text-gray-400 uppercase">学科</p>
                 <p className="text-xs font-bold">{plan.subject}</p>
              </div>
              <div className="flex-1">
                 <p className="text-[9px] font-black text-gray-400 uppercase">频率</p>
                 <p className="text-xs font-bold">{plan.schedule.join(', ')}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden">
           <button 
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full p-6 flex justify-between items-center bg-white active:bg-gray-50 transition-colors"
           >
             <div className="flex items-center gap-3">
                <IconBookX size={20} color="#93CA76" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-widest">本次计划包含错题 ({allQuestions.length} 题)</span>
             </div>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="3" className={`transition-transform duration-300 ${showQuestions ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
           </button>
           {showQuestions && (
             <div className="p-4 pt-0 space-y-3 bg-gray-50/30 animate-fadeIn">
               {allQuestions.map((q, i) => (
                 <div key={q.id} className="p-3 bg-white rounded-2xl border border-gray-100 flex gap-3 items-center">
                    <span className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center text-[9px] font-black text-gray-400 shrink-0">{i+1}</span>
                    <p className="text-[11px] font-bold text-gray-600 line-clamp-1">{q.text}</p>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="space-y-4 pb-20">
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">练习记录回顾</h3>
           {plan.tasks.map((task, idx) => {
             const isAvailable = idx === plan.currentTaskIndex && plan.status !== 'completed';
             const isCompleted = task.isCompleted;
             
             return (
               <div 
                 key={task.id}
                 onClick={() => isAvailable && onStartPractice(idx)}
                 className={`p-5 rounded-[28px] border-2 transition-all flex items-center justify-between ${isCompleted ? 'bg-white border-teal/10 shadow-sm' : isAvailable ? 'bg-white border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'bg-gray-100 border-transparent opacity-40'}`}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isCompleted ? 'bg-teal text-white' : isAvailable ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                       {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div>
                       <h4 className="text-[13px] font-black text-gray-900">{task.title}</h4>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {isCompleted ? `完成于 ${new Date(task.completedAt!).toLocaleDateString()} · 正确率 ${task.score}%` : isAvailable ? '可立即开始练习' : '尚未解锁'}
                       </p>
                    </div>
                 </div>
                 {isAvailable && (
                   <button className="text-[10px] font-black text-white bg-primary px-4 py-2 rounded-xl active:scale-95 transition-all">开始练习</button>
                 )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
