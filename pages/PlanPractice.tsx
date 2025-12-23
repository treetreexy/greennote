
import React, { useState } from 'react';
import { LearningPlan, Question, QuestionType } from '../types';
import { IconTrophy, IconRobot, IconSuccess, IconAnalyze } from '../components/Icons';

interface PlanPracticeProps {
  plan: LearningPlan;
  taskIndex: number;
  onBack: () => void;
  onComplete: (score: number, newWrongQuestions: Question[], performance: Record<string, boolean>) => void;
}

const PlanPractice: React.FC<PlanPracticeProps> = ({ plan, taskIndex, onBack, onComplete }) => {
  const task = plan.tasks[taskIndex];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [viewHistoryErrors, setViewHistoryErrors] = useState(false);

  const currentQ = task.questions[currentIdx];

  const handleNext = () => {
    if (currentIdx < task.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    let correctCount = 0;
    const newWrongs: Question[] = [];
    const perf: Record<string, boolean> = {};
    
    task.questions.forEach(q => {
      const isCorrect = answers[q.id]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      perf[q.id] = isCorrect;
      if (isCorrect) correctCount++;
      else newWrongs.push(q);
    });

    const score = Math.round((correctCount / task.questions.length) * 100);
    onComplete(score, newWrongs, perf);
  };

  if (showResult) {
    let correctCount = 0;
    const weakKps = new Set<string>();
    const errorQuestions: Question[] = [];
    task.questions.forEach(q => {
      const isCorrect = answers[q.id]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else {
        q.knowledgePoints.forEach(kp => weakKps.add(kp));
        errorQuestions.push(q);
      }
    });
    const score = Math.round((correctCount / task.questions.length) * 100);

    return (
      <div className="absolute inset-0 bg-white z-[250] flex flex-col p-10 text-center animate-fadeIn overflow-y-auto hide-scrollbar">
        {!viewHistoryErrors ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-[40px] flex items-center justify-center mb-6 shadow-inner-soft">
              <IconTrophy size={48} color="#93CA76" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">巩固练习已达成</h3>
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">本次练习成果</p>
            <div className="text-7xl font-black text-primary my-8">{score}</div>
            
            <div className="w-full space-y-6">
               <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">薄弱知识点分析</p>
                  <div className="flex flex-wrap justify-center gap-2">
                     {weakKps.size > 0 ? (
                       Array.from(weakKps).map(kp => (
                         <span key={kp} className="px-3 py-1 bg-red/5 text-red text-[10px] font-black rounded-lg">#{kp}</span>
                       ))
                     ) : (
                       <span className="text-xs font-bold text-teal flex items-center gap-1"><IconSuccess size={12} /> 全掌握！完美表现</span>
                     )}
                  </div>
               </div>

               {errorQuestions.length > 0 && (
                 <button 
                  onClick={() => setViewHistoryErrors(true)}
                  className="w-full py-4 bg-gray-100 rounded-2xl text-[11px] font-black text-gray-600 flex items-center justify-center gap-2"
                 >
                    <IconAnalyze size={14} color="#64748B" />
                    查看本次错题汇总
                 </button>
               )}

               <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-center gap-2">
                  <IconSuccess size={14} color="#93CA76" />
                  <p className="text-[9px] font-black text-primary uppercase">进度已自动回写至学习计划与错题库</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col pt-10 text-left">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900">本次错题回顾</h3>
                <button onClick={() => setViewHistoryErrors(false)} className="text-xs font-black text-primary">返回报告</button>
             </div>
             <div className="space-y-4">
                {errorQuestions.map((q, i) => (
                  <div key={q.id} className="p-5 rounded-3xl bg-gray-50 border border-gray-100 space-y-3">
                     <p className="text-xs font-bold text-gray-800 leading-relaxed line-clamp-3">{q.text}</p>
                     <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">你的回答</p>
                        <p className="text-xs font-bold text-red-500">{answers[q.id] || '(未作答)'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">正确答案</p>
                        <p className="text-xs font-bold text-primary">{q.correctAnswer}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
        
        <div className="w-full pt-10 pb-6">
           <button onClick={handleFinish} className="w-full py-5 bg-primary text-white rounded-[32px] font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest">
             返回并更新计划进度
           </button>
        </div>
      </div>
    );
  }

  const isCorrect = answers[currentQ.id]?.trim().toLowerCase() === currentQ.correctAnswer?.trim().toLowerCase();

  return (
    <div className="absolute inset-0 bg-white z-[200] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="text-gray-400 px-2 font-black text-xs uppercase">退出</button>
        <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden shadow-inner-soft">
           <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIdx + 1) / task.questions.length) * 100}%` }}></div>
        </div>
        <span className="text-[10px] font-black text-gray-300 tracking-widest">{currentIdx + 1} / {task.questions.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
         <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-xl uppercase tracking-widest">{currentQ.questionType}</span>
              <div className="flex gap-1">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">难度等级 {currentQ.difficulty}</span>
              </div>
            </div>
            <div className="p-1">
              <p className="text-[15px] font-bold text-gray-800 leading-relaxed">{currentQ.text}</p>
            </div>
         </div>

         <div className="space-y-6">
            {submitted[currentQ.id] ? (
              <div className="space-y-4 animate-fadeIn">
                 <div className={`p-5 rounded-[28px] flex items-center gap-4 ${isCorrect ? 'bg-teal/10 text-teal' : 'bg-red/10 text-red'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${isCorrect ? 'bg-teal text-white' : 'bg-red text-white'}`}>
                      {isCorrect ? '✓' : '×'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-60">
                        你的回答: {answers[currentQ.id] || '(未填写)'}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest mt-0.5">
                        正确答案: {currentQ.correctAnswer || '暂无数据'}
                      </p>
                    </div>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-[32px] space-y-3 border border-gray-100/50">
                    <div className="flex items-center gap-2">
                       <IconRobot size={16} color="#93CA76" />
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI 智能解析</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                      {currentQ.analysis || "AI 正在重新加载详细解析，请稍候。"}
                    </p>
                 </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 p-2 overflow-hidden">
                   <textarea 
                     className="w-full bg-gray-50/50 p-5 rounded-[24px] text-sm font-bold border-none outline-none min-h-[140px] focus:bg-white transition-colors"
                     placeholder="在此输入你的答案或解题思路..."
                     value={answers[currentQ.id] || ''}
                     onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                   />
                 </div>
                 <button 
                   onClick={() => setSubmitted({ ...submitted, [currentQ.id]: true })}
                   disabled={!answers[currentQ.id]?.trim()}
                   className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-xs shadow-xl active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest"
                 >
                   提交并比对解析
                 </button>
              </div>
            )}
         </div>
      </div>

      {submitted[currentQ.id] && (
        <div className="p-6 bg-white border-t border-gray-100 animate-fadeIn safe-bottom">
           <button 
            onClick={handleNext} 
            className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest"
           >
             {currentIdx === task.questions.length - 1 ? '完成本次练习' : '下一题'}
           </button>
        </div>
      )}
    </div>
  );
};

export default PlanPractice;
