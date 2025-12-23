import React, { useState } from 'react';
import { WrongItem, LearningPlan, Subject, PlanTask, Question, Grade, Paper } from '../types';
import { aiService } from '../services/aiService';
import { IconTrendDown, IconFlag } from '../components/Icons';

interface PlanCreateAIProps {
  wrongItems: WrongItem[];
  papers: Paper[];
  onBack: () => void;
  onSave: (plan: LearningPlan) => void;
}

const PlanCreateAI: React.FC<PlanCreateAIProps> = ({ wrongItems, papers, onBack, onSave }) => {
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [sourceMode, setSourceMode] = useState<'kp' | 'mistakes'>('kp');
  const [subject, setSubject] = useState(Subject.MATH);
  const [grade, setGrade] = useState(Grade.SENIOR_1);
  const [kps, setKps] = useState('');
  const [times, setTimes] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const sourceTexts = sourceMode === 'mistakes' 
        ? wrongItems.filter(i => i.subject === subject).slice(0, 5).map(i => i.text)
        : undefined;

      const questions = await aiService.generatePlanQuestions({
        sourceTexts,
        kps: sourceMode === 'kp' ? kps.split(/[，,]/).map(s => s.trim()).filter(s => s) : undefined,
        count: 5,
        subject,
        grade
      });
      setPreviewQuestions(questions);
      setStep('preview');
    } catch (e) {
      alert("Qwen 生成题目失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwapQuestion = async (idx: number) => {
    const q = previewQuestions[idx];
    const newQuestions = await aiService.generatePlanQuestions({
      kps: q.knowledgePoints,
      count: 1,
      subject,
      grade
    });
    if (newQuestions.length > 0) {
      const updated = [...previewQuestions];
      updated[idx] = newQuestions[0];
      setPreviewQuestions(updated);
    }
  };

  const handleCreate = () => {
    const tasks: PlanTask[] = Array.from({ length: times }).map((_, i) => ({
      id: `ai-task-${Date.now()}-${i}`,
      title: `Qwen 智能强化练习 (${i + 1}/${times})`,
      questions: previewQuestions.map(q => ({ ...q, difficulty: Math.min(5, q.difficulty + Math.floor(i / 2)) })),
      isCompleted: false
    }));

    const plan: LearningPlan = {
      id: `ai-plan-${Date.now()}`,
      title: `Qwen ${subject}巩固提升计划`,
      subject,
      createdAt: Date.now(),
      type: 'ai',
      schedule: ['周二', '周五'],
      time: '19:00',
      tasks,
      currentTaskIndex: 0,
      sourceItems: [],
      status: 'active'
    };

    onSave(plan);
  };

  if (step === 'preview') {
    return (
      <div className="absolute inset-0 bg-gray-50 z-[200] flex flex-col animate-fadeIn">
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
           <button onClick={() => setStep('config')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
           </button>
           <h3 className="text-sm font-black">Qwen 推题预览 ({previewQuestions.length} 题)</h3>
           <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
           <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">Qwen 已基于所选知识点生成变式题，难度分布合理</p>
           </div>
           {previewQuestions.map((q, idx) => (
             <div key={q.id} className="bg-white p-5 rounded-[28px] shadow-soft border border-gray-100 space-y-3 relative group">
                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                     <span className="text-[9px] font-black text-white bg-primary px-1.5 py-0.5 rounded uppercase">题 {idx + 1}</span>
                     <span className="text-[9px] font-black text-gray-400 uppercase">难度 {q.difficulty}</span>
                   </div>
                   <button 
                    onClick={() => handleSwapQuestion(idx)}
                    className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-xl active:scale-95 transition-all"
                   >换一题</button>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">{q.text}</p>
                <div className="pt-2 border-t border-gray-50 flex gap-2 overflow-x-auto hide-scrollbar">
                   {q.knowledgePoints.map(kp => <span key={kp} className="flex-none text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">#{kp}</span>)}
                </div>
             </div>
           ))}
           <button onClick={handleGenerate} className="w-full py-4 bg-gray-50 text-gray-400 rounded-[24px] text-xs font-black uppercase tracking-widest active:bg-gray-100">
             一键重新生成
           </button>
        </div>
        <div className="p-6 bg-white border-t border-gray-100">
           <button onClick={handleCreate} className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all">
             开启 Qwen 智能学习闭环
           </button>
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
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">Qwen 智能计划</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">生成依据</h3>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSourceMode('mistakes')}
                className={`p-4 rounded-[28px] border-2 transition-all flex flex-col items-center text-center ${sourceMode === 'mistakes' ? 'border-primary bg-primary/5' : 'border-white bg-white'}`}
              >
                 <IconTrendDown size={28} color={sourceMode === 'mistakes' ? "#93CA76" : "#CBD5E1"} className="mb-2" />
                 <p className="text-[11px] font-black text-gray-800">基于近期错题</p>
                 <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-tight">针对性变式巩固</p>
              </button>
              <button 
                onClick={() => setSourceMode('kp')}
                className={`p-4 rounded-[28px] border-2 transition-all flex flex-col items-center text-center ${sourceMode === 'kp' ? 'border-primary bg-primary/5' : 'border-white bg-white'}`}
              >
                 <IconFlag size={28} color={sourceMode === 'kp' ? "#93CA76" : "#CBD5E1"} className="mb-2" />
                 <p className="text-[11px] font-black text-gray-800">基于知识点</p>
                 <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-tight">全方位地毯复习</p>
              </button>
           </div>
        </section>

        <section className="space-y-6">
           <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">学科</label>
                   <select className="w-full bg-gray-50 p-3 rounded-xl text-xs font-bold appearance-none outline-none" value={subject} onChange={e => setSubject(e.target.value as Subject)}>
                      {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">年级</label>
                   <select className="w-full bg-gray-50 p-3 rounded-xl text-xs font-bold appearance-none outline-none" value={grade} onChange={e => setGrade(e.target.value as Grade)}>
                      {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                </div>
              </div>
              
              {sourceMode === 'kp' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">知识点/章节关键词</label>
                  <input 
                    className="w-full bg-gray-50 p-4 rounded-xl text-xs font-bold border-none outline-none focus:ring-1 ring-primary/20"
                    placeholder="例如：指数函数、摩擦力..."
                    value={kps}
                    onChange={e => setKps(e.target.value)}
                  />
                </div>
              )}
           </div>

           <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-gray-900">练习次数周期</span>
              <div className="flex items-center gap-3">
                 <button onClick={() => setTimes(Math.max(1, times-1))} className="w-8 h-8 rounded-full bg-gray-100 font-black">-</button>
                 <span className="text-sm font-black w-4 text-center">{times}</span>
                 <button onClick={() => setTimes(times+1)} className="w-8 h-8 rounded-full bg-gray-100 font-black">+</button>
              </div>
           </div>
        </section>

        {isGenerating && (
           <div className="py-10 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qwen 正在精准筛选题目...</p>
           </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
         <button 
           onClick={handleGenerate}
           disabled={isGenerating || (sourceMode === 'kp' && !kps)}
           className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest"
         >
           开始生成 Qwen 智能计划
         </button>
      </div>
    </div>
  );
};

export default PlanCreateAI;