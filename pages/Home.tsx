import React, { useMemo } from 'react';
import { IconImport, IconCameraMain, IconLearning, IconAnalyze, IconDocument, IconGrade, IconMath, IconIdea, IconChevronRight } from '../components/Icons';
import { WrongItem, LearningTopic, Subject } from '../types';

interface HomeProps {
  wrongItems: WrongItem[];
  onAnalyze: () => void;
  onImportWrong: () => void;
  onImportPaper: () => void;
  onGrade: () => void;
  onGenerateDoc: () => void;
  onPlan: () => void;
  onTopicClick: (topic: LearningTopic) => void;
  onMoreTopics: () => void;
  onMoreTools: () => void; // 新增更多工具回调
}

const Home: React.FC<HomeProps> = ({ 
  wrongItems, 
  onAnalyze, 
  onImportWrong, 
  onImportPaper, 
  onGrade, 
  onGenerateDoc, 
  onPlan, 
  onTopicClick, 
  onMoreTopics,
  onMoreTools
}) => {
  const recommendedTopics = useMemo(() => {
    const kpMap: Record<string, { count: number, subject: Subject, recent: number }> = {};
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    wrongItems.forEach(item => {
      item.knowledgePoints.forEach(kp => {
        if (!kpMap[kp]) {
          kpMap[kp] = { count: 0, subject: item.subject, recent: 0 };
        }
        kpMap[kp].count++;
        if (item.collectedAt > sevenDaysAgo) {
          kpMap[kp].recent++;
        }
      });
    });

    return Object.entries(kpMap)
      .sort((a, b) => (b[1].count + b[1].recent * 1.5) - (a[1].count + a[1].recent * 1.5))
      .slice(0, 3)
      .map(([title, data]): LearningTopic => ({
        id: `topic-${title}`,
        title: `${title}专题`,
        subject: data.subject,
        knowledgePoints: [title],
        recommendReason: data.recent > 0 ? `近7天新增 ${data.recent} 道错题` : `你在该考点有 ${data.count} 道错题`,
        status: 'not_started'
      }));
  }, [wrongItems]);

  return (
    <div className="animate-fadeIn pb-[120px] dark:text-gray-100 bg-[#F8FAFC] dark:bg-[#121212] flex-1 overflow-y-auto hide-scrollbar">
      {/* 沉浸式通栏渐变顶栏 */}
      <div className="bg-gradient-to-br from-[#5D8B46] to-[#93CA76] pt-16 pb-12 px-8 rounded-b-[48px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-black/5 rounded-full blur-md"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1 pr-6">
            <h1 className="text-[28px] font-black text-white leading-tight tracking-tight drop-shadow-sm">你好，同学！</h1>
            <div className="flex items-center gap-2 mt-2.5">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <IconIdea size={12} color="white" strokeWidth={3} />
              </div>
              <p className="text-[14px] text-white/95 leading-relaxed font-semibold">记录错题，今天也要稳步前进</p>
            </div>
          </div>
          <div className="w-[76px] h-[76px] rounded-[24px] bg-white/25 backdrop-blur-xl overflow-hidden border border-white/40 shrink-0 p-1.5 shadow-xl">
            <img 
              className="w-full h-full rounded-[18px] object-cover" 
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9" 
              alt="Avatar" 
            />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 -mt-8 relative z-20">
        {/* 1. 主入口 */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={onImportWrong}
            className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[36px] shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center active:scale-95 transition-all cursor-pointer group h-[145px]"
          >
            <div className="w-14 h-14 bg-[#F3FAF0] dark:bg-[#1d251a] text-[#93CA76] rounded-[22px] flex items-center justify-center mb-3 shadow-inner-soft group-hover:scale-110 transition-transform">
              <IconCameraMain size={28} color="#93CA76" />
            </div>
            <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none">导入错题</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">AI 智能切分</p>
          </div>

          <div 
            onClick={onImportPaper}
            className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[36px] shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center active:scale-95 transition-all cursor-pointer group h-[145px]"
          >
            <div className="w-14 h-14 bg-[#F0F7FF] dark:bg-[#151a24] text-[#4A90E2] rounded-[22px] flex items-center justify-center mb-3 shadow-inner-soft group-hover:scale-110 transition-transform">
              <IconImport size={28} color="#4A90E2" />
            </div>
            <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none">导入试卷</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">存入试卷库</p>
          </div>
        </div>

        {/* 学习工具分栏 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">学习工具</h3>
            <button 
              onClick={onMoreTools}
              className="text-[10px] font-black text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full flex items-center transition-colors active:bg-primary/30"
            >更多</button>
          </div>

          {/* 2. 次入口 */}
          <div className="grid grid-cols-2 gap-4">
            <ToolCard icon={<IconAnalyze size={24} color="#4DB6AC" />} label="解析试卷" desc="从试卷库选择解析" onClick={onAnalyze} colorClass="text-teal" />
            <ToolCard icon={<IconGrade size={24} color="#9C27B0" />} label="批改试卷" desc="拍一拍，自动判对错" onClick={onGrade} colorClass="text-[#9C27B0]" />
            <ToolCard icon={<IconDocument size={24} color="#3F51B5" />} label="生成文档" desc="试卷/错题本" onClick={onGenerateDoc} colorClass="text-[#3F51B5]" />
            <ToolCard icon={<IconLearning active={true} size={24} />} label="学习计划" desc="错题巩固，按计划练" onClick={onPlan} colorClass="text-primary" />
          </div>
        </div>

        {/* 学习专题分栏 */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between px-2 py-1">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">学习专题</h3>
            <button 
              onClick={onMoreTopics}
              className="text-[10px] font-black text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full flex items-center transition-colors active:bg-primary/30"
            >更多</button>
          </div>
          
          {recommendedTopics.length > 0 ? (
            recommendedTopics.map(topic => (
              <div 
                key={topic.id}
                onClick={() => onTopicClick(topic)}
                className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] shadow-soft border border-gray-100 dark:border-[#333] flex gap-4 active:scale-98 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-green-50 dark:bg-[#1d251a] text-primary rounded-2xl flex items-center justify-center text-xl shadow-inner-soft shrink-0">
                  <IconMath size={24} color="#93CA76" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-sm text-gray-800 dark:text-gray-100 line-clamp-1">{topic.title}</h4>
                    <IconChevronRight size={14} color="#CBD5E1" strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 text-[9px] font-bold uppercase">{topic.subject} • 考点突破</span>
                    <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded tracking-tight">
                      {topic.recommendReason}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[32px] shadow-soft border border-gray-100 dark:border-[#333] text-center opacity-40">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">录入更多错题以获取精准推荐</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ icon, label, desc, onClick, colorClass }: any) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-[#1e1e1e] p-4 rounded-[32px] shadow-soft border border-gray-50 dark:border-[#333] flex flex-col items-center justify-center text-center active:scale-95 transition-all cursor-pointer group h-[105px]"
  >
    <div className="w-12 h-12 bg-gray-50/80 dark:bg-black/20 rounded-2xl flex items-center justify-center mb-1.5 shrink-0 group-hover:scale-105 transition-transform">
      {icon}
    </div>
    <p className={`text-[13px] font-black leading-none dark:text-white ${colorClass}`}>{label}</p>
    <p className="text-[9px] text-gray-500 mt-1 font-bold uppercase tracking-tighter">{desc}</p>
  </div>
);

export default Home;