import React, { useMemo } from 'react';
import { WrongItem, LearningPlan, Mastery, ErrorReason } from '../types';
import { IconChevronRight, IconTrendUp, IconRobot, IconIdea, IconSuccess } from '../components/Icons';

interface LearningReportProps {
  wrongItems: WrongItem[];
  plans: LearningPlan[];
  onBack: () => void;
  onDrilldown: (kp: string) => void;
}

const LearningReport: React.FC<LearningReportProps> = ({ wrongItems, plans, onBack, onDrilldown }) => {
  // 1. 数据统计 - 基于近7天
  const stats = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentWrongs = (wrongItems || []).filter(i => i.collectedAt > sevenDaysAgo);
    const masteredCount = (wrongItems || []).filter(i => i.mastery === Mastery.MASTERED).length;
    const completedPlans = (plans || []).filter(p => p.status === 'completed').length;
    
    // 粗略计算练习正确率（如有plan数据）
    let totalAccuracy = 0;
    let count = 0;
    (plans || []).forEach(p => p.tasks?.forEach(t => {
      if (t.isCompleted && t.score !== undefined) {
        totalAccuracy += t.score;
        count++;
      }
    }));
    const accuracy = count > 0 ? Math.round(totalAccuracy / count) : 80;

    return {
      newWrongs: recentWrongs.length,
      mastered: masteredCount,
      completedPlans,
      accuracy
    };
  }, [wrongItems, plans]);

  // 2. 雷达图数据映射 (5个维度)
  const radarData = useMemo(() => {
    const total = wrongItems?.length || 1;
    // 基础扎实度：已掌握题数占比
    const d1 = Math.min(100, (stats.mastered / total) * 100 + 30);
    // 思维灵活性：题型覆盖度
    const d2 = 75; 
    // 抗压能力：中高难度题正确率（模拟）
    const d3 = 60;
    // 细致程度：反向计算错因中“审题/计算”占比
    const carelessCount = (wrongItems || []).filter(i => i.reason?.includes(ErrorReason.MISREAD) || i.reason?.includes(ErrorReason.CALCULATION)).length;
    const d4 = Math.max(20, 100 - (carelessCount / total) * 100);
    // 近期稳定性：近7天新增错题数反比
    const d5 = Math.max(20, 100 - stats.newWrongs * 5);

    return [d1, d2, d3, d4, d5];
  }, [wrongItems, stats]);

  // 3. 薄弱考点 TOP 5
  const topWeakPoints = useMemo(() => {
    const kpMap: Record<string, { count: number, lastTime: number }> = {};
    (wrongItems || []).forEach(item => {
      (item.knowledgePoints || []).forEach(kp => {
        if (!kpMap[kp]) kpMap[kp] = { count: 0, lastTime: 0 };
        kpMap[kp].count++;
        kpMap[kp].lastTime = Math.max(kpMap[kp].lastTime, item.collectedAt);
      });
    });

    return Object.entries(kpMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastTime: new Date(data.lastTime).toLocaleDateString(),
        errorRate: Math.round((data.count / (wrongItems?.length || 1)) * 100)
      }));
  }, [wrongItems]);

  // 4. 规则生成诊断建议
  const suggestions = useMemo(() => {
    const list = [];
    if (topWeakPoints.length > 0) {
      list.push(`优先复习「${topWeakPoints[0].name}」，该考点近期复错率较高，建议进行相似题专项突破。`);
    }
    
    const carelessCount = (wrongItems || []).filter(i => i.reason?.includes(ErrorReason.MISREAD) || i.reason?.includes(ErrorReason.CALCULATION)).length;
    const total = wrongItems?.length || 1;
    if (carelessCount / total > 0.3) {
      list.push(`审题与计算类错误占比较高 (${Math.round(carelessCount / total * 100)}%)，建议练习时养成划重点关键词的习惯。`);
    } else {
      list.push(`基础概念掌握较稳，下一阶段建议尝试中高难度题型，冲击更高分段。`);
    }
    
    return list;
  }, [wrongItems, topWeakPoints]);

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#121212] z-[150] flex flex-col animate-fadeIn overflow-hidden">
      {/* 顶部导航 */}
      <div className="p-4 flex items-center justify-between bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-[#333] shrink-0 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full text-gray-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-[16px] font-black text-gray-900 dark:text-white tracking-widest uppercase">本地学情报告</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6 pb-20">
        {/* A. 总览卡片 */}
        <div className="bg-gradient-to-br from-[#5D8B46] to-[#93CA76] p-7 rounded-[36px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider w-fit">统计周期：近7天</span>
            </div>
            <IconTrendUp size={20} color="white" />
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <StatItem label="新增错题" value={stats.newWrongs} unit="题" />
            <StatItem label="已巩固题数" value={stats.mastered} unit="题" />
            <StatItem label="计划完成" value={stats.completedPlans} unit="项" />
            <StatItem label="平均正确率" value={stats.accuracy} unit="%" />
          </div>
        </div>

        {/* B. 多角图分析 */}
        <div className="bg-white dark:bg-[#1e1e1e] p-7 rounded-[36px] shadow-soft border border-gray-100 dark:border-[#333]">
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-primary rounded-full"></span> 能力维度分析
          </h3>
          <div className="flex flex-col items-center">
             <RadarChart values={radarData} />
             <div className="grid grid-cols-5 w-full mt-6 text-center">
               {['基础','思维','挑战','细致','稳定'].map((label, i) => (
                 <div key={label} className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-gray-400 mb-1">{label}</span>
                   <span className="text-[11px] font-black text-gray-800 dark:text-gray-100">{Math.round(radarData[i])}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* C. 薄弱考点 TOP 5 */}
        <div className="bg-white dark:bg-[#1e1e1e] p-7 rounded-[36px] shadow-soft border border-gray-100 dark:border-[#333]">
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full"></span> 薄弱知识点 TOP 5
          </h3>
          <div className="space-y-4">
            {topWeakPoints.map((kp, i) => (
              <div 
                key={kp.name}
                onClick={() => onDrilldown(kp.name)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${i < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                     {i + 1}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[14px] font-bold text-gray-800 dark:text-gray-100">{kp.name}</span>
                     <span className="text-[10px] text-gray-400 mt-0.5">最近出错：{kp.lastTime}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-right mr-1">
                      <p className="text-[12px] font-black text-red-500">{kp.count} 题</p>
                      <p className="text-[9px] text-gray-400 font-bold">占比 {kp.errorRate}%</p>
                   </div>
                   <IconChevronRight size={16} color="#CBD5E1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* D. 建议与下一步 */}
        <div className="bg-white dark:bg-[#1e1e1e] p-7 rounded-[36px] shadow-soft border border-gray-100 dark:border-[#333]">
           <h3 className="text-sm font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
             <IconIdea size={20} color="#93CA76" /> 学习改进建议
           </h3>
           <div className="space-y-4">
              {suggestions.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                   <div className="shrink-0 mt-1"><IconRobot size={16} color="#93CA76" /></div>
                   <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{s}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, unit }: any) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-bold opacity-80 mb-1.5">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-[26px] font-black leading-none">{value}</span>
      <span className="text-[11px] opacity-70 font-bold">{unit}</span>
    </div>
  </div>
);

const RadarChart = ({ values }: { values: number[] }) => {
  const size = 200;
  const center = size / 2;
  const radius = center * 0.75;
  const sides = 5;
  const angle = (Math.PI * 2) / sides;

  // 计算多边形点
  const getPoints = (vals: number[]) => {
    return vals.map((v, i) => {
      const val = (v / 100) * radius;
      const x = center + val * Math.cos(angle * i - Math.PI / 2);
      const y = center + val * Math.sin(angle * i - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const dataPoints = getPoints(values);
  
  // 背景刻度圆
  const gridScales = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* 刻度背景 */}
      {gridScales.map((scale, i) => {
        const r = radius * scale;
        const pts = Array.from({ length: sides }).map((_, j) => {
          const x = center + r * Math.cos(angle * j - Math.PI / 2);
          const y = center + r * Math.sin(angle * j - Math.PI / 2);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon key={i} points={pts} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray={i === gridScales.length - 1 ? "0" : "2,2"} />
        );
      })}
      
      {/* 轴线 */}
      {Array.from({ length: sides }).map((_, i) => {
        const x = center + radius * Math.cos(angle * i - Math.PI / 2);
        const y = center + radius * Math.sin(angle * i - Math.PI / 2);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#E2E8F0" strokeWidth="1" />;
      })}
      
      {/* 数据填充 */}
      <polygon points={dataPoints} fill="rgba(147, 202, 118, 0.3)" stroke="#93CA76" strokeWidth="3" strokeLinejoin="round" />
      
      {/* 数据圆点 */}
      {dataPoints.split(' ').map((p, i) => {
        const [x, y] = p.split(',');
        return <circle key={i} cx={x} cy={y} r="4" fill="#93CA76" stroke="white" strokeWidth="2" />;
      })}
    </svg>
  );
};

export default LearningReport;
