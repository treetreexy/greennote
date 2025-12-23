import React, { useState } from 'react';
import { WrongItem } from '../types';
import { aiService } from '../services/aiService';
import { IconMagic } from '../components/Icons';

interface ExportPreviewProps {
  items: WrongItem[];
  onBack: () => void;
  onComplete: (title: string) => void;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({ items, onBack, onComplete }) => {
  const [docItems, setDocItems] = useState<WrongItem[]>([...items]);
  const [exportMode, setExportMode] = useState<'test' | 'note'>('test');
  const [title, setTitle] = useState('理科错题集');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [config, setConfig] = useState({
    spacing: 'medium' as 'small' | 'medium' | 'large',
    columns: 1,
    showAnswer: false
  });

  const generateAiTitle = async () => {
    setIsGeneratingTitle(true);
    try {
      const kp = docItems.flatMap(i => i.knowledgePoints);
      const generatedTitle = await aiService.generateTitle(kp);
      setTitle(generatedTitle || title);
    } catch (e) {
      alert("AI 标题生成失败。");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onComplete(title);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 bg-gray-100 z-[200] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
           <button onClick={() => setExportMode('test')} className={`px-4 py-2 text-[10px] font-black rounded-xl ${exportMode === 'test' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>练习卷</button>
           <button onClick={() => setExportMode('note')} className={`px-4 py-2 text-[10px] font-black rounded-xl ${exportMode === 'note' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>学霸笔记</button>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-gray-200/50 hide-scrollbar pb-60">
        <div className={`w-full max-w-[360px] bg-white shadow-2xl min-h-[510px] p-6 transition-all relative ${exportMode === 'test' ? 'font-serif' : 'font-sans'}`}>
          <div className="text-center mb-8 relative border-b-2 border-gray-900 pb-4">
             <input value={title} onChange={e => setTitle(e.target.value)} className="w-full text-center text-lg font-black bg-transparent outline-none" />
             <button onClick={generateAiTitle} disabled={isGeneratingTitle} className="absolute -right-2 -top-2 w-7 h-7 bg-primary text-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
               {isGeneratingTitle ? "..." : <IconMagic size={14} color="white" />}
             </button>
          </div>
          
          <div className="space-y-6">
            {docItems.map((item, idx) => (
              <div key={item.id} className="flex gap-2">
                <span className="font-bold text-xs">{idx + 1}.</span>
                <p className="text-[13px] leading-relaxed text-gray-900">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-t-[40px] p-6 shadow-tabbar absolute bottom-0 left-0 right-0 z-40 border-t border-gray-100">
        <button onClick={handleExport} disabled={isExporting} className="w-full py-4 rounded-3xl bg-primary text-white font-black text-sm shadow-xl active:scale-95 transition-all">
          {isExporting ? '生成中...' : '立即生成高清文档并保存'}
        </button>
      </div>
    </div>
  );
};

export default ExportPreview;