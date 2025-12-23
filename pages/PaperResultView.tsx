
import React, { useState, useEffect, useMemo } from 'react';
import { Paper, GradingResult, QuestionType } from '../types';
import { IconAnalyze, IconPlus } from '../components/Icons';

interface PaperResultViewProps {
  paper: Paper;
  onConfirm: (finalItems: any[]) => void;
  onExplainQuestion: (q: any) => void;
  onFinish: (paperId: string, gradingData: Record<number, GradingResult[]>) => void;
  onCancel: () => void;
}

const PaperResultView: React.FC<PaperResultViewProps> = ({ paper, onConfirm, onExplainQuestion, onFinish, onCancel }) => {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [isGrading, setIsGrading] = useState(false);
  const [onlyShowWrong, setOnlyShowWrong] = useState(false);
  
  const [gradingData, setGradingData] = useState<Record<number, GradingResult[]>>(paper.gradingData || {});

  useEffect(() => {
    if (!gradingData[currentPageIdx] && !isGrading) {
      handleAutoGrading(currentPageIdx);
    }
  }, [currentPageIdx]);

  const handleAutoGrading = async (pageIdx: number) => {
    setIsGrading(true);
    try {
      setTimeout(() => {
        const mockResults: GradingResult[] = [
          {
            questionId: `q-${pageIdx}-1`,
            questionNumber: 1,
            questionType: QuestionType.FILL,
            text: "48除以一个数的商是9，余数是3，这个数是( )",
            correctAnswer: "5",
            studentAnswer: "5",
            isCorrect: true,
            knowledgePoints: ["除法原理"]
          },
          {
            questionId: `q-${pageIdx}-2`,
            questionNumber: 2,
            questionType: QuestionType.FILL,
            text: "5.60里面有( )个8",
            correctAnswer: "0.7",
            studentAnswer: "70",
            isCorrect: false,
            knowledgePoints: ["小数除法"]
          },
          {
            questionId: `q-${pageIdx}-3`,
            questionNumber: 3,
            questionType: QuestionType.FILL,
            text: "4的4倍是( )",
            correctAnswer: "16",
            studentAnswer: "16",
            isCorrect: true,
            knowledgePoints: ["乘法"]
          },
          {
            questionId: `q-${pageIdx}-4`,
            questionNumber: 4,
            questionType: QuestionType.FILL,
            text: "要使13/6的商是两位数，方框里可以填( )",
            correctAnswer: "0",
            studentAnswer: "1",
            isCorrect: false,
            knowledgePoints: ["除法估算"]
          }
        ];
        setGradingData(prev => ({ ...prev, [pageIdx]: mockResults }));
        setIsGrading(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsGrading(false);
    }
  };

  const toggleCorrectStatus = (qIdx: number) => {
    const pageData = [...(gradingData[currentPageIdx] || [])];
    const item = pageData[qIdx];
    if (item.isCorrect === true) item.isCorrect = false;
    else if (item.isCorrect === false) item.isCorrect = 'pending';
    else item.isCorrect = true;
    
    setGradingData(prev => ({ ...prev, [currentPageIdx]: pageData }));
  };

  const currentGradingResults = useMemo(() => {
    const results = gradingData[currentPageIdx] || [];
    if (onlyShowWrong) {
      return results.filter(r => r.isCorrect === false);
    }
    return results;
  }, [gradingData, currentPageIdx, onlyShowWrong]);

  const handleBatchAddToWrongBook = () => {
    const wrongItems = (gradingData[currentPageIdx] || []).filter(r => r.isCorrect === false);
    if (wrongItems.length === 0) return;
    onConfirm(wrongItems);
  };

  return (
    <div className="absolute inset-0 bg-gray-200 z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 flex items-center justify-between text-white shrink-0 absolute top-0 left-0 right-0 z-20">
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
           <button 
             disabled={currentPageIdx === 0}
             onClick={() => setCurrentPageIdx(p => p - 1)}
             className="opacity-60 disabled:opacity-20"
           >前一页</button>
           <span className="text-[10px] font-black uppercase tracking-widest">{currentPageIdx + 1} / {paper.pages.length}</span>
           <button 
             disabled={currentPageIdx === paper.pages.length - 1}
             onClick={() => setCurrentPageIdx(p => p + 1)}
             className="opacity-60 disabled:opacity-20"
           >后一页</button>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-black">
         <img 
           src={paper.pages[currentPageIdx]} 
           className="w-full h-full object-contain opacity-80" 
           alt="Paper Original" 
         />
      </div>

      <div className="bg-white rounded-t-[40px] shadow-2xl flex flex-col max-h-[70%] animate-fadeIn">
         <div className="p-6 flex flex-col items-center shrink-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4"></div>
            <div className="w-full flex justify-between items-center">
               <h3 className="text-lg font-black text-gray-900">当前批改第 {currentPageIdx + 1} 页</h3>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase">只看错题</span>
                  <button 
                    onClick={() => setOnlyShowWrong(!onlyShowWrong)}
                    className={`w-8 h-4 rounded-full transition-all relative ${onlyShowWrong ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${onlyShowWrong ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32 hide-scrollbar">
            {isGrading ? (
               <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qwen 正在批阅本页试卷...</p>
               </div>
            ) : currentGradingResults.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                  <div className="flex justify-center mb-4">
                    <IconAnalyze size={48} color="#CBD5E1" />
                  </div>
                  <p className="text-sm font-black text-gray-800">本页暂无符合条件的批改结果</p>
               </div>
            ) : (
               <>
                  <div className="space-y-1">
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">一、填空</h4>
                     <div className="space-y-6">
                        {currentGradingResults.map((r, idx) => (
                          <div key={r.questionId} className="space-y-3 group">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <span className="text-sm font-black text-gray-900">第{r.questionNumber}题</span>
                                   <button onClick={() => toggleCorrectStatus(idx)}>
                                      {r.isCorrect === true && <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">✓</div>}
                                      {r.isCorrect === false && <div className="w-5 h-5 bg-red text-white rounded-full flex items-center justify-center text-[10px] font-black">×</div>}
                                      {r.isCorrect === 'pending' && <div className="w-5 h-5 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-[10px] font-black">?</div>}
                                   </button>
                                </div>
                                <div className="flex gap-2">
                                   {r.isCorrect === false && (
                                     <button 
                                      onClick={() => onExplainQuestion(r)}
                                      className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1"
                                     >
                                        <IconAnalyze size={12} strokeWidth={3} />
                                        Qwen 详解
                                     </button>
                                   )}
                                </div>
                             </div>
                             <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100/50 group-active:scale-[0.98] transition-all">
                                <p className="text-[13px] font-bold text-gray-400 leading-relaxed">
                                   正确答案：{r.correctAnswer}
                                </p>
                             </div>
                             {r.isCorrect === false && (
                               <div className="flex justify-end pr-2">
                                  <button 
                                    onClick={() => onConfirm([r])}
                                    className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <IconPlus size={10} color="#93CA76" strokeWidth={3} />
                                    加入错题本
                                  </button>
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                  </div>
               </>
            )}
         </div>

         <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-4 safe-bottom">
            <button 
              onClick={handleBatchAddToWrongBook}
              disabled={currentGradingResults.every(r => r.isCorrect !== false)}
              className="flex-1 py-4 bg-gray-900 text-white rounded-[24px] font-black text-xs shadow-xl active:scale-95 disabled:opacity-20 transition-all uppercase tracking-widest"
            >
              一键入库本页错题
            </button>
            <button 
              onClick={() => onFinish(paper.id, gradingData)}
              className="flex-1 py-4 bg-primary text-white rounded-[24px] font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            >
              已完全批改完成
            </button>
         </div>
      </div>
    </div>
  );
};

export default PaperResultView;
