import React, { useState, useRef, useMemo } from 'react';
import { 
  IconDocument, IconTrendUp, IconPlus, IconCameraMain, 
  IconAnalyze, IconChevronRight, IconSuccess, IconRobot, 
  IconIdea, IconMath, IconFolder, IconRefresh, IconEdit
} from '../components/Icons';
import { 
  Subject, Grade, GradingSession, StudentWorkRecord, 
  ClassStudent, ClassWrongItem, ErrorReason, QuestionType 
} from '../types';
import { aiService } from '../services/aiService';

interface TeacherDashboardProps {
  onBack: () => void;
}

interface KPAggregate {
  name: string;
  coveredStudents: number;
  weakStudents: number;
  errorRate: number;
  studentDetails: { name: string, errorCount: number, lastSeen: number }[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<'home' | 'gradingWizard' | 'fileList' | 'fileDetail' | 'reviewList' | 'reviewCard' | 'heatmap' | 'studentProfile' | 'kpDetail'>('home');
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'tasks'>('overview');

  const [sessions, setSessions] = useState<GradingSession[]>([]);
  const [students] = useState<ClassStudent[]>([
    { id: 'st-1', name: '张小明', totalWrongCount: 45, masteryRate: 82, recentTrends: [2, 5, 1, 0, 3, 2, 4] },
    { id: 'st-2', name: '李华', totalWrongCount: 32, masteryRate: 75, recentTrends: [1, 1, 4, 2, 1, 0, 2] },
    { id: 'st-3', name: '王五', totalWrongCount: 58, masteryRate: 64, recentTrends: [8, 4, 6, 3, 5, 2, 7] },
  ]);

  const [selectedKP, setSelectedKP] = useState<KPAggregate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFile, setCurrentFile] = useState<GradingSession | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  
  const [gradingFlow, setGradingFlow] = useState({
    fileName: '',
    currentStudent: { name: '', pages: [] as string[] },
    finishedRecords: [] as StudentWorkRecord[],
    step: 'info' as 'info' | 'capturing' | 'processing'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const classStats = useMemo(() => {
    if (sessions.length === 0) return { weakPoints: [], strongPoints: [] };
    const kpMap: Record<string, KPAggregate> = {};

    sessions.forEach(session => {
      const studentCount = session.records.length || 30;
      if (!session.stats) return;

      session.stats.questionStats.forEach(qs => {
        qs.knowledgePoints.forEach(kpName => {
          if (!kpMap[kpName]) {
            kpMap[kpName] = { 
              name: kpName, 
              coveredStudents: 0, 
              weakStudents: 0, 
              errorRate: 0,
              studentDetails: [] 
            };
          }
          const kp = kpMap[kpName];
          kp.coveredStudents += studentCount;
          kp.weakStudents += qs.wrongCount;
          
          session.records.slice(0, qs.wrongCount).forEach(rec => {
             const existing = kp.studentDetails.find(s => s.name === rec.studentName);
             if (existing) {
               existing.errorCount += 1;
             } else {
               kp.studentDetails.push({ name: rec.studentName, errorCount: 1, lastSeen: session.createdAt });
             }
          });
        });
      });
    });

    const allKPs = Object.values(kpMap).map(kp => ({
      ...kp,
      errorRate: Math.round((kp.weakStudents / (kp.coveredStudents || 1)) * 100)
    }));

    return {
      weakPoints: allKPs.filter(kp => kp.errorRate >= 40).sort((a,b) => b.errorRate - a.errorRate),
      strongPoints: allKPs.filter(kp => kp.errorRate < 40).sort((a,b) => a.errorRate - b.errorRate)
    };
  }, [sessions]);

  const startNewGrading = () => {
    setGradingFlow({
      fileName: `作业批改-${new Date().toLocaleDateString()}`,
      currentStudent: { name: '', pages: [] },
      finishedRecords: [],
      step: 'info'
    });
    setView('gradingWizard');
  };

  const handleExportPDF = () => {
    if (sessions.length === 0) return alert("暂无解析数据，无法生成报告");
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("全班学情 PDF 报告已生成并发送至您的企业微信！");
    }, 2500);
  };

  const handleAddPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    const readPromises = files.map(file => new Promise<string>(r => {
      const rd = new FileReader();
      rd.onload = (ev) => r(ev.target?.result as string);
      rd.readAsDataURL(file);
    }));
    const newPages = await Promise.all(readPromises);
    setGradingFlow(prev => ({
      ...prev,
      currentStudent: { ...prev.currentStudent, pages: [...prev.currentStudent.pages, ...newPages] }
    }));
    if (e.target) e.target.value = '';
  };

  const nextStudent = () => {
    if (gradingFlow.currentStudent.pages.length === 0) return alert("请先录入图片");
    const newRecord: StudentWorkRecord = {
      studentId: `st-${Date.now()}`,
      studentName: gradingFlow.currentStudent.name || `匿名学生 ${gradingFlow.finishedRecords.length + 1}`,
      pages: [...gradingFlow.currentStudent.pages],
      isGraded: false
    };
    setGradingFlow(prev => ({
      ...prev,
      finishedRecords: [...prev.finishedRecords, newRecord],
      currentStudent: { name: '', pages: [] }
    }));
  };

  const finalizeGrading = async () => {
    let finalRecords = [...gradingFlow.finishedRecords];
    if (gradingFlow.currentStudent.pages.length > 0) {
      finalRecords.push({
        studentId: `st-${Date.now()}-last`,
        studentName: gradingFlow.currentStudent.name || `学生 ${finalRecords.length + 1}`,
        pages: [...gradingFlow.currentStudent.pages],
        isGraded: false
      });
    }
    setGradingFlow(prev => ({ ...prev, finishedRecords: finalRecords, step: 'processing' }));
    try {
      const aiResult = await aiService.analyzeClassWork(finalRecords, Subject.MATH);
      if (!aiResult?.stats) throw new Error("AI 解析结果异常");
      const newFile: GradingSession = {
        id: `file-${Date.now()}`,
        workName: gradingFlow.fileName,
        classId: 'c-1',
        subject: Subject.MATH,
        createdAt: Date.now(),
        status: 'completed',
        records: finalRecords,
        stats: aiResult.stats
      };
      setSessions(prev => [newFile, ...prev]);
      setCurrentFile(newFile);
      setView('fileDetail');
    } catch (error) {
      alert("分析失败：" + (error as Error).message);
      setView('home');
    }
  };

  const renderHeatmap = () => (
    <div className="absolute inset-0 bg-white z-[150] flex flex-col animate-fadeIn overflow-hidden">
       <div className="p-4 border-b flex items-center justify-between shadow-sm bg-white shrink-0">
          <button onClick={() => setView('home')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500"><IconChevronRight className="rotate-180" size={18} /></button>
          <h2 className="text-sm font-black uppercase tracking-widest">全班学情分析仪表盘</h2>
          <div className="w-10"></div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar pb-32">
          <div className="bg-gray-900 p-7 rounded-[40px] flex flex-col gap-4 shadow-xl">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">数据范围：跨文件汇总分析</span>
                <button 
                  onClick={handleExportPDF}
                  className="text-[10px] font-black text-primary px-4 py-2 bg-white/10 rounded-xl active:bg-white/20 transition-all flex items-center gap-2"
                >
                   {isExporting ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <IconDocument size={12} />}
                   导出 PDF 报告
                </button>
             </div>
             <div className="flex justify-around pt-2 border-t border-white/5">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded shadow-sm shadow-red-500/20"></div><span className="text-[9px] font-black text-white uppercase">薄弱考点</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded shadow-sm shadow-primary/20"></div><span className="text-[9px] font-black text-white uppercase">优势考点</span></div>
             </div>
          </div>

          {sessions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
               <IconAnalyze size={80} className="mb-6" color="#CBD5E1" />
               <p className="text-sm font-black text-gray-800 uppercase tracking-widest">暂无批改解析数据</p>
               <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">请先前往「批改作业」录入真实卷子</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
               {classStats.weakPoints.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       <span className="w-1.5 h-3 bg-red-500 rounded-full"></span> 重点关注 (错误率 ≥ 40%)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       {classStats.weakPoints.map(kp => (
                         <div key={kp.name} className="p-5 rounded-[32px] border-2 border-red-500 bg-red-50/50 shadow-soft space-y-4">
                            <h4 className="text-[13px] font-black text-gray-800 line-clamp-1">{kp.name}</h4>
                            <div className="space-y-1.5">
                               <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-400">覆盖人数</span><span className="text-gray-900">{kp.coveredStudents}</span></div>
                               <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-400">薄弱人数</span><span className="text-red-500">{kp.weakStudents}</span></div>
                            </div>
                            <button 
                              onClick={() => { setSelectedKP(kp); setView('kpDetail'); }}
                              className="w-full py-2.5 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-200"
                            >查看薄弱名单</button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {classStats.strongPoints.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 flex items-center gap-2">
                       <span className="w-1.5 h-3 bg-primary rounded-full"></span> 班级优势 (错误率 &lt; 40%)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       {classStats.strongPoints.map(kp => (
                         <div key={kp.name} className="p-5 rounded-[32px] border-2 border-primary/20 bg-green-50/30 shadow-soft space-y-4">
                            <h4 className="text-[13px] font-black text-gray-800 line-clamp-1">{kp.name}</h4>
                            <div className="space-y-1.5">
                               <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-400">覆盖人数</span><span className="text-gray-900">{kp.coveredStudents}</span></div>
                               <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-400">做错人数</span><span className="text-gray-600">{kp.weakStudents}</span></div>
                            </div>
                            <button 
                              onClick={() => { setSelectedKP(kp); setView('kpDetail'); }}
                              className="w-full py-2.5 bg-white border border-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >查看详情</button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          )}
       </div>
    </div>
  );

  const renderKPDetail = () => {
    if (!selectedKP) return null;
    return (
      <div className="absolute inset-0 bg-white z-[160] flex flex-col animate-fadeIn">
         <div className="p-4 border-b flex items-center justify-between shrink-0">
            <button onClick={() => setView('heatmap')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
            <h2 className="text-sm font-black uppercase tracking-widest truncate px-4">{selectedKP.name}：学生名单</h2>
            <div className="w-10"></div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex justify-around text-center">
               <div><p className="text-xl font-black text-gray-900">{selectedKP.coveredStudents}</p><p className="text-[8px] text-gray-400 font-bold uppercase">总覆盖人数</p></div>
               <div className="w-px h-8 bg-gray-200 mt-2"></div>
               <div><p className="text-xl font-black text-red-500">{selectedKP.weakStudents}</p><p className="text-[8px] text-gray-400 font-bold uppercase">薄弱人数</p></div>
               <div className="w-px h-8 bg-gray-200 mt-2"></div>
               <div><p className="text-xl font-black text-red-500">{selectedKP.errorRate}%</p><p className="text-[8px] text-gray-400 font-bold uppercase">错误率</p></div>
            </div>

            <div className="space-y-3 pb-20">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">该知识点做错的学生清单</h3>
               {selectedKP.studentDetails.length === 0 ? (
                 <p className="text-xs text-gray-400 text-center py-10 font-bold italic">该知识点全员掌握，暂无名单</p>
               ) : (
                 selectedKP.studentDetails.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-soft flex items-center justify-between group active:scale-98 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-500 text-xs shadow-inner-soft">{s.name[0]}</div>
                          <div>
                             <h4 className="text-[13px] font-black text-gray-800">{s.name}</h4>
                             <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">关联错题: {s.errorCount} 题 · {new Date(s.lastSeen).toLocaleDateString()} 首次出错</p>
                          </div>
                       </div>
                       <button className="text-[9px] font-black text-primary px-3 py-1.5 bg-primary/10 rounded-lg uppercase">查看画像</button>
                    </div>
                 ))
               )}
            </div>
         </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="p-4 grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-soft">
           <p className="text-[10px] text-gray-400 font-black uppercase mb-1">已存档批改</p>
           <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-soft">
           <p className="text-[10px] text-gray-400 font-black uppercase mb-1">班级掌握</p>
           <p className="text-2xl font-black text-primary">
            {sessions.length > 0 ? (100 - (classStats.weakPoints.length * 5)).toFixed(0) : '--'}%
           </p>
        </div>
        <div 
          onClick={startNewGrading}
          className="bg-gray-900 p-4 rounded-[28px] text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg"
        >
           <IconCameraMain size={20} color="white" />
           <p className="text-[10px] font-black mt-1 uppercase">批改作业</p>
        </div>
      </div>

      <div className="px-4 flex gap-2 shrink-0">
        {['overview', 'students', 'tasks'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-xl border transition-all ${activeTab === t ? 'bg-white text-gray-900 border-gray-100 shadow-md' : 'bg-transparent text-gray-400 border-transparent'}`}>
            {t === 'overview' ? '学情概况' : t === 'students' ? '全班名单' : '巩固任务'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 hide-scrollbar">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
               <div onClick={() => setView('fileList')} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex flex-col items-center gap-3 active:bg-gray-50 cursor-pointer group transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-primary"><IconFolder size={24} color="currentColor" /></div>
                  <span className="text-xs font-black text-gray-800">班级错题库</span>
               </div>
               <div onClick={() => setView('heatmap')} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex flex-col items-center gap-3 active:bg-gray-50 cursor-pointer group transition-all">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-orange-500"><IconTrendUp size={24} color="currentColor" /></div>
                  <span className="text-xs font-black text-gray-800">跨次分析仪表盘</span>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[36px] shadow-soft border border-gray-100 space-y-4">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><IconSuccess size={18} color="#93CA76" /> 最近存档记录</h3>
              <div className="space-y-3">
                {sessions.length === 0 ? <p className="text-[11px] text-gray-400 py-10 text-center font-bold uppercase tracking-widest">暂无批改存档</p> : 
                  sessions.slice(0, 3).map(s => (
                    <div key={s.id} onClick={() => { setCurrentFile(s); setView('fileDetail'); }} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 active:bg-gray-100 cursor-pointer transition-all">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">{s.workName[0]}</div>
                      <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-gray-800 truncate">{s.workName}</p><p className="text-[9px] text-gray-400">{new Date(s.createdAt).toLocaleString()}</p></div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
        {activeTab === 'students' && (
           <div className="space-y-3">
              {students.map(s => (
                <div key={s.id} onClick={() => { setSelectedStudent(s); setView('studentProfile'); }} className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black">{s.name[0]}</div>
                      <div><h4 className="text-[14px] font-black text-gray-900">{s.name}</h4><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">总错题: {s.totalWrongCount} | 掌握 {s.masteryRate}%</p></div>
                   </div>
                   <IconChevronRight size={16} color="#E2E8F0" strokeWidth={3} />
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );

  const renderGradingWizard = () => {
    if (gradingFlow.step === 'processing') return (
      <div className="absolute inset-0 bg-white z-[300] flex flex-col items-center justify-center space-y-6 text-center p-10 animate-fadeIn">
         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
         <div><h3 className="text-lg font-black">Qwen 正在聚合解析</h3><p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">正在提取题目并同步至学情数据库...</p></div>
      </div>
    );
    return (
      <div className="absolute inset-0 bg-white z-[200] flex flex-col animate-fadeIn">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
           <button onClick={() => setView('home')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
           <h2 className="text-sm font-black uppercase">新建批改录入</h2>
           <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">1. 文件命名</label>
              <input className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 ring-primary/20" value={gradingFlow.fileName} onChange={e => setGradingFlow({...gradingFlow, fileName: e.target.value})} />
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. 逐生拍摄录入</label>
                 <span className="text-[10px] font-black text-primary uppercase">已存: {gradingFlow.finishedRecords.length} 人</span>
              </div>
              <div className="bg-gray-50 p-6 rounded-[40px] space-y-6 border-2 border-dashed border-gray-200">
                 <input className="w-full bg-white p-3 rounded-xl text-xs font-bold border-none outline-none" placeholder="输入学生姓名" value={gradingFlow.currentStudent.name} onChange={e => setGradingFlow({...gradingFlow, currentStudent: { ...gradingFlow.currentStudent, name: e.target.value }})} />
                 <div className="flex flex-wrap gap-3">
                    {gradingFlow.currentStudent.pages.map((p, i) => (
                      <div key={i} className="relative w-20 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"><img src={p} className="w-full h-full object-cover" alt="p" /><button onClick={() => setGradingFlow({...gradingFlow, currentStudent: { ...gradingFlow.currentStudent, pages: gradingFlow.currentStudent.pages.filter((_, idx) => idx !== i) }})} className="absolute top-1 right-1 w-6 h-6 bg-red/90 text-white rounded-full flex items-center justify-center text-xs font-bold">×</button></div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="w-20 h-28 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 active:bg-gray-100 shadow-sm transition-all"><IconCameraMain size={24} color="#94A3B8" /><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">拍照/上传</span></button>
                 </div>
                 <button onClick={nextStudent} disabled={gradingFlow.currentStudent.pages.length === 0} className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase active:scale-95 transition-all shadow-lg disabled:opacity-20">存档并录入下一位</button>
              </div>
           </div>
        </div>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleAddPages} className="hidden" />
        <div className="p-6 border-t border-gray-100">
           <button onClick={finalizeGrading} disabled={gradingFlow.finishedRecords.length === 0 && gradingFlow.currentStudent.pages.length === 0} className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest">完成并解析学情</button>
        </div>
      </div>
    );
  };

  const renderFileList = () => (
    <div className="absolute inset-0 bg-gray-50 z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <button onClick={() => setView('home')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
        <h2 className="text-sm font-black uppercase tracking-widest">班级错题库存档</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
         {sessions.length === 0 ? <div className="py-20 text-center opacity-30"><IconFolder size={64} className="mx-auto mb-4" color="#CBD5E1" /><p className="text-xs font-black uppercase tracking-widest">暂无批改记录</p></div> : 
           sessions.map(file => (
           <div key={file.id} onClick={() => { setCurrentFile(file); setView('fileDetail'); }} className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between active:scale-98 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all"><IconDocument size={20} color="currentColor" /></div>
                 <div><h4 className="text-[13px] font-black text-gray-800 line-clamp-1">{file.workName}</h4><div className="flex items-center gap-2 mt-1"><span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(file.createdAt).toLocaleDateString()}</span><span className="w-1 h-1 bg-gray-200 rounded-full"></span><span className="text-[9px] text-primary font-black uppercase">已生成报告</span></div></div>
              </div>
              <IconChevronRight size={16} color="#E2E8F0" />
           </div>
         ))}
      </div>
    </div>
  );

  const renderFileDetail = () => {
    if (!currentFile) return null;
    const stats = currentFile.stats;
    return (
      <div className="absolute inset-0 bg-gray-50 z-[160] flex flex-col animate-fadeIn overflow-hidden">
        <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <button onClick={() => setView('fileList')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500"><IconChevronRight className="rotate-180" size={18} /></button>
          <h2 className="text-sm font-black uppercase truncate px-4">{currentFile.workName}</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar pb-32">
           <div className="bg-white p-7 rounded-[40px] shadow-soft border border-gray-100 space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">单次批改 Qwen 分析结果</h3>
              <div className="h-28 flex items-end justify-around gap-2 px-2">
                 {Object.entries(stats?.distribution || {}).map(([range, count]) => (
                   <div key={range} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative transition-all duration-700" style={{ height: `${Math.min(100, (count as number) * 15)}px`, minHeight: '4px' }}><div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-primary">{count}人</div></div>
                      <span className="text-[8px] font-black text-gray-400">{range}</span>
                   </div>
                 ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50 text-center">
                 <div><p className="text-xl font-black">{stats?.avgScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase">平均分</p></div>
                 <div><p className="text-xl font-black">{stats?.maxScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase">最高分</p></div>
                 <div><p className="text-xl font-black text-red-500">{stats?.minScore}</p><p className="text-[8px] text-gray-400 font-bold uppercase">最低分</p></div>
              </div>
           </div>
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">本卷错题排行榜</h3>
              <div className="space-y-3">
                 {stats?.questionStats.map(q => (
                   <div key={q.number} onClick={() => setView('reviewList')} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-soft">
                      <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${q.correctRate < 60 ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-900 text-white shadow-lg'}`}>{q.number}</div><div><h4 className="text-[13px] font-black text-gray-800 line-clamp-1">{q.knowledgePoints?.[0] || "考点"}</h4><p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">正确率 {q.correctRate}% · {q.wrongCount} 位学生错误</p></div></div>
                      <IconChevronRight size={16} color="#E2E8F0" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="p-6 bg-white border-t border-gray-100 safe-bottom shrink-0">
           <button onClick={() => setView('reviewList')} className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"><IconAnalyze size={18} color="white" />生成讲评清单</button>
        </div>
      </div>
    );
  };

  const renderReviewList = () => (
    <div className="absolute inset-0 bg-white z-[170] flex flex-col animate-fadeIn overflow-hidden">
       <div className="p-4 border-b flex items-center justify-between shadow-sm shrink-0">
          <button onClick={() => setView('fileDetail')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
          <h2 className="text-sm font-black uppercase tracking-widest">课堂讲评清单</h2>
          <div className="w-10"></div>
       </div>
       <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar pb-32">
          {currentFile?.stats?.questionStats.map((r, i) => (
            <div key={i} onClick={() => { setActiveReviewIdx(i); setView('reviewCard'); }} className="flex items-center gap-4 p-5 bg-gray-50 rounded-[32px] border border-gray-100 active:scale-98 transition-all">
               <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">{r.number}</div>
               <div className="flex-1 min-w-0"><h4 className="text-[13px] font-black text-gray-800 truncate">{r.knowledgePoints?.[0]}</h4><p className="text-[9px] text-red-500 font-bold uppercase mt-1">{r.wrongCount} 位学生错误 · 待生成讲解要点</p></div>
               <IconChevronRight size={16} color="#E2E8F0" />
            </div>
          ))}
       </div>
    </div>
  );

  const renderReviewCard = () => {
    const q = currentFile?.stats?.questionStats[activeReviewIdx];
    return (
      <div className="absolute inset-0 bg-white z-[180] flex flex-col animate-fadeIn overflow-hidden">
         <div className="p-4 border-b flex items-center justify-between shrink-0">
            <button onClick={() => setView('reviewList')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
            <h2 className="text-sm font-black uppercase">第 {q?.number} 题 深度讲评</h2>
            <div className="w-10"></div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
            <div className="rounded-[36px] overflow-hidden bg-gray-900 border border-gray-100 shadow-xl aspect-video relative flex items-center justify-center"><p className="text-white/20 text-[10px] font-black uppercase">题干图片</p><div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl text-white text-[9px] font-bold uppercase">正确率 {q?.correctRate}%</div></div>
            <div className="space-y-6">
               <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">错误归因</label><div className="flex flex-wrap gap-2">{['计算', '概念', '审题', '步骤'].map(r => (<button key={r} className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 border border-gray-100 active:bg-primary active:text-white transition-all">{r}</button>))}</div></div>
               <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">讲解备注</label><textarea className="w-full bg-gray-50 p-5 rounded-[24px] text-xs font-bold border-none outline-none min-h-[120px]" placeholder="讲解提示..." /></div>
               {q?.commonWrongAnswers && q.commonWrongAnswers.length > 0 && (
                  <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 animate-fadeIn"><h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">典型错答</h4><div className="space-y-2">{q.commonWrongAnswers.map((a, i) => (<div key={i} className="flex justify-between items-center"><span className="text-xs font-bold text-gray-600">错误：{a.text}</span><span className="text-[10px] font-black text-primary">{a.count} 人相同</span></div>))}</div></div>
               )}
            </div>
         </div>
         <div className="p-6 border-t shrink-0"><button onClick={() => setView('reviewList')} className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg">保存</button></div>
      </div>
    );
  };

  const renderStudentProfile = () => (
    <div className="absolute inset-0 bg-white z-[160] flex flex-col animate-fadeIn overflow-hidden">
       <div className="p-4 border-b flex items-center justify-between shrink-0">
          <button onClick={() => setView('home')} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full"><IconChevronRight className="rotate-180" size={18} /></button>
          <h2 className="text-sm font-black uppercase">学生画像：{selectedStudent?.name}</h2>
          <div className="w-10"></div>
       </div>
       <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar pb-32">
          <div className="flex items-center gap-6"><div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-3xl font-black text-indigo-500 shadow-inner-soft">{selectedStudent?.name[0]}</div><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">核心掌握率</p><p className="text-4xl font-black text-primary">{selectedStudent?.masteryRate}%</p></div></div>
          <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-soft space-y-5"><h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2"><IconTrendUp size={16} /> 个人薄弱考点预测</h3><div className="space-y-4">{['指数运算', '单调性', '集合'].map((kp, i) => (<div key={i} className="flex items-center justify-between p-1"><div className="flex items-center gap-3"><span className="w-6 h-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-[10px] font-black">{i+1}</span><span className="text-xs font-bold text-gray-700">{kp}</span></div><span className="text-[10px] font-black text-gray-400">错题: {15 - i * 4}</span></div>))}</div></div>
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 transition-colors overflow-hidden relative">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-[100] shadow-sm shrink-0">
        <button onClick={onBack} className="text-primary font-black text-sm flex items-center gap-1 active:scale-95 transition-transform"><IconChevronRight className="rotate-180" size={18} strokeWidth={3} />返回学生端</button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">教师智慧管理中心</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {view === 'home' && renderHome()}
        {view === 'gradingWizard' && renderGradingWizard()}
        {view === 'fileList' && renderFileList()}
        {view === 'fileDetail' && renderFileDetail()}
        {view === 'reviewList' && renderReviewList()}
        {view === 'reviewCard' && renderReviewCard()}
        {view === 'heatmap' && renderHeatmap()}
        {view === 'kpDetail' && renderKPDetail()}
        {view === 'studentProfile' && renderStudentProfile()}
      </div>
    </div>
  );
};

export default TeacherDashboard;