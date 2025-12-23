import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';
import { IconEye, IconRefresh } from '../components/Icons';

interface ScanFilterProps {
  image: string;
  onCancel: () => void;
  onComplete: (filteredImage: string, results: any[]) => void;
}

const ScanFilter: React.FC<ScanFilterProps> = ({ image, onCancel, onComplete }) => {
  const [contrast, setContrast] = useState(150);
  const [brightness, setBrightness] = useState(110);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      if (ctx) {
        ctx.filter = `grayscale(100%) contrast(${contrast}%) brightness(${brightness}%)`;
        ctx.drawImage(img, 0, 0);
      }
    };
    if (img.complete) img.onload(null as any);
  }, [contrast, brightness, image]);

  const handleConfirm = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    
    try {
      const filteredBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
      const results = await aiService.scanPaper(filteredBase64);
      onComplete(filteredBase64, results);
    } catch (e) {
      alert("识别失败，请调整照片亮度后重试。");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0F0F0F] z-[220] flex flex-col animate-fadeIn">
      <div className="p-4 flex items-center justify-between text-white shrink-0">
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-xs font-black tracking-[0.2em] uppercase">扫描预处理</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
        <img ref={imgRef} src={image} className="hidden" alt="Source" />
        
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={image} 
              className={`max-w-full max-h-full object-contain transition-all duration-300 ${showOriginal ? '' : 'grayscale contrast-[1.5] brightness-[1.1]'}`}
              style={{ 
                filter: showOriginal ? 'none' : `grayscale(100%) contrast(${contrast}%) brightness(${brightness}%)` 
              }}
              alt="Preview"
            />
            {showOriginal && (
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                原始图片
              </div>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-black tracking-widest uppercase">AI 深度分析中...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-8 bg-white/5 backdrop-blur-md rounded-t-[40px] border-t border-white/10 space-y-8">
        <div className="flex justify-around">
           <button 
             onMouseDown={() => setShowOriginal(true)} 
             onMouseUp={() => setShowOriginal(false)}
             onTouchStart={() => setShowOriginal(true)}
             onTouchEnd={() => setShowOriginal(false)}
             className="flex flex-col items-center gap-2 group"
           >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center active:bg-white/20 transition-colors">
                <IconEye size={20} color="#94A3B8" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">长按对比</span>
           </button>
           <div className="w-px h-12 bg-white/10"></div>
           <button onClick={() => { setContrast(150); setBrightness(110); }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center active:bg-white/20 transition-colors">
                <IconRefresh size={20} color="#94A3B8" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">重置滤镜</span>
           </button>
        </div>

        <div className="space-y-6 px-4">
           <ControlSlider label="打印对比度" value={contrast} min={100} max={300} onChange={setContrast} />
           <ControlSlider label="扫描亮度" value={brightness} min={80} max={180} onChange={setBrightness} />
        </div>

        <div className="pt-2">
           <button 
             onClick={handleConfirm}
             className="w-full py-5 bg-primary text-white rounded-[32px] font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest"
           >
             应用并进入框选
           </button>
        </div>
      </div>
    </div>
  );
};

const ControlSlider = ({ label, value, min, max, onChange }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</label>
      <span className="text-[10px] font-black text-primary">{value}%</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

export default ScanFilter;