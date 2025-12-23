
import React, { useState, useRef } from 'react';
import { Worksheet, WrongItem } from '../types';
import { IconPrint, IconShare, IconSave } from '../components/Icons';

interface WorksheetDetailProps {
  worksheet: Worksheet;
  allWrongItems: WrongItem[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet, allWrongItems, onBack, onDelete }) => {
  const [isSharing, setIsSharing] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  
  const worksheetItems = worksheet.items
    .map(id => allWrongItems.find(item => item.id === id))
    .filter((item): item is WrongItem => !!item);

  const handleShare = async () => {
    setIsSharing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (navigator.share) {
      try {
        await navigator.share({
          title: worksheet.title,
          text: `这是我生成的《${worksheet.title}》错题集，快来看看吧！`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      window.print();
    }
    
    setIsSharing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToLocal = () => {
    if (!paperRef.current) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${worksheet.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: serif; padding: 40px; }
          .paper { max-width: 800px; margin: 0 auto; background: white; }
        </style>
      </head>
      <body>
        <div class="paper">
          ${paperRef.current.innerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 bg-gray-100 z-[200] flex flex-col animate-fadeIn overflow-hidden printable-container">
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 truncate px-4">{worksheet.title}</h2>
        <button 
          onClick={() => {
            if (window.confirm("确定要从成品库中移除此文档吗？")) {
              onDelete(worksheet.id);
            }
          }}
          className="w-10 h-10 flex items-center justify-center bg-red/10 text-red rounded-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-gray-200/50 hide-scrollbar pb-40">
        <div 
          id="printable-paper"
          ref={paperRef}
          className="w-full max-w-[360px] bg-white shadow-2xl p-8 min-h-[510px] flex flex-col font-serif"
        >
          <div className="text-center mb-10 border-b-2 border-gray-900 pb-4">
             <h1 className="text-lg font-black text-gray-900 leading-tight">{worksheet.title}</h1>
             <div className="mt-3 flex justify-center gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
               <span>科目: {worksheet.subject}</span>
               <span>题数: {worksheetItems.length}</span>
               <span>日期: {new Date(worksheet.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
          
          <div className="space-y-8 flex-1">
            {worksheetItems.length === 0 ? (
              <div className="text-center py-20 text-gray-300 italic text-xs">
                部分题目数据可能已在错题本中移除
              </div>
            ) : (
              worksheetItems.map((item, idx) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex gap-2">
                    <span className="font-bold text-xs">{idx + 1}.</span>
                    <div className="flex-1 space-y-3">
                       <p className="text-[13px] leading-relaxed text-gray-900">{item.text}</p>
                       {item.image && (
                         <div className="w-full max-h-[120px] rounded-lg overflow-hidden border border-gray-100">
                            <img src={item.image} className="w-full h-full object-contain bg-gray-50" alt="Question" />
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="h-24 border-b border-dashed border-gray-100"></div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 pt-4 border-t border-gray-100 text-[8px] text-center text-gray-300 font-bold uppercase tracking-widest">
            电子错题本智能排版助手
          </div>
        </div>
      </div>

      <div className="absolute bottom-[20px] left-6 right-6 bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-4 flex items-center justify-between z-[40] border border-gray-100 animate-fadeIn">
         <button 
           onClick={handlePrint}
           className="flex flex-col items-center gap-1 flex-1 border-r border-gray-100"
         >
           <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
            <IconPrint size={20} color="#64748B" />
           </div>
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">打印文档</span>
         </button>
         
         <button 
           onClick={handleShare}
           className="flex flex-col items-center gap-1 flex-1 px-4"
         >
           <div className={`w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shadow-primary/20 transition-all ${isSharing ? 'scale-90 opacity-50' : 'active:scale-95'}`}>
             {isSharing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <IconShare size={24} color="white" />}
           </div>
           <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">分享 PDF</span>
         </button>

         <button 
           onClick={handleSaveToLocal}
           className="flex flex-col items-center gap-1 flex-1 border-l border-gray-100"
         >
           <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
            <IconSave size={20} color="#64748B" />
           </div>
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">存本地</span>
         </button>
      </div>
    </div>
  );
};

export default WorksheetDetail;
