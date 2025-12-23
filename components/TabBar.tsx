
import React from 'react';
import { IconHome, IconLearning, IconBookX, IconUser, IconCameraMain } from './Icons';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCapture: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, onCapture }) => {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-[#333] flex items-center justify-around h-[calc(64px+34px)] pb-[34px] z-50 shrink-0 shadow-tabbar relative transition-colors duration-300">
      <TabItem 
        active={activeTab === 'home'} 
        label="首页" 
        icon={<IconHome active={activeTab === 'home'} />} 
        onClick={() => onTabChange('home')} 
      />
      <TabItem 
        active={activeTab === 'wrongbook'} 
        label="错题·文档" 
        icon={<IconBookX active={activeTab === 'wrongbook'} />} 
        onClick={() => onTabChange('wrongbook')} 
      />
      
      {/* Floating Main Camera Button */}
      <div className="relative w-16 h-16 flex items-center justify-center -top-6">
        <button 
          onClick={onCapture}
          className="w-16 h-16 bg-gradient-to-br from-[#93CA76] to-[#7CB95E] text-white rounded-full shadow-[0_10px_25px_rgba(147,202,118,0.4)] flex items-center justify-center border-[6px] border-white dark:border-[#1e1e1e] active:scale-90 transition-all"
        >
          <IconCameraMain />
        </button>
      </div>

      <TabItem 
        active={activeTab === 'assistant'} 
        label="AI伴学" 
        icon={<IconLearning active={activeTab === 'assistant'} />} 
        onClick={() => onTabChange('assistant')} 
      />
      <TabItem 
        active={activeTab === 'mine'} 
        label="我的" 
        icon={<IconUser active={activeTab === 'mine'} />} 
        onClick={() => onTabChange('mine')} 
      />
    </div>
  );
};

const TabItem = ({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center flex-1 transition-all ${active ? 'text-[#93CA76]' : 'text-gray-400 dark:text-gray-500'}`}
  >
    <div className="mb-1">{icon}</div>
    <span className={`text-[11px] font-bold ${active ? 'text-[#93CA76]' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
  </button>
);

export default TabBar;
