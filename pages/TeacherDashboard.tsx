
import React, { useState, useRef, useMemo } from 'react';
import { 
  IconDocument, IconTrendUp, IconPlus, IconCameraMain, 
  IconAnalyze, IconChevronRight, IconSuccess, IconRobot, 
  IconIdea, IconMath, IconFolder, IconRefresh, IconEdit, IconFlag
} from '../components/Icons';
import { 
  Subject, Grade, GradingSession, StudentWorkRecord, 
  ErrorPointStat, ErrorReason
} from '../types';
import { aiService } from '../services/aiService';

interface TeacherDashboardProps {
  onBack: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<'home' | 'gradingWizard' | 'fileList' | 'fileDetail' | 'errorDetail' | 'heatmap'>('home');
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  const [sessions, setSessions] = useState<GradingSession[]>([]);
  const [currentFile, setCurrentFile] = useState<GradingSession | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorPointStat | null>(null);
  
  const [gradingFlow, setGradingFlow] = useState({
    fileName: '',
    currentStudent: { name: '', pages: [] as string[] },
    finishedRecords: [] as StudentWorkRecord[],
    step: 'info' as 'info' | 'capturing' | 'processing'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自动生成的占位符姓名
  const nextStudentPlaceholder = `学生 ${gradingFlow.finishedRecords.length + 1}`;

  const finalizeGrading = async () => {
    let finalRecords = [...gradingFlow.finishedRecords];
    // 如果当前正在录入的学生有图片，也一并加入
    if (gradingFlow.currentStudent.pages.length > 0) {
      finalRecords.push({
        studentId: `st-${Date.now()}`,
        studentName: gradingFlow.currentStudent.name || nextStudentPlaceholder,
        pages: [...gradingFlow.currentStudent.pages],
        isGraded: false
      });
    }
    setGradingFlow(prev => ({ ...prev, finishedRecords: finalRecords, step: 'processing' }));
    
    try {
      const aiResult = await aiService.analyzeClassWork(finalRecords, Subject.MATH);
      const newStats = aiResult?.stats || {
        avgScore: 0, maxScore: 0, minScore: 0,
        distribution: { "0-60": 0, "60-80": 0, "80-100": 0 },
        errorPointStats: [],
        questionStats: []
      };
      
      const newFile: GradingSession = {
        id: `file-${Date.now()}`,
        workName: gradingFlow.fileName || `作业批改-${new Date().toLocaleDateString()}`,
        classId: 'c-1',
        subject: Subject.MATH,
        createdAt: Date.now(),
        status: 'completed',
        records: finalRecords,
        stats: newStats
      };
      setSessions(prev => [newFile, ...prev]);
      setCurrentFile(newFile);
      setView('fileDetail');
    } catch (error) {
      alert("分析失败：" + (error as Error).message);
      setView('home');
    }
  };

  const updateErrorPoint = (newText: string) => {
    if (!selectedError || !currentFile) return;
    const updatedError = { ...selectedError, errorPoint: newText };
    const updatedStats = {
      ...currentFile.stats!,
      errorPointStats: currentFile.stats!.errorPointStats.map(e => e.id === selectedError.id ? updatedError : e)
    };
    const updatedFile = { ...currentFile, stats: updatedStats };
    setCurrentFile(updatedFile);
    setSelectedError(updatedError);
    setSessions(prev => prev.map(s => s.id === updatedFile.id ? updatedFile : s));
  };

  const renderFileDetail = () => {
    if (!currentFile) return null;
    const stats = currentFile.stats;
    const maxDist = Math.max(...Object.values(stats?.distribution || {}).map(v => Number(v)), 1);

    return (
      <div className="absolute inset-0 bg-gray-50 z-[160] flex flex-col animate-fadeIn overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <button onClick={() => setView('fileList')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500"><IconChevronRight className="rotate-180" size={18} /></button>
          <h2 className="text-sm font-black uppercase truncate px-4">{currentFile.workName}报告</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar pb-32">
           {/* 分数统计 */}
           <div className="bg-white p-7 rounded-[40px] shadow-soft border border-gray-100 space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qwen 真实批改统计</h3>
              <div className="h-32 flex items-end justify-around gap-4 px-2">
                 {Object.entries(stats?.distribution || { "0-60": 0, "60-80": 0, "80-100": 0 }).map(([range, count]) => (
                   <div key={range} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-xl relative border-x border-t border-primary/30" style={{ height: `${Math.max(10, (Number(count) / maxDist) * 100)}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary bg-white px-2 py-0.5 rounded shadow-sm">{count}人</div>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase">{range}</span>
                   </div>
                 ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50 text-center">
                 <div><p className="text-2xl font-black">{stats?.avgScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase mt-1">平均分</p></div>
                 <div><p className="text-2xl font-black">{stats?.maxScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase mt-1">最高分</p></div>
                 <div><p className="text-2xl font-black text-red-500">{stats?.minScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase mt-1">最低分</p></div>
              </div>
           </div>

           {/* 高频错误点榜 */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">本卷高频错误点榜 (TOP)</h3>
              <div className="space-y-3">
                 {stats?.errorPointStats && stats.errorPointStats.length > 0 ? stats.errorPointStats.sort((a,b)=>b.count - a.count).map((err, idx) => (
                   <div 
                    key={idx} 
                    onClick={() => { setSelectedError(err); setView('errorDetail'); }}
                    className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-soft group"
                   >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-red-200 shrink-0">#{idx+1}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-black text-gray-800 truncate">{err.errorPoint}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[9px] text-red-500 font-black uppercase">{err.count}位学生 ({err.percentage}%)</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">关联 {err.relatedQuestionNumbers.length} 题</span>
                            {err.tags.map(t => <span key={t} className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">标签:{t}</span>)}
                          </div>
                        </div>
                      </div>
                      <IconChevronRight size={16} color="#CBD5E1" />
                   </div>
                 )) : (
                   <div className="bg-white p-10 rounded-[32px] border border-gray-100 text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest">分析中，等待真实错误聚类数据...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderErrorDetail = () => {
    if (!selectedError) return null;
    return (
      <div className="absolute inset-0 bg-white z-[170] flex flex-col animate-fadeIn overflow-hidden">
         <div className="p-4 border-b flex items-center justify-between shadow-sm shrink-0">
            <button onClick={() => setView('fileDetail')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
            <h2 className="text-sm font-black uppercase">错误点证据追溯</h2>
            <div className="w-10"></div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar pb-32">
            {/* 编辑标题 */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">错误点描述（可编辑）</label>
               <input 
                className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-black text-gray-800 border-none outline-none focus:ring-2 ring-primary/20"
                value={selectedError.errorPoint}
                onChange={(e) => updateErrorPoint(e.target.value)}
               />
            </div>

            {/* 证据与影响 */}
            <div className="grid grid-cols-1 gap-4">
               <div className="bg-orange-50/50 p-6 rounded-[32px] border border-orange-100 space-y-2">
                  <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2"><IconSuccess size={14} /> 卷面证据证据</h4>
                  <p className="text-xs text-orange-800 leading-relaxed font-medium">{selectedError.evidence}</p>
               </div>
               <div className="bg-red-50/50 p-6 rounded-[32px] border border-red-100 space-y-2">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><IconFlag size={14} /> 逻辑影响分析</h4>
                  <p className="text-xs text-red-800 leading-relaxed font-medium">{selectedError.impact}</p>
               </div>
            </div>

            {/* 关联题目证据 */}
            <div className="space-y-4">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">关联题目明细 ({selectedError.relatedQuestionNumbers.length})</h3>
               <div className="space-y-4">
                  {selectedError.relatedQuestionNumbers.map(num => (
                    <div key={num} className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-soft space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-gray-900">第 {num} 题</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">正确率 {currentFile?.stats?.questionStats.find(q=>q.number===num)?.correctRate}%</span>
                       </div>
                       <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                          <p className="text-[10px] font-black text-white/20">【点击查看该题对应错误截图区域】</p>
                       </div>
                       {/* 典型错误样例 */}
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">该题典型错答样例</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedError.typicalWrongAnswers.map((ans, i) => (
                               <div key={i} className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                  <span className="text-[11px] font-bold text-red-500">{ans.text}</span>
                                  <span className="ml-2 text-[9px] text-gray-400">{ans.count}人</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="p-6 border-t bg-white safe-bottom shrink-0">
            <button onClick={() => setView('fileDetail')} className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl">保存讲评修改</button>
         </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="p-4 grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-soft">
           <p className="text-[10px] text-gray-400 font-black uppercase mb-1">批改总数</p>
           <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-soft">
           <p className="text-[10px] text-gray-400 font-black uppercase mb-1">班级质量</p>
           <p className="text-2xl font-black text-primary">82%</p>
        </div>
        <div 
          onClick={() => setView('gradingWizard')}
          className="bg-gray-900 p-4 rounded-[28px] text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg"
        >
           <IconCameraMain size={20} color="white" />
           <p className="text-[10px] font-black mt-1 uppercase">智能批改</p>
        </div>
      </div>

      <div className="px-4 flex gap-2 shrink-0">
        {['overview', 'students'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-xl border transition-all ${activeTab === t ? 'bg-white text-gray-900 border-gray-100 shadow-md' : 'bg-transparent text-gray-400 border-transparent'}`}>
            {t === 'overview' ? '批改存档' : '全班画像'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
         {activeTab === 'overview' && (
            sessions.map(s => (
               <div key={s.id} onClick={() => { setCurrentFile(s); setView('fileDetail'); }} className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 cursor-pointer group">
                  <div className="flex items-center gap-4 flex-1">
                     <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><IconDocument size={20} color="currentColor" /></div>
                     <div><h4 className="text-[13px] font-black text-gray-800">{s.workName}</h4><p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{new Date(s.createdAt).toLocaleDateString()} · 已解析 {s.stats?.errorPointStats.length} 个核心错误点</p></div>
                  </div>
                  <IconChevronRight size={16} color="#E2E8F0" />
               </div>
            ))
         )}
      </div>
    </div>
  );

  const renderGradingWizard = () => {
    if (gradingFlow.step === 'processing') return (
      <div className="absolute inset-0 bg-white z-[300] flex flex-col items-center justify-center space-y-6 text-center p-10 animate-fadeIn">
         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
         <div><h3 className="text-lg font-black">Qwen 正在聚类错误点</h3><p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">正在基于真实卷面提取可追溯证据...</p></div>
      </div>
    );
    return (
      <div className="absolute inset-0 bg-white z-[200] flex flex-col animate-fadeIn">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
           <button onClick={() => setView('home')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
           <h2 className="text-sm font-black uppercase">新建智能批改</h2>
           <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">1. 批次命名</label>
              <input 
                className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 ring-primary/20" 
                value={gradingFlow.fileName} 
                onChange={e => setGradingFlow({...gradingFlow, fileName: e.target.value})} 
                placeholder="例: 期中模拟-第一单元" 
              />
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. 逐位录入 (当前第 {gradingFlow.finishedRecords.length + 1} 位)</label>
                 <span className="text-[10px] font-black text-primary uppercase">已存: {gradingFlow.finishedRecords.length} 人</span>
              </div>
              <div className="bg-gray-50 p-6 rounded-[40px] space-y-6 border-2 border-dashed border-gray-200">
                 {/* 学生姓名输入 */}
                 <div className="space-y-2">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">学生姓名</p>
                   <input 
                    className="w-full bg-white p-4 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 ring-primary/20 shadow-sm"
                    value={gradingFlow.currentStudent.name}
                    onChange={e => setGradingFlow({
                      ...gradingFlow,
                      currentStudent: { ...gradingFlow.currentStudent, name: e.target.value }
                    })}
                    placeholder={nextStudentPlaceholder}
                   />
                 </div>

                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">卷面照片 ({gradingFlow.currentStudent.pages.length})</p>
                    <div className="flex flex-wrap gap-3">
                        {gradingFlow.currentStudent.pages.map((p, i) => (
                          <div key={i} className="relative w-20 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white group">
                            <img src={p} className="w-full h-full object-cover" alt="p" />
                            <button 
                              onClick={() => setGradingFlow({
                                ...gradingFlow,
                                currentStudent: { ...gradingFlow.currentStudent, pages: gradingFlow.currentStudent.pages.filter((_, idx) => idx !== i) }
                              })}
                              className="absolute top-1 right-1 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="w-20 h-28 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 active:bg-gray-100 shadow-sm transition-all">
                          <IconCameraMain size={24} color="#94A3B8" />
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">录入照片</span>
                        </button>
                    </div>
                 </div>

                 <button onClick={() => {
                   if (gradingFlow.currentStudent.pages.length === 0) return alert("请先录入该生的试卷照片");
                   setGradingFlow(prev => ({
                     ...prev,
                     finishedRecords: [...prev.finishedRecords, { 
                        studentId: `st-${Date.now()}`, 
                        studentName: prev.currentStudent.name || nextStudentPlaceholder, 
                        pages: [...prev.currentStudent.pages], 
                        isGraded: false 
                     }],
                     currentStudent: { name: '', pages: [] }
                   }));
                 }} className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase active:scale-95 transition-all shadow-lg">
                   保存并录入下一位
                 </button>
              </div>
           </div>
        </div>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={async (e) => {
          const files = Array.from(e.target.files || []) as File[];
          const pages = await Promise.all(files.map(file => new Promise<string>(r => {
            const rd = new FileReader(); 
            rd.onload = (ev) => r(ev.target?.result as string); 
            rd.readAsDataURL(file);
          })));
          setGradingFlow(prev => ({ ...prev, currentStudent: { ...prev.currentStudent, pages: [...prev.currentStudent.pages, ...pages] } }));
          if (e.target) e.target.value = '';
        }} className="hidden" />
        <div className="p-6 border-t border-gray-100 safe-bottom">
           <button 
             onClick={finalizeGrading} 
             disabled={gradingFlow.finishedRecords.length === 0 && gradingFlow.currentStudent.pages.length === 0} 
             className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest disabled:opacity-30"
           >
             生成循证批改报告
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 transition-colors overflow-hidden relative">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-[100] shadow-sm shrink-0">
        <button onClick={onBack} className="text-primary font-black text-sm flex items-center gap-1 active:scale-95 transition-transform"><IconChevronRight className="rotate-180" size={18} strokeWidth={3} />学生端</button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">循证批改系统</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {view === 'home' && renderHome()}
        {view === 'gradingWizard' && renderGradingWizard()}
        {view === 'fileDetail' && renderFileDetail()}
        {view === 'errorDetail' && renderErrorDetail()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
