
import React, { useState, useMemo } from 'react';
import { WrongItem, LearningPlan, Subject, PlanTask, Question, QuestionType, Mastery, Grade } from '../types';
import { IconSearch, IconChevronRight } from '../components/Icons';

interface PlanCreateManualProps {
  wrongItems: WrongItem[];
  onBack: () => void;
  onSave: (plan: LearningPlan) => void;
}

const PlanCreateManual: React.FC<PlanCreateManualProps> = ({ wrongItems, onBack, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState<string[]>(['周二', '周五']);
  const [times, setTimes] = useState(4);
  const [time, setTime] = useState('18:00');

  const [filters, setFilters] = useState({
    subject: 'all' as Subject | 'all',
    mastery: 'all' as Mastery | 'all',
    grade: 'all' as Grade | 'all'
  });

  const filteredSourceItems = useMemo(() => {
    return wrongItems.filter(item => {
      if (filters.subject !== 'all' && item.subject !== filters.subject) return false;
      if (filters.mastery !== 'all' && item.mastery !== filters.mastery) return false;
      if (filters.grade !== 'all' && item.grade !== filters.grade) return false;
      return true;
    });
  }, [wrongItems, filters]);

  const handleCreate = () => {
    if (selectedIds.length === 0) return alert("请至少选择一道错题");
    
    const selectedQuestions = selectedIds.map(id => {
      const item = wrongItems.find(i => i.id === id)!;
      return {
        ...item,
        correctAnswer: item.correctAnswer || item.solution?.answer || "暂无标准答案",
        analysis: item.analysis || item.solution?.analysis || "该题目暂无 AI 详细解析"
      } as Question;
    });
    
    // 不抽题模式：每一项练习包含全部已选题
    const tasks: PlanTask[] = Array.from({ length: times }).map((_, i) => ({
      id: `task-${Date.now()}-${i}`,
      title: `第 ${i + 1} 次巩固练习 (全集)`,
      questions: [...selectedQuestions], 
      isCompleted: false
    }));

    const plan: LearningPlan = {
      id: `plan-${Date.now()}`,
      title: title || `${selectedQuestions[0]?.subject || '理科'}错题巩固计划`,
      subject: selectedQuestions[0]?.subject || Subject.MATH,
      createdAt: Date.now(),
      type: 'manual',
      schedule,
      time,
      tasks,
      currentTaskIndex: 0,
      sourceItems: selectedIds,
      status: 'active'
    };

    onSave(plan);
  };

  if (isSelecting) {
    return (
      <div className="absolute inset-0 bg-white z-[200] flex flex-col animate-fadeIn">
        <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
           <button onClick={() => setIsSelecting(false)} className="px-4 py-2 text-primary font-black text-xs">取消</button>
           <h3 className="text-sm font-black">选择计划题目 ({selectedIds.length})</h3>
           <button onClick={() => setIsSelecting(false)} className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs">完成选择</button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
           <select 
            value={filters.subject} 
            onChange={e => setFilters({...filters, subject: e.target.value as any})}
            className="px-3 py-2 bg-white rounded-xl text-[10px] font-black border border-gray-200 outline-none"
           >
              <option value="all">全部学科</option>
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
           <select 
            value={filters.mastery} 
            onChange={e => setFilters({...filters, mastery: e.target.value as any})}
            className="px-3 py-2 bg-white rounded-xl text-[10px] font-black border border-gray-200 outline-none"
           >
              <option value="all">全部掌握度</option>
              {Object.values(Mastery).map(m => <option key={m} value={m}>{m}</option>)}
           </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
           {filteredSourceItems.length === 0 ? (
             <div className="py-20 text-center opacity-30">
               <IconSearch size={48} className="mx-auto mb-2" />
               <p className="text-xs font-black uppercase">未找到符合条件的错题</p>
             </div>
           ) : filteredSourceItems.map(item => (
             <div 
               key={item.id} 
               onClick={() => {
                 if (selectedIds.includes(item.id)) {
                   setSelectedIds(selectedIds.filter(id => id !== item.id));
                 } else {
                   setSelectedIds([...selectedIds, item.id]);
                 }
               }}
               className={`p-4 rounded-[24px] border-2 transition-all flex gap-3 ${selectedIds.includes(item.id) ? 'border-primary bg-primary/5' : 'border-gray-50 bg-white'}`}
             >
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-800 line-clamp-2">{item.text}</p>
                 <div className="flex gap-2 mt-2">
                    <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{item.subject}</span>
                    <span className="text-[8px] bg-red/5 text-red px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{item.mastery}</span>
                 </div>
               </div>
               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedIds.includes(item.id) ? 'bg-primary border-primary text-white' : 'border-gray-200'}`}>
                 {selectedIds.includes(item.id) && '✓'}
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-50 z-[180] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">手动创建计划</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
        <section className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">练习来源 (不抽题模式)</label>
          <div 
            onClick={() => setIsSelecting(true)}
            className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                 <IconSearch size={24} color="#93CA76" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-800">{selectedIds.length > 0 ? `已选 ${selectedIds.length} 道错题` : '点击选择错题库题目'}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">单次练习量固定为全集</p>
              </div>
            </div>
            <IconChevronRight size={18} color="#E2E8F0" strokeWidth={3} />
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 px-1">
               {selectedIds.slice(0, 3).map(id => {
                 const item = wrongItems.find(i => i.id === id);
                 return item ? (
                   <div key={id} className="w-24 h-24 bg-white rounded-2xl border border-gray-100 shrink-0 p-3 overflow-hidden shadow-sm flex flex-col justify-center">
                      <p className="text-[9px] line-clamp-3 text-gray-500 leading-relaxed font-bold">{item.text}</p>
                   </div>
                 ) : null;
               })}
               {selectedIds.length > 3 && (
                 <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0 flex items-center justify-center text-[10px] font-black text-gray-400">
                   +{selectedIds.length - 3} 题
                 </div>
               )}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">计划配置</h3>
          <div className="space-y-4 bg-white p-6 rounded-[32px] shadow-soft border border-gray-100">
            <div className="space-y-2">
              <p className="text-[11px] font-black text-gray-900">计划名称</p>
              <input 
                className="w-full bg-gray-50 p-3 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-primary transition-all"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：数学函数专题巩固计划"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-gray-900">总练习次数</p>
              <div className="flex items-center gap-4">
                 <button onClick={() => setTimes(Math.max(1, times-1))} className="w-8 h-8 rounded-full bg-gray-100 font-black">-</button>
                 <span className="text-sm font-black">{times} 次</span>
                 <button onClick={() => setTimes(times+1)} className="w-8 h-8 rounded-full bg-gray-100 font-black">+</button>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-black text-gray-900">定期提醒频率</p>
              <div className="flex flex-wrap gap-2">
                 {['周一','周二','周三','周四','周五','周六','周日'].map(day => (
                   <button 
                     key={day}
                     onClick={() => setSchedule(schedule.includes(day) ? schedule.filter(d => d !== day) : [...schedule, day])}
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${schedule.includes(day) ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
                   >
                     {day}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
         <button 
           onClick={handleCreate}
           disabled={selectedIds.length === 0}
           className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest"
         >
           开启练习闭环
         </button>
      </div>
    </div>
  );
};

export default PlanCreateManual;
