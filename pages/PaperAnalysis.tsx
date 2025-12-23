import React, { useState, useEffect, useRef } from 'react';
import { Paper, ChatMessage, Solution } from '../types';
import { aiService } from '../services/aiService';
import { IconRobot } from '../components/Icons';

interface PaperAnalysisProps {
  paper: Paper;
  onBack: () => void;
  onProcessed: (results: any[]) => void;
  onSaveQuestion: (question: any) => void;
}

const PaperAnalysis: React.FC<PaperAnalysisProps> = ({ paper, onBack, onProcessed, onSaveQuestion }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("正在唤醒 Qwen 引擎...");
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const startAnalysis = async () => {
    setIsProcessing(true);
    setProcessStatus("Qwen 视觉引擎审阅中...");
    try {
      setProcessStatus("正在提取试题逻辑...");
      const base64Data = paper.image;
      const results = await aiService.scanPaper(base64Data);
      
      if (results && results.length > 0) {
        setQuestions(results);
        setSelectedIdx(0);
      } else {
        throw new Error("Qwen 无法识别该图片，请重拍试卷。");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "解析失败，请确保网络通畅。");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (selectedIdx !== null && questions[selectedIdx] && !questions[selectedIdx].solution) {
      loadSolution(selectedIdx);
    }
  }, [selectedIdx]);

  const loadSolution = async (idx: number) => {
    setIsAiThinking(true);
    try {
      const res = await aiService.solveQuestion(questions[idx].text);
      if (res) {
        const updated = [...questions];
        updated[idx].solution = res;
        setQuestions(updated);
        setChatHistory([{ role: 'model', text: `你好，我是 Qwen 助教。关于第 ${idx + 1} 题，我已经准备好了详细解析。` }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendChat = async () => {
    if (!input.trim() || selectedIdx === null || isAiThinking) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    const textToSend = input;
    setInput('');
    setIsAiThinking(true);
    try {
      const aiReply = await aiService.chatAboutQuestion(questions[selectedIdx].text, newHistory, textToSend);
      setChatHistory(prev => [...prev, { role: 'model', text: aiReply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Qwen 连接超时，请重试。" }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="absolute inset-0 bg-white z-[200] flex flex-col items-center justify-center space-y-6 p-10 text-center">
        <div className="w-16 h-16 border-4 border-[#93CA76] border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="text-lg font-black text-gray-800">Qwen 智能识别中</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 mb-4">{processStatus}</p>
          <p className="text-[10px] text-gray-300 font-medium">Model: Qwen-VL Max</p>
        </div>
      </div>
    );
  }

  const currentQ = selectedIdx !== null ? questions[selectedIdx] : null;

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 active:scale-90 transition-transform">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase truncate max-w-[200px]">错题精解 (Qwen)</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
        {!currentQ ? (
          <div className="p-8 space-y-8 flex flex-col items-center justify-center mt-20">
             <div className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-white w-full">
                <img src={paper.image} className="w-full h-auto" alt="Paper content" />
             </div>
             <button 
               onClick={startAnalysis}
               className="w-full py-5 bg-[#93CA76] text-white rounded-[32px] font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <span>Qwen 识别本卷错题</span>
             </button>
          </div>
        ) : (
          <div className="p-4 space-y-6 pb-40">
            <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-500 rounded-lg font-black uppercase tracking-wider">{selectedIdx! + 1}. 题目展示</span>
                <div className="flex gap-2">
                   {questions.length > 1 && (
                      <button onClick={() => setSelectedIdx(Math.max(0, selectedIdx! - 1))} className="text-[10px] font-black text-primary p-1">上一题</button>
                   )}
                   {selectedIdx! < questions.length - 1 && (
                      <button onClick={() => setSelectedIdx(selectedIdx! + 1)} className="text-[10px] font-black text-primary p-1">下一题</button>
                   )}
                </div>
              </div>
              <p className="text-[14px] leading-relaxed text-gray-800 font-medium">{currentQ.text}</p>
            </div>

            <div className="space-y-6">
               <h3 className="text-lg font-black text-gray-900 px-2">Qwen 深度解析</h3>
               <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 relative">
                  {isAiThinking && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center z-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
                  <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-6 h-6 bg-blue text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg shadow-blue/20">1</div>
                       <div className="space-y-2">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">思路分析</h4>
                          <p className="text-xs leading-relaxed text-gray-500">{currentQ.solution?.analysis || 'Qwen 正在分析知识点...'}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-6 h-6 bg-blue text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg shadow-blue/20">2</div>
                       <div className="space-y-2 w-full">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">分步详解</h4>
                          <div className="space-y-3">
                             {currentQ.solution?.steps?.map((step: string, i: number) => (
                                <p key={i} className="text-xs leading-relaxed text-gray-600 pl-2 border-l-2 border-gray-100">{step}</p>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 border-t border-gray-100 safe-bottom">
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => currentQ && onSaveQuestion(currentQ)}
            className="flex-none w-28 py-3 bg-gray-50 text-gray-800 border border-gray-100 rounded-2xl text-[11px] font-black flex items-center justify-center gap-2"
          >
            加入错题本
          </button>
          <div className="flex-1 bg-gray-50 rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-100 focus-within:border-primary transition-all">
            <span className="text-lg"><IconRobot size={18} color="#4A90E2" /></span>
            <input 
              className="bg-transparent flex-1 text-xs outline-none font-medium" 
              placeholder="问问 Qwen 老师..."
              value={input}
              onChange={input => setInput(input.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            />
            <button 
              onClick={handleSendChat}
              disabled={!input.trim() || isAiThinking}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-blue shadow-lg' : 'bg-gray-200'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperAnalysis;