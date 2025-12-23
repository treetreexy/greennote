
import React, { useState } from 'react';
import { LearningPlan } from '../types';
import { IconEdit, IconMagic, IconChevronRight, IconSchedule } from '../components/Icons';

interface PlanHomeProps {
  plans: LearningPlan[];
  onCreateManual: () => void;
  onCreateAI: () => void;
  onSelectPlan: (plan: LearningPlan) => void;
}

const PlanHome: React.FC<PlanHomeProps> = ({ plans, onCreateManual, onCreateAI, onSelectPlan }) => {
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const filteredPlans = plans.filter(p => tab === 'active' ? p.status !== 'completed' : p.status === 'completed');

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={onCreateManual}
          className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-3">
            <IconEdit size={24} color="#6366F1" strokeWidth={2.5} />
          </div>
          <p className="text-[13px] font-black text-gray-800">手动创建</p>
          <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-wider">选错题生成练习</p>
        </div>
        <div 
          onClick={onCreateAI}
          className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
            <IconMagic size={24} color="#93CA76" strokeWidth={2.5} />
          </div>
          <p className="text-[13px] font-black text-gray-800">AI 智能计划</p>
          <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-wider">自动推题编排</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-4">
            <button onClick={() => setTab('active')} className={`text-[11px] font-black uppercase tracking-widest ${tab === 'active' ? 'text-gray-900 border-b-2 border-primary pb-1' : 'text-gray-400'}`}>进行中</button>
            <button onClick={() => setTab('completed')} className={`text-[11px] font-black uppercase tracking-widest ${tab === 'completed' ? 'text-gray-900 border-b-2 border-primary pb-1' : 'text-gray-400'}`}>已完成</button>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
             <span className="text-[9px] font-bold text-gray-300">到点提醒已开启</span>
          </div>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <div className="mb-4">
              <IconSchedule size={64} color="#CBD5E1" />
            </div>
            <p className="text-sm font-black text-gray-800">{tab === 'active' ? '暂无进行中的计划' : '尚无已完成的计划'}</p>
          </div>
        ) : (
          filteredPlans.map(plan => {
            const progress = Math.round((plan.currentTaskIndex / plan.tasks.length) * 100);
            return (
              <div 
                key={plan.id} 
                onClick={() => onSelectPlan(plan)}
                className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 mr-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner-soft ${plan.type === 'ai' ? 'bg-primary/10' : 'bg-indigo-50'}`}>
                    {plan.type === 'ai' ? <IconMagic size={20} color="#93CA76" /> : <IconEdit size={20} color="#6366F1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-gray-900 truncate">{plan.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{plan.subject}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className={`text-[9px] font-black ${progress === 100 ? 'text-teal' : 'text-primary'}`}>
                        {progress === 100 ? '已达成 100%' : `进度 ${progress}%`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-1 bg-gray-50 rounded-full mr-4"></div>
                  <IconChevronRight size={18} color="#E2E8F0" strokeWidth={3} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlanHome;
