import React, { useState, useEffect, useRef } from 'react';
import { WrongItem, Solution, ChatMessage, Subject, Grade, Mastery, ErrorReason, QuestionType } from '../types';
import { aiService } from '../services/aiService';
import { IconStar, IconRobot } from '../components/Icons';

interface EditGroupProps {
  label: string;
  children?: React.ReactNode;
}

const EditGroup = ({ label, children }: EditGroupProps) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">{label}</label>
    {children}
  </div>
);

interface WrongDetailProps {
  item: WrongItem;
  onBack: () => void;
  onUpdateItem: (updated: WrongItem) => void;
}

const WrongDetail: React.FC<WrongDetailProps> = ({ item, onBack, onUpdateItem }) => {
  const [solution, setSolution] = useState<Solution | null>(item.solution || null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(item.chatHistory || []);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<WrongItem>({ ...item });
  const [kpText, setKpText] = useState(item.knowledgePoints.join('，'));

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!solution) loadSolution();
  }, [item]);

  const loadSolution = async () => {
    setLoading(true);
    try {
      const res = await aiService.solveQuestion(item.text);
      if (res) {
        const updated = { ...item, solution: res };
        setSolution(res);
        onUpdateItem(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTags = () => {
    const finalKps = kpText.split(/[，,]/).map(s => s.trim()).filter(s => s);
    const updated = { ...editedItem, knowledgePoints: finalKps };
    onUpdateItem(updated);
    setIsEditing(false);
  };

  const toggleReason = (reason: ErrorReason) => {
    const current = [...editedItem.reason];
    if (current.includes(reason)) {
      setEditedItem({ ...editedItem, reason: current.filter(r => r !== reason) });
    } else {
      setEditedItem({ ...editedItem, reason: [...current, reason] });
    }
  };

  const handleSendChat = async () => {
    if (!inputText.trim() || isAiThinking) return;
    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);
    
    try {
      const reply = await aiService.chatAboutQuestion(item.text, [...chatHistory, userMsg], inputText);
      setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Qwen 思考中遇到了网络波动，请重试。" }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-[150] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 flex items-center gap-4 bg-white border-b border-gray-100 shrink-0 z-20 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 active:scale-90 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-gray-900 truncate">{item.subject} · {item.knowledgePoints[0] || '题目详情'}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.source}</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isEditing ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {isEditing ? '完成' : '修改标签'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 hide-scrollbar relative">
        {isEditing && (
          <div className="bg-white p-6 shadow-xl border-b space-y-5 animate-fadeIn z-30 relative mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">标签管理</h3>
            <div className="grid grid-cols-2 gap-4">
               <EditGroup label="学科">
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-xs font-bold" value={editedItem.subject} onChange={e => setEditedItem({...editedItem, subject: e.target.value as Subject})}>
                      {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </EditGroup>
               <EditGroup label="掌握度">
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-xs font-bold" value={editedItem.mastery} onChange={e => setEditedItem({...editedItem, mastery: e.target.value as Mastery})}>
                      {Object.values(Mastery).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </EditGroup>
               <EditGroup label="题型">
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-xs font-bold" value={editedItem.questionType} onChange={e => setEditedItem({...editedItem, questionType: e.target.value as QuestionType})}>
                      {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </EditGroup>
               <EditGroup label="年级">
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-xs font-bold" value={editedItem.grade} onChange={e => setEditedItem({...editedItem, grade: e.target.value as Grade})}>
                      {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </EditGroup>
            </div>
            <EditGroup label="知识点 (逗号分隔)">
                <input 
                  className="w-full bg-gray-50 p-3 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-primary" 
                  value={kpText} 
                  onChange={e => setKpText(e.target.value)}
                  placeholder="例如：二次函数，解析几何..."
                />
            </EditGroup>
            <EditGroup label="错误原因 (可多选)">
               <div className="flex flex-wrap gap-2 pt-1">
                  {Object.values(ErrorReason).map(reason => {
                    const selected = editedItem.reason.includes(reason);
                    return (
                      <button 
                        key={reason}
                        onClick={() => toggleReason(reason)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${selected ? 'bg-red text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {reason}
                      </button>
                    );
                  })}
               </div>
            </EditGroup>
            <div className="flex gap-3 pt-2">
               <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs">取消</button>
               <button onClick={handleSaveTags} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/20">保存设置</button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6 pb-32">
          <div className="bg-white p-5 rounded-[32px] shadow-soft border border-gray-100">
            {item.image && (
              <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-50 mb-4 max-h-[200px]">
                <img src={item.image} className="w-full h-full object-contain" alt="Origin" />
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-2">
                 <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-lg font-black uppercase tracking-wider">{item.subject}</span>
                 <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg font-black uppercase tracking-wider">{item.questionType}</span>
                 {item.wrongCount > 1 && (
                   <span className="text-[9px] px-2 py-0.5 bg-red text-white rounded-lg font-black uppercase tracking-wider">做错 {item.wrongCount} 次</span>
                 )}
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <IconStar key={s} filled={s <= item.difficulty} />)}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-800 font-medium">{item.text}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
               {item.reason.map(r => (
                 <span key={r} className="text-[9px] font-black text-red bg-red/5 px-2 py-1 rounded-md"># {r}</span>
               ))}
               {item.knowledgePoints.map(kp => (
                 <span key={kp} className="text-[9px] font-black text-blue bg-blue/5 px-2 py-1 rounded-md">@{kp}</span>
               ))}
               <span className={`text-[9px] font-black px-2 py-1 rounded-md ${item.mastery === Mastery.MASTERED ? 'bg-teal/10 text-teal' : 'bg-orange/10 text-orange'}`}>
                 状态：{item.mastery}
               </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center opacity-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4">Qwen 正在深度拆解...</p>
            </div>
          ) : solution && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 rounded-[32px] shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal/5 rounded-bl-full -mr-8 -mt-8"></div>
                <h3 className="text-xs font-black mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-teal rounded-full"></span> Qwen 深度分析</h3>
                <p className="text-xs leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">{solution.analysis}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-soft">
                <h3 className="text-xs font-black mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-primary rounded-full"></span> 详尽解题步骤</h3>
                <div className="space-y-4">
                  {solution.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center text-[9px] font-black text-gray-400 shrink-0">{i+1}</div>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              {chatHistory.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">问答回顾</h3>
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-[24px] text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shrink-0 safe-bottom">
        <div className="flex gap-3 items-center">
          <div className="flex-1 bg-gray-50 rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-200 focus-within:ring-1 ring-primary/30 transition-all">
            <span className="text-lg"><IconRobot size={20} color="#93CA76" /></span>
            <input 
              className="bg-transparent flex-1 text-xs outline-none font-medium text-gray-800" 
              placeholder="有哪里没看懂？问问 Qwen..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            />
            {isAiThinking ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            ) : (
              <button onClick={handleSendChat} disabled={!inputText.trim()} className={`${inputText.trim() ? 'text-primary' : 'text-gray-300'} transition-colors`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WrongDetail;