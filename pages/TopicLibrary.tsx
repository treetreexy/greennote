
import React, { useState } from 'react';
import { LearningTopic, Subject } from '../types';
import { IconMath, IconAnalyze, IconChevronRight } from '../components/Icons';

interface TopicLibraryProps {
  topics: LearningTopic[];
  onBack: () => void;
  onSelectTopic: (topic: LearningTopic) => void;
}

const TopicLibrary: React.FC<TopicLibraryProps> = ({ topics, onBack, onSelectTopic }) => {
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');

  const filteredTopics = topics
    .filter(t => filterSubject === 'all' || t.subject === filterSubject);

  return (
    <div className="absolute inset-0 bg-gray-50 z-[100] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">错题考点专题</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
        <button 
          onClick={() => setFilterSubject('all')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${filterSubject === 'all' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
        >全部</button>
        {Object.values(Subject).map(s => (
          <button 
            key={s}
            onClick={() => setFilterSubject(s)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${filterSubject === s ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
          >{s}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar pb-32">
        {filteredTopics.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <IconAnalyze size={64} color="#CBD5E1" />
            <p className="mt-4 text-sm font-black text-gray-800">暂无相关专题建议</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">系统正在根据你的错题库进行深度分析</p>
          </div>
        ) : (
          filteredTopics.map(topic => (
            <div 
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-green-50 text-primary rounded-2xl flex items-center justify-center text-xl shadow-inner-soft shrink-0">
                  <IconMath size={20} color="#93CA76" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-black text-gray-900 truncate">{topic.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                      {topic.recommendReason}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${topic.status === 'completed' ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-400'}`}>
                      {topic.status === 'completed' ? '已达成' : topic.status === 'studying' ? '进行中' : '未开始'}
                    </span>
                  </div>
                </div>
              </div>
              <IconChevronRight size={18} color="#E2E8F0" strokeWidth={3} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopicLibrary;
