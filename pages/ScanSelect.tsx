
import React, { useState, useEffect } from 'react';
import { Subject, Grade, QuestionType, ErrorReason, Mastery } from '../types';
import { IconSuccess } from '../components/Icons';

interface ScannedItem {
  text: string;
  type: QuestionType;
  difficulty: number;
  knowledgePoints: string[];
  box?: { x: number, y: number, w: number, h: number };
}

interface ScanSelectProps {
  results: any[];
  image: string;
  onConfirm: (finalItems: any[]) => void;
  onNavigate: (action: 'view' | 'continue') => void;
  onCancel: () => void;
}

const ScanSelect: React.FC<ScanSelectProps> = ({ results, image, onConfirm, onNavigate, onCancel }) => {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [tags, setTags] = useState({
    subject: Subject.MATH,
    grade: Grade.SENIOR_1,
    type: QuestionType.ANSWER,
    difficulty: 3
  });

  useEffect(() => {
    setItems(results.map((r, i) => ({
      text: r.text || '',
      type: (r.type as QuestionType) || QuestionType.ANSWER,
      difficulty: r.difficulty || 3,
      knowledgePoints: r.knowledgePoints || [],
      box: { 
        x: 10 + (i % 2) * 45, 
        y: 10 + Math.floor(i / 2) * 25, 
        w: 40, 
        h: 20 
      }
    })));
    setSelectedIndices(results.map((_, i) => i));
  }, [results]);

  const handleSave = () => {
    setIsSaving(true);
    const finalItems = items
      .filter((_, i) => selectedIndices.includes(i))
      .map(item => ({
        ...item,
        subject: tags.subject,
        grade: tags.grade,
        questionType: tags.type,
        difficulty: tags.difficulty,
        reason: [ErrorReason.CONCEPT],
        mastery: Mastery.LITTLE,
        image: image
      }));
    
    onConfirm(finalItems);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-[150] bg-white flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">框选与确认</h2>
        <div className="w-10"></div>
      </div>

      {!saveSuccess ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar bg-gray-50/50">
            <div className="relative rounded-[32px] overflow-hidden bg-gray-900 border border-gray-200 shadow-xl group aspect-[3/4]">
              <img src={image} className="w-full h-full object-cover opacity-90" alt="Scan Origin" />
              {items.map((item, idx) => (
                <div 
                  key={idx}
                  className={`absolute border-2 transition-all cursor-pointer ${selectedIndices.includes(idx) ? 'border-primary bg-primary/10' : 'border-white/30 bg-white/5'}`}
                  style={{ 
                    left: `${item.box?.x}%`, 
                    top: `${item.box?.y}%`, 
                    width: `${item.box?.w}%`, 
                    height: `${item.box?.h}%` 
                  }}
                  onClick={() => setSelectedIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
                >
                  <div className={`absolute top-0 left-0 -translate-y-full px-2 py-0.5 rounded-t-lg text-[8px] font-black ${selectedIndices.includes(idx) ? 'bg-primary text-white' : 'bg-gray-400 text-white'}`}>
                    题目 {idx + 1}
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-2xl flex items-center justify-center gap-2">
                 <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">点击识别框选中/取消题目</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-black uppercase ml-1 tracking-widest">默认学科</label>
                <select className="w-full bg-gray-50 rounded-xl text-xs p-3 font-bold outline-none border-none appearance-none" value={tags.subject} onChange={e => setTags({...tags, subject: e.target.value as Subject})}>
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-black uppercase ml-1 tracking-widest">默认年级</label>
                <select className="w-full bg-gray-50 rounded-xl text-xs p-3 font-bold outline-none border-none appearance-none" value={tags.grade} onChange={e => setTags({...tags, grade: e.target.value as Grade})}>
                  {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 pb-32">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">已选题目详情</h3>
              {items.filter((_, i) => selectedIndices.includes(i)).map((item, idx) => (
                <div key={idx} className="bg-white rounded-[32px] border border-gray-100 p-5 shadow-soft space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">题目 #{items.indexOf(item) + 1}</span>
                    <div className="flex gap-1">
                      {item.knowledgePoints.map(kp => <span key={kp} className="text-[8px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-black">#{kp}</span>)}
                    </div>
                  </div>
                  <textarea 
                    className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold text-gray-800 leading-relaxed min-h-[100px] outline-none border-none focus:ring-2 ring-primary/10 transition-all"
                    value={item.text}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[items.indexOf(item)].text = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="识别出的题目内容..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-[160] safe-bottom">
            <button 
              onClick={handleSave}
              disabled={selectedIndices.length === 0 || isSaving}
              className="w-full py-4 rounded-full bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : `确认保存 ${selectedIndices.length} 道题`}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-fadeIn">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[40px] flex items-center justify-center shadow-inner-soft">
            <IconSuccess size={48} color="#93CA76" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900">识别并保存成功</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-widest">扫描底图已存档<br/>Qwen 正在生成深度解答</p>
          </div>
          <div className="w-full space-y-4 pt-4">
            <button onClick={() => onNavigate('view')} className="w-full py-4 bg-primary text-white rounded-[32px] font-black text-sm shadow-xl active:scale-95 transition-all">
              查看我的错题本
            </button>
            <button onClick={() => onNavigate('continue')} className="w-full py-4 bg-gray-50 text-gray-400 rounded-[32px] font-black text-sm active:scale-95 transition-all">
              继续扫描下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanSelect;
