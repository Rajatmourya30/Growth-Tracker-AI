import React, { useState } from 'react';
import { MindLog } from '../types';
import { X, Smile, BookOpen, Brain, Smartphone, Mic, AppWindow, ShieldCheck } from 'lucide-react';

interface MindFormProps {
  initialData?: MindLog;
  onSave: (log: Omit<MindLog, 'id'>) => void;
  onClose: () => void;
}

const emptyLog: Omit<MindLog, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  mindScore: 5,
  meditationMinutes: 0,
  bookName: '',
  pagesRead: 0,
  screenTimeMinutes: 0,
  topApps: '',
  digitalDetox: false,
  podcast: ''
};

const MindForm: React.FC<MindFormProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<MindLog, 'id'>>(initialData || emptyLog);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const getMoodEmoji = (val: number) => {
    if (val <= 2) return '😭';
    if (val <= 4) return '😕';
    if (val <= 6) return '😐';
    if (val <= 8) return '🙂';
    return '😁';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Mind Log' : 'Log Mind Metrics'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Date</label>
            <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Mind Score */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Smile size={14} className="text-amber-500" /> Daily Mind Score (1-10)
             </label>
             <div className="flex items-center gap-4">
                <span className="text-2xl">{getMoodEmoji(formData.mindScore)}</span>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    name="mindScore" 
                    value={formData.mindScore} 
                    onChange={handleChange} 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <span className="font-bold text-slate-700 w-6 text-center">{formData.mindScore}</span>
             </div>
          </div>

          {/* Meditation & Screen Time */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                    <Brain size={14} className="text-teal-500" /> Meditation (min)
                </label>
                <input type="number" name="meditationMinutes" value={formData.meditationMinutes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                    <Smartphone size={14} className="text-red-500" /> Screen Time (min)
                </label>
                <input type="number" name="screenTimeMinutes" value={formData.screenTimeMinutes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
             </div>
          </div>

          {/* Reading */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
             <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <BookOpen size={14} className="text-blue-500" /> Reading
             </label>
             <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                    <input type="text" name="bookName" value={formData.bookName} onChange={handleChange} placeholder="Book Name" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="space-y-1">
                    <input type="number" name="pagesRead" value={formData.pagesRead} onChange={handleChange} placeholder="Pages" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
             </div>
          </div>

          {/* Digital Habits */}
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                    <AppWindow size={14} className="text-indigo-500" /> Highest to Less App Use
                </label>
                <input type="text" name="topApps" value={formData.topApps} onChange={handleChange} placeholder="e.g. Instagram, Youtube, X" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                    <Mic size={14} className="text-purple-500" /> Podcast Consumed
                </label>
                <input type="text" name="podcast" value={formData.podcast} onChange={handleChange} placeholder="Podcast name or topic" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>

            <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <input 
                    type="checkbox" 
                    name="digitalDetox" 
                    id="digitalDetox"
                    checked={formData.digitalDetox} 
                    onChange={handleChange} 
                    className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="digitalDetox" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={16} className={formData.digitalDetox ? "text-emerald-500" : "text-slate-400"} />
                    Digital Detox Met?
                </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
             <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MindForm;