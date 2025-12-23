
import React, { useState, useRef } from 'react';
import { IconPlus, IconCameraMain } from '../components/Icons';

interface CaptureProps {
  onCancel: () => void;
  onProcessed: (image: string) => void;
  onPaperImport: (pages: string[]) => void;
}

const Capture: React.FC<CaptureProps> = ({ onCancel, onProcessed, onPaperImport }) => {
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCapturedPages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoToScanFilter = () => {
    if (capturedPages.length === 0) return;
    onProcessed(capturedPages[capturedPages.length - 1]);
  };

  const handleConfirmPaper = () => {
    if (capturedPages.length > 0) {
      onPaperImport(capturedPages);
    }
  };

  return (
    <div className="absolute inset-0 bg-black z-[200] flex flex-col p-4 pt-[status-bar-height]">
      <div className="flex items-center justify-between text-white mb-6 safe-top">
        <button onClick={onCancel} className="text-sm font-bold opacity-60 px-2">取消</button>
        <span className="font-black text-sm tracking-widest uppercase">
          {capturedPages.length > 0 ? `已捕获 ${capturedPages.length} 页` : '拍照导入'}
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 rounded-[40px] border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center bg-gray-900 relative">
        {capturedPages.length > 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-[280px] aspect-[3/4] shadow-2xl">
                {capturedPages.map((p, idx) => (
                  <img 
                    key={idx} 
                    src={p} 
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl border-4 border-white transition-all shadow-xl" 
                    style={{ 
                      transform: `rotate(${(idx - capturedPages.length + 1) * 3}deg) translate(${(idx - capturedPages.length + 1) * 5}px, ${(idx - capturedPages.length + 1) * 5}px)`,
                      zIndex: idx,
                      opacity: 1 - (capturedPages.length - 1 - idx) * 0.2
                    }}
                    alt="Page"
                  />
                ))}
             </div>
             <button 
                onClick={() => setCapturedPages(prev => prev.slice(0, -1))}
                className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-widest underline"
              >
                删除最后一页
              </button>
          </div>
        ) : (
          <div className="text-center text-white/50 space-y-4 px-10">
            <div className="flex justify-center mb-4">
              <IconCameraMain size={64} color="rgba(255,255,255,0.5)" />
            </div>
            <p className="text-sm font-bold leading-relaxed">请对准题目或整页试卷</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-primary rounded-full text-white font-black text-xs shadow-xl"
            >
              相册导入
            </button>
          </div>
        )}
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="py-8 flex flex-col gap-4">
        <div className="flex justify-center items-center gap-8">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white"
            >
              <IconPlus size={24} />
            </button>
            <button 
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-2xl active:scale-90 transition-transform border-[6px] border-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconCameraMain size={32} color="#1a1a1a" />
            </button>
            <div className="w-14"></div>
        </div>

        {capturedPages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
             <button 
                onClick={handleGoToScanFilter}
                className="py-4 bg-white/10 text-white rounded-full font-black text-xs active:scale-95"
              >
                识别错题
              </button>
              <button 
                onClick={handleConfirmPaper}
                className="py-4 bg-primary text-white rounded-full font-black text-xs shadow-xl active:scale-95"
              >
                作为试卷入库
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capture;
