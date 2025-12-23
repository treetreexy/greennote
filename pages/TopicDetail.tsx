import React, { useState, useEffect } from 'react';
import { LearningTopic, TopicSummary, Question, Grade } from '../types';
import { aiService } from '../services/aiService';
import { IconRobot, IconAnalyze, IconEdit, IconDocument, IconMath } from '../components/Icons';

const SummaryCard = ({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 space-y-3">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
          <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  </div>
);

interface TopicDetailProps {
  topic: LearningTopic;
  onBack: () => void;
  onStartPractice: (questions: Question[]) => void;
  onAddToPlan: (topic: LearningTopic, questions: Question[]) => void;
  onGenerateDoc: (topic: LearningTopic, questions: Question[]) => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ 
  topic, 
  onBack, 
  onStartPractice, 
  onAddToPlan, 
  onGenerateDoc 
}) => {
  const [summary, setSummary] = useState<TopicSummary | null>(topic.summary || null);
  const [loading, setLoading] = useState(!topic.summary);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    if (!summary) fetchSummary();
    fetchQuestions();
  }, [topic]);

  const fetchSummary = async () => {
    setLoading(true);
    const res = await aiService.getTopicSummary(topic.title, topic.knowledgePoints);
    if (res) setSummary(res);
    setLoading(false);
  };

  const fetchQuestions = async () => {
    setIsGeneratingQuestions(true);
    const res = await aiService.generatePlanQuestions({
      kps: topic.knowledgePoints,
      count: 5,
      subject: topic.subject,
      grade: Grade.SENIOR_1
    });
    setQuestions(res);
    setIsGeneratingQuestions(false);
  };

  return (
    <div className="absolute inset-0 bg-white z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 flex items-center gap-4 bg-white border-b border-gray-100 shrink-0 z-20 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 active:scale-90 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-gray-900 truncate">{topic.title}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{topic.subject}专题 · 复盘闭环</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 hide-scrollbar p-5 space-y-6">
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">考点深度总结</h3>
          {loading ? (
            <div className="bg-white p-10 rounded-[32px] flex flex-col items-center justify-center space-y-4 border border-gray-100">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-gray-400 uppercase">Qwen 正在提炼核心考点...</p>
            </div>
          ) : summary && (
            <div className="space-y-4 animate-fadeIn">
              <SummaryCard title="核心概念" items={summary.concepts} icon={<IconMath size={18} color="#93CA76" />} />
              <SummaryCard title="解题模板" items={summary.templates} icon={<IconAnalyze size={18} color="#4A90E2" />} />
              <SummaryCard title="常见陷阱" items={summary.traps} icon={<IconAnalyze size={18} color="#EF4444" />} />
              <SummaryCard title="易错点清单" items={summary.pitfalls} icon={<IconRobot size={18} color="#9C27B0" />} />
            </div>
          )}
        </section>

        <section className="space-y-4 pb-32">
          <div className="flex items-center justify-between ml-2">
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">配套巩固练习</h3>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 space-y-6">
             <div className="space-y-3">
                {isGeneratingQuestions ? (
                  <div className="py-10 flex flex-col items-center justify-center space-y-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Qwen 变式出题中...</p>
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={idx} className="flex gap-4 p-2">
                      <span className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center text-[9px] font-black text-gray-400 shrink-0">{idx+1}</span>
                      <p className="text-[11px] font-bold text-gray-600 line-clamp-2">{q.text}</p>
                    </div>
                  ))
                )}
             </div>
             
             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => onStartPractice(questions)}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >立即自测</button>
                <button 
                  onClick={() => onAddToPlan(topic, questions)}
                  className="flex-1 py-4 bg-indigo-50 text-indigo-500 rounded-2xl font-black text-[10px] active:scale-95 transition-all"
                >加入计划</button>
                <button 
                  onClick={() => onGenerateDoc(topic, questions)}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] active:scale-95 transition-all"
                >生成讲义</button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TopicDetail;