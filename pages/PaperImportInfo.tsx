
import React, { useState } from 'react';
import { Subject, Grade } from '../types';

interface PaperImportInfoProps {
  pages: string[];
  onSave: (info: { name: string, subject: Subject, grade: Grade }) => void;
  onCancel: () => void;
}

const PaperImportInfo: React.FC<PaperImportInfoProps> = ({ pages, onSave, onCancel }) => {
  const [name, setName] = useState(`试卷-${new Date().toLocaleDateString()}`);
  const [subject, setSubject] = useState(Subject.MATH);
  const [grade, setGrade] = useState(Grade.SENIOR_1);

  return (
    <div className="absolute inset-0 bg-white z-[250] flex flex-col animate-fadeIn overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">完善试卷信息</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
           {pages.map((p, i) => (
             <div key={i} className="flex-none w-24 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <img src={p} className="w-full h-full object-cover" alt="Page" />
             </div>
           ))}
        </div>

        <div className="space-y-6">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">试卷名称</label>
              <input 
                className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-primary transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：2024年期末数学模拟卷"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">学科</label>
                <select 
                  className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold appearance-none"
                  value={subject}
                  onChange={e => setSubject(e.target.value as Subject)}
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">年级</label>
                <select 
                  className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold appearance-none"
                  value={grade}
                  onChange={e => setGrade(e.target.value as Grade)}
                >
                  {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
         <button 
           onClick={() => onSave({ name, subject, grade })}
           className="w-full py-4 bg-primary text-white rounded-full font-black text-sm shadow-xl active:scale-95 transition-all"
         >
           确认并保存到试卷库
         </button>
      </div>
    </div>
  );
};

export default PaperImportInfo;
