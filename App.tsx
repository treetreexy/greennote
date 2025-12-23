import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import WrongBook from './pages/WrongBook';
import Capture from './pages/Capture';
import ScanSelect from './pages/ScanSelect';
import ScanFilter from './pages/ScanFilter';
import WrongDetail from './pages/WrongDetail';
import ExportPreview from './pages/ExportPreview';
import TeacherDashboard from './pages/TeacherDashboard';
import PaperAnalysis from './pages/PaperAnalysis';
import PaperResultView from './pages/PaperResultView';
import Mine from './pages/Mine';
import LearningAssistant from './pages/LearningAssistant';
import PaperImportInfo from './pages/PaperImportInfo';
import PaperDetail from './pages/PaperDetail';
import WorksheetDetail from './pages/WorksheetDetail';
import PlanHome from './pages/PlanHome';
import PlanCreateManual from './pages/PlanCreateManual';
import PlanCreateAI from './pages/PlanCreateAI';
import PlanDetail from './pages/PlanDetail';
import PlanPractice from './pages/PlanPractice';
import TopicLibrary from './pages/TopicLibrary';
import TopicDetail from './pages/TopicDetail';
import LearningReport from './pages/LearningReport';
import { Subject, Grade, WrongItem, Paper, Worksheet, GradingResult, Mastery, LearningPlan, Question, LearningTopic } from './types';
import { MOCK_WRONG_ITEMS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'main' | 'capture' | 'scan' | 'scanFilter' | 'detail' | 'export' | 'teacher' | 'papers' | 'analysis' | 'paperResult' | 'paperImportInfo' | 'paperDetail' | 'worksheetDetail' | 'planCreate' | 'planDetail' | 'planPractice' | 'planCreateAI' | 'topicLibrary' | 'topicDetail' | 'report'>('main');
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [wrongItems, setWrongItems] = useState<WrongItem[]>(MOCK_WRONG_ITEMS);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [finishedWorks, setFinishedWorks] = useState<Worksheet[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);

  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [currentWorksheet, setCurrentWorksheet] = useState<Worksheet | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<LearningTopic | null>(null);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [tempPaperPages, setTempPaperPages] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<WrongItem | null>(null);
  const [exportItems, setExportItems] = useState<WrongItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [wbConfig, setWbConfig] = useState({ segment: 'bank', selectionMode: false, filterKp: '' });

  useEffect(() => {
    const root = document.getElementById('root');
    if (isDarkMode) {
      root?.classList.add('dark');
    } else {
      root?.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCaptureComplete = (image: string) => {
    setScanImage(image);
    setView('scanFilter');
  };

  const handleFilterComplete = (filteredImage: string, results: any[]) => {
    setScanImage(filteredImage);
    setScanResults(results || []);
    setView('scan');
  };

  const handleConfirmSaveWrong = (finalEnrichedItems: any[]) => {
    if (!finalEnrichedItems) return;
    let newlyAdded = 0;
    let updatedCount = 0;

    setWrongItems(prev => {
      let result = [...prev];
      finalEnrichedItems.forEach(newItem => {
        if (!newItem || !newItem.text) return;
        const existingIdx = result.findIndex(item => item.text.trim() === newItem.text.trim());
        
        if (existingIdx > -1) {
          const existing = result[existingIdx];
          result[existingIdx] = {
            ...existing,
            wrongCount: (existing.wrongCount || 1) + 1,
            collectedAt: Date.now(),
            mastery: Mastery.LITTLE,
          };
          updatedCount++;
        } else {
          const createdItem: WrongItem = {
            ...newItem,
            id: Math.random().toString(36).substr(2, 9),
            image: newItem.image || scanImage || currentPaper?.image,
            source: newItem.source || (currentPaper ? `试卷：${currentPaper.name}` : '手动录入'),
            paperId: currentPaper?.id,
            wrongCount: 1,
            collectedAt: Date.now(),
            inPlan: true,
            printed: false,
            mastery: Mastery.NONE,
            reason: newItem.reason || []
          };
          result = [createdItem, ...result];
          newlyAdded++;
        }
      });
      return result;
    });

    const msg = newlyAdded > 0 
      ? `入库 ${newlyAdded} 道新题${updatedCount > 0 ? `，更新 ${updatedCount} 道重复记录` : ''}`
      : `已更新 ${updatedCount} 道错题的错误次数`;
    showToast(msg);
  };

  const handleSavePaper = (info: { name: string, subject: Subject, grade: Grade }) => {
    const newPaper: Paper = {
      id: Math.random().toString(36).substr(2, 9),
      name: info.name,
      image: tempPaperPages[0] || '',
      pages: tempPaperPages,
      subject: info.subject,
      grade: info.grade,
      createdAt: Date.now(),
      isAnalyzed: false,
      isGraded: false,
      itemCount: 0
    };
    setPapers(prev => [newPaper, ...prev]);
    setTempPaperPages([]);
    showToast("试卷已保存到试卷库");
    setView('main');
    setActiveTab('wrongbook');
    setWbConfig({ segment: 'papers', selectionMode: false, filterKp: '' });
  };

  const handleSavePlan = (plan: LearningPlan) => {
    setLearningPlans(prev => [plan, ...prev]);
    showToast("学习计划已开启");
    setView('main');
    setActiveTab('wrongbook');
    setWbConfig({ segment: 'plan', selectionMode: false, filterKp: '' });
  };

  const updatePlanProgress = (planId: string, taskIndex: number, score: number, performanceMap: Record<string, boolean>) => {
    setLearningPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedTasks = [...p.tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], isCompleted: true, completedAt: Date.now(), score };
        const nextIdx = taskIndex + 1;
        return {
          ...p,
          tasks: updatedTasks,
          currentTaskIndex: Math.min(nextIdx, p.tasks.length),
          status: nextIdx >= p.tasks.length ? 'completed' : p.status
        };
      }
      return p;
    }));

    const plan = learningPlans.find(p => p.id === planId);
    if (plan) {
      const task = plan.tasks[taskIndex];
      const questionIds = (task.questions || []).map(q => q.id);
      
      setWrongItems(prev => prev.map(item => {
        if (questionIds.includes(item.id)) {
          const isCorrect = performanceMap[item.id];
          return {
            ...item,
            lastPracticedAt: Date.now(),
            practiceCount: (item.practiceCount || 0) + 1,
            mastery: isCorrect ? 
              (item.mastery === Mastery.NONE ? Mastery.LITTLE : 
               item.mastery === Mastery.LITTLE ? Mastery.BASIC : Mastery.MASTERED) 
              : Mastery.LITTLE
          };
        }
        return item;
      }));
    }
  };

  const currentPlan = learningPlans.find(p => p.id === currentPlanId);

  const handleActionFromHome = (targetView: 'analysis' | 'paperResult') => {
    setActiveTab('wrongbook');
    setWbConfig({ segment: 'papers', selectionMode: false, filterKp: '' });
    setView('main');
    showToast("请先选择一份试卷");
  };

  const handleGradingFinished = (paperId: string, gradingData: Record<number, GradingResult[]>) => {
    setPapers(prev => prev.map(p => p.id === paperId ? { ...p, isGraded: true, gradingData } : p));
    showToast("批改结果已保存");
    setView('main');
  };

  const updateItem = (updated: WrongItem) => {
    setWrongItems(prev => prev.map(item => item.id === updated.id ? updated : item));
    if (selectedItem?.id === updated.id) setSelectedItem(updated);
  };

  const handleDrilldownFromReport = (kp: string) => {
    setActiveTab('wrongbook');
    setWbConfig({ segment: 'bank', selectionMode: false, filterKp: kp });
    setView('main');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background dark:bg-[#121212] transition-colors overflow-hidden relative pt-[status-bar-height]">
      {toast && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[300] animate-fadeIn w-[80%] pointer-events-none text-center">
          <div className="bg-gray-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-gray-900 px-6 py-3 rounded-full text-xs font-bold shadow-2xl inline-block">
            {toast}
          </div>
        </div>
      )}

      {view === 'main' && (
        <>
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'home' && (
              <Home 
                wrongItems={wrongItems}
                onAnalyze={() => handleActionFromHome('analysis')}
                onImportWrong={() => { setCurrentPaper(null); setView('capture'); }}
                onImportPaper={() => { setView('capture'); }} 
                onGrade={() => handleActionFromHome('paperResult')}
                onGenerateDoc={() => { setActiveTab('wrongbook'); setWbConfig({ segment: 'bank', selectionMode: true, filterKp: '' }); }}
                onPlan={() => { setActiveTab('wrongbook'); setWbConfig({ segment: 'plan', selectionMode: false, filterKp: '' }); }}
                onTopicClick={(topic) => { setCurrentTopic(topic); setView('topicDetail'); }}
                onMoreTopics={() => { setView('topicLibrary'); }}
                onMoreTools={() => showToast("更多工具开发中，敬请期待")}
              />
            )}
            {activeTab === 'assistant' && <LearningAssistant />}
            {activeTab === 'wrongbook' && (
              <WrongBook 
                items={wrongItems} 
                papers={papers}
                worksheets={finishedWorks}
                initialSegment={wbConfig.segment}
                initialSelectionMode={wbConfig.selectionMode}
                initialKpFilter={wbConfig.filterKp}
                onItemClick={(item) => { setSelectedItem(item); setView('detail'); }} 
                onSelectPaper={(p) => { setCurrentPaper(p); setView('paperDetail'); }}
                onSelectWorksheet={(w) => { setCurrentWorksheet(w); setView('worksheetDetail'); }}
                onAddPaper={() => setView('capture')}
                onExport={(items) => { setExportItems(items); setView('export'); }}
                onDeleteItems={(ids) => setWrongItems(prev => prev.filter(i => !ids.includes(i.id)))}
              >
                <PlanHome 
                  plans={learningPlans} 
                  onCreateManual={() => setView('planCreate')}
                  onCreateAI={() => setView('planCreateAI')}
                  onSelectPlan={(p) => { setCurrentPlanId(p.id); setView('planDetail'); }}
                />
              </WrongBook>
            )}
            {activeTab === 'mine' && (
              <Mine 
                wrongItems={wrongItems}
                papers={papers}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                onGoToTeacher={() => setView('teacher')}
                onGoToPlan={() => { setActiveTab('wrongbook'); setWbConfig({ segment: 'plan', selectionMode: false, filterKp: '' }); }}
                onGoToWrongBook={() => { setActiveTab('wrongbook'); setWbConfig({segment:'bank', selectionMode: false, filterKp: ''}); }}
                onGoToPapers={() => { setActiveTab('wrongbook'); setWbConfig({segment:'papers', selectionMode: false, filterKp: ''}); }}
                onGoToReport={() => setView('report')}
              />
            )}
          </div>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} onCapture={() => setView('capture')} />
        </>
      )}

      {view === 'planCreate' && <PlanCreateManual wrongItems={wrongItems} onBack={() => setView('main')} onSave={handleSavePlan} />}
      {view === 'planCreateAI' && <PlanCreateAI papers={papers} wrongItems={wrongItems} onBack={() => setView('main')} onSave={handleSavePlan} />}
      {view === 'planDetail' && currentPlan && <PlanDetail plan={currentPlan} onBack={() => setView('main')} onStartPractice={(taskIdx) => { setView('planPractice'); }} onDelete={(id) => { setLearningPlans(prev => prev.filter(p => p.id !== id)); setView('main'); }} />}
      {view === 'planPractice' && currentPlan && <PlanPractice plan={currentPlan} taskIndex={currentPlan.currentTaskIndex} onBack={() => setView('planDetail')} onComplete={(score, wrongs, perf) => { updatePlanProgress(currentPlan.id, currentPlan.currentTaskIndex, score, perf); setView('planDetail'); }} />}

      {view === 'capture' && <Capture onCancel={() => setView('main')} onProcessed={handleCaptureComplete} onPaperImport={(pages) => { setTempPaperPages(pages); setView('paperImportInfo'); }} />}
      {view === 'scanFilter' && scanImage && <ScanFilter image={scanImage} onCancel={() => setView('capture')} onComplete={handleFilterComplete} />}
      {view === 'scan' && <ScanSelect results={scanResults} image={scanImage || ''} onConfirm={handleConfirmSaveWrong} onNavigate={(action) => action === 'view' ? setView('main') : setView('capture')} onCancel={() => setView('main')} />}
      {view === 'paperImportInfo' && <PaperImportInfo pages={tempPaperPages} onSave={handleSavePaper} onCancel={() => setView('capture')} />}
      {view === 'paperDetail' && currentPaper && <PaperDetail paper={currentPaper} onBack={() => setView('main')} onAnalyze={() => setView('analysis')} onGrade={() => setView('paperResult')} />}
      {view === 'worksheetDetail' && currentWorksheet && <WorksheetDetail worksheet={currentWorksheet} allWrongItems={wrongItems} onBack={() => setView('main')} onDelete={(id) => { setFinishedWorks(prev => prev.filter(w => w.id !== id)); setView('main'); }} />}
      
      {view === 'topicLibrary' && (
        <TopicLibrary 
          topics={[]} 
          onBack={() => setView('main')} 
          onSelectTopic={(t) => { setCurrentTopic(t); setView('topicDetail'); }} 
        />
      )}
      {view === 'topicDetail' && currentTopic && (
        <TopicDetail 
          topic={currentTopic} 
          onBack={() => setView('main')} 
          onStartPractice={(qs) => { /* Simple direct practice */ }} 
          onAddToPlan={(t, qs) => { /* Manual plan logic */ }} 
          onGenerateDoc={(t, qs) => { setExportItems(qs.map(q => q as any)); setView('export'); }} 
        />
      )}

      {view === 'report' && (
        <LearningReport 
          wrongItems={wrongItems} 
          plans={learningPlans} 
          onBack={() => setView('main')} 
          onDrilldown={handleDrilldownFromReport}
        />
      )}

      {view === 'detail' && selectedItem && (
        <WrongDetail 
          item={selectedItem} 
          onBack={() => { setView('main'); }} 
          onUpdateItem={updateItem} 
        />
      )}

      {view === 'analysis' && currentPaper && <PaperAnalysis paper={currentPaper} onBack={() => setView('paperDetail')} onProcessed={(res) => handleFilterComplete(scanImage || '', res)} onSaveQuestion={(q) => { handleConfirmSaveWrong([q]); setWbConfig({ segment: 'bank', selectionMode: false, filterKp: '' }); setView('main'); setActiveTab('wrongbook'); }} />}
      {view === 'paperResult' && currentPaper && <PaperResultView paper={currentPaper} onConfirm={handleConfirmSaveWrong} onExplainQuestion={(q) => { setSelectedItem({...q, id: q.questionId, subject: currentPaper.subject, grade: currentPaper.grade, difficulty: 3, source: `试卷：${currentPaper.name}`, reason: [], mastery: Mastery.NONE, wrongCount: 1, collectedAt: Date.now(), inPlan: false, printed: false }); setView('detail'); }} onFinish={handleGradingFinished} onCancel={() => setView('paperDetail')} />}
      {view === 'teacher' && <TeacherDashboard onBack={() => setView('main')} />}
      {view === 'export' && <ExportPreview items={exportItems} onBack={() => setView('main')} onComplete={(title) => { const newWork: Worksheet = { id: `w-${Date.now()}`, title, items: exportItems.map(i => i.id), createdAt: Date.now(), subject: exportItems[0]?.subject || Subject.MATH }; setFinishedWorks(prev => [newWork, ...prev]); setView('main'); setActiveTab('wrongbook'); setWbConfig({ segment: 'worksheet', selectionMode: false, filterKp: '' }); showToast("试卷已保存至成品库"); }} />}
    </div>
  );
};

export default App;
