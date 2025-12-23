import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { aiService } from '../services/aiService';
import { IconRobot, IconIdea, IconChevronRight, IconSuccess } from '../components/Icons';

const LearningAssistant: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeMode, setActiveMode] = useState<'overview' | 'chat'>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAiThinking]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isAiThinking) return;
    
    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);
    
    if (activeMode !== 'chat') setActiveMode('chat');

    try {
      const reply = await aiService.generalAssistantChat(chatHistory, inputText);
      setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Qwen 老师连接中断，请检查网络后重试。" }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const quickPrompts = [
    { label: '数学提分技巧', text: '请告诉我数学大题的得分策略' },
    { label: '物理公式记忆', text: '有没有记忆电磁感应公式的好方法？' },
    { label: '错题整理规范', text: '怎样整理错题本最高效？' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-fadeIn overflow-hidden relative">
      <div className="bg-gradient-to-br from-[#93CA76] to-[#7CB95E] p-6 pt-12 pb-10 text-white shrink-0 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <IconRobot size={24} color="white" /> Qwen 智能学伴
            </h2>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Powered by Qwen-VL AI</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            在线中
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col -mt-4 bg-gray-50 rounded-t-[32px]">
        {activeMode === 'overview' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar pb-32">
            <div className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">今日学习建议</p>
                <p className="text-sm font-black text-gray-800">建议复习“二次函数”考点</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-xl">
                <IconIdea size={24} color="#93CA76" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-[32px] shadow-soft border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">专注时长</p>
                <p className="text-xl font-black">128 <span className="text-xs">min</span></p>
              </div>
              <div className="bg-white p-4 rounded-[32px] shadow-soft border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">击败全国</p>
                <p className="text-xl font-black text-teal">92 %</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">你可以这样问我</p>
              {quickPrompts.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => { setInputText(p.text); handleSendMessage(); }}
                  className="w-full text-left bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-98 transition-all"
                >
                  <span className="text-xs font-bold text-gray-700">{p.label}</span>
                  <IconChevronRight size={16} color="#93CA76" strokeWidth={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-[32px] border border-indigo-100">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 ml-1">切换学科专家</p>
               <div className="flex gap-2">
                 {['数学', '物理', '化学', '生物'].map(s => (
                   <button key={s} className="flex-1 bg-white py-2.5 rounded-xl text-[10px] font-black text-indigo-500 shadow-sm border border-indigo-100 active:scale-95 transition-all">
                     {s}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar pb-40">
            {chatHistory.length === 0 && (
              <div className="py-10 text-center opacity-30">
                <IconRobot size={48} color="#CBD5E1" className="mx-auto mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">开始您的智慧对话</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] p-4 rounded-[24px] text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[24px] rounded-tl-none border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-bottom shrink-0 z-50">
        <div className="flex gap-3 items-center">
          {activeMode === 'chat' && (
            <button 
              onClick={() => setActiveMode('overview')}
              className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <div className="flex-1 bg-gray-50 rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-200 focus-within:ring-2 ring-primary/20 transition-all">
            <input 
              className="bg-transparent flex-1 text-xs outline-none font-medium text-gray-800" 
              placeholder="问问 Qwen 关于学习的一切..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!inputText.trim() || isAiThinking}
              className={`${inputText.trim() ? 'text-primary' : 'text-gray-300'} transition-colors active:scale-90`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningAssistant;