
import React from 'react';
import { Mastery, WrongItem, Paper } from '../types';
import { IconRobot, IconTeacher, IconMoon, IconSchedule, IconFolder, IconAnalyze, IconChevronRight, IconPlus, IconTrendUp } from '../components/Icons';

interface MineProps {
  wrongItems: WrongItem[];
  papers: Paper[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onGoToTeacher: () => void;
  onGoToWrongBook: () => void;
  onGoToPapers: () => void;
  onGoToPlan: () => void;
  onGoToReport: () => void;
}

const Mine: React.FC<MineProps> = ({ 
  wrongItems, 
  papers, 
  isDarkMode, 
  onToggleDarkMode, 
  onGoToTeacher, 
  onGoToWrongBook, 
  onGoToPapers, 
  onGoToPlan,
  onGoToReport
}) => {
  const masteredCount = wrongItems.filter(item => item.mastery === Mastery.MASTERED).length;
  const totalCount = wrongItems.length;
  const masteryRate = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-[#121212] animate-fadeIn overflow-y-auto hide-scrollbar pb-32 transition-colors">
      <div className="relative pt-12 pb-8 px-6 bg-gradient-to-b from-[#93CA7620] to-transparent">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-[#1e1e1e] p-1 shadow-xl border-2 border-white dark:border-[#333]">
              <img className="w-full h-full rounded-[24px] object-cover" src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9" alt="Profile" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-xl shadow-lg border-2 border-white dark:border-[#333]">
              <IconPlus size={12} color="white" strokeWidth={4} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-black text-gray-900 dark:text-white">王小明 同学</h2>
               <IconAnalyze size={18} color="#93CA76" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-[#333] text-primary rounded-full font-black border border-primary/20">高一 · 理科生</span>
              <span className="text-[10px] text-gray-400 font-bold">北京实验中学</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] shadow-soft border border-gray-50 dark:border-[#333] flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">累计录入</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{totalCount} <span className="text-xs text-gray-400">题</span></span>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] shadow-soft border border-gray-50 dark:border-[#333] flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">已掌握率</span>
          <span className="text-2xl font-black text-[#93CA76]">{masteryRate}%</span>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">我的学习</h3>
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[40px] shadow-soft border border-gray-50 dark:border-[#333] overflow-hidden">
          <MenuLink 
            icon={<IconSchedule size={20} color="#475569" />} 
            title="每日学习计划" 
            desc="今日待温故 5 题" 
            onClick={onGoToPlan} 
          />
          <Divider />
          <MenuLink 
            icon={<IconFolder size={20} color="#475569" />} 
            title="我的试卷库" 
            desc={`${papers.length} 份已导入试卷`} 
            onClick={onGoToPapers} 
          />
          <Divider />
          <MenuLink 
            icon={<IconTrendUp size={20} color="#475569" />} 
            title="学情报告" 
            desc="查看本地多维能力分析" 
            badge="分析"
            onClick={onGoToReport} 
          />
        </div>

        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 mt-8">系统设置</h3>
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[40px] shadow-soft border border-gray-50 dark:border-[#333] overflow-hidden mb-6">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-xl">
                <IconRobot size={20} color="#3B82F6" />
              </div>
              <div>
                <p className="text-[13px] font-black text-gray-900 dark:text-white">AI 智能引擎</p>
                <p className="text-[10px] text-teal font-bold uppercase tracking-widest">服务已就绪</p>
              </div>
            </div>
            <div className="w-2 h-2 bg-teal rounded-full"></div>
          </div>
          <Divider />
          <MenuLink 
            icon={<IconTeacher size={20} color="#475569" />} 
            title="教师端入口" 
            desc="切换至教师管理后台" 
            onClick={onGoToTeacher} 
          />
          <Divider />
          <div 
            onClick={onToggleDarkMode}
            className="p-5 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-black/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl">
                <IconMoon size={20} color={isDarkMode ? "#F5A623" : "#475569"} />
              </div>
              <p className="text-[13px] font-black text-gray-900 dark:text-white">深色模式</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 py-4 opacity-30">
          <p className="text-[10px] font-black tracking-widest uppercase">电子错题本 v2.4.0</p>
        </div>
      </div>
    </div>
  );
};

const MenuLink = ({ icon, title, desc, onClick, badge }: any) => (
  <div onClick={onClick} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-black/10 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner-soft">{icon}</div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-black text-gray-900 dark:text-white">{title}</p>
          {badge && <span className="text-[8px] px-1.5 py-0.5 bg-primary text-white rounded font-black">{badge}</span>}
        </div>
        <p className="text-[10px] text-gray-400 font-bold">{desc}</p>
      </div>
    </div>
    <IconChevronRight size={18} color="#E2E8F0" strokeWidth={3} className="dark:opacity-20" />
  </div>
);

const Divider = () => <div className="mx-5 h-px bg-gray-50 dark:bg-[#333]"></div>;

export default Mine;
