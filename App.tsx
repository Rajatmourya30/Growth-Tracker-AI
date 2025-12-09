import React, { useState, useEffect } from 'react';
import { DailyLog, Transaction, MindLog, AppSection, AppTab } from './types';
import { LayoutDashboard, Table2, Plus, Sparkles, Wallet, Dumbbell, Brain } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import DataGrid from './components/DataGrid';
import LogForm from './components/LogForm';
import AIInsights from './components/AIInsights';

import MoneyDashboard from './components/MoneyTracker'; // Renamed conceptually
import MoneyDataGrid from './components/MoneyDataGrid';
import MoneyForm from './components/MoneyForm';

import MindDashboard from './components/MindDashboard';
import MindDataGrid from './components/MindDataGrid';
import MindForm from './components/MindForm';

// Initial Data
const INITIAL_MUSCLE_DATA: DailyLog[] = [
  { id: '1', date: '2025-11-17', weight: 77.2, workoutType: 'Chest & Triceps', workoutDuration: 90, sleepHours: 7, waterIntake: 3, calories: 1935, fiber: 37.5, protein: 103, carbs: 253, fat: 71 },
  { id: '2', date: '2025-11-18', weight: 77.2, workoutType: 'Back & Biceps', workoutDuration: 60, sleepHours: 6, waterIntake: 2, calories: 1153, fiber: 25, protein: 60.7, carbs: 118.5, fat: 46.3 },
  { id: '3', date: '2025-11-19', weight: 77.2, workoutType: 'Off', workoutDuration: 60, sleepHours: 6, waterIntake: 3, calories: 1769, fiber: 27.1, protein: 54.9, carbs: 248, fat: 57.2 },
];

const INITIAL_MONEY_DATA: Transaction[] = [
    { id: 'm1', date: '2025-11-01', type: 'Income', amount: 1000, category: 'Donation', details: 'UPI payment recived', subcategory: 'Income' },
    { id: 'm2', date: '2025-11-01', type: 'Expense', amount: -10, category: 'Others', details: 'Sweet', subcategory: '' },
    { id: 'm3', date: '2025-11-01', type: 'Expense', amount: -50, category: 'Grocery', details: 'Curd', subcategory: '' },
];

const INITIAL_MIND_DATA: MindLog[] = [
    { id: 'md1', date: '2025-11-17', mindScore: 8, meditationMinutes: 20, bookName: 'Atomic Habits', pagesRead: 15, screenTimeMinutes: 145, topApps: 'Instagram, WhatsApp', digitalDetox: false, podcast: 'Huberman Lab' },
    { id: 'md2', date: '2025-11-18', mindScore: 6, meditationMinutes: 0, bookName: 'Atomic Habits', pagesRead: 10, screenTimeMinutes: 210, topApps: 'YouTube, X', digitalDetox: false, podcast: '' },
    { id: 'md3', date: '2025-11-19', mindScore: 9, meditationMinutes: 30, bookName: 'Atomic Habits', pagesRead: 25, screenTimeMinutes: 60, topApps: 'WhatsApp', digitalDetox: true, podcast: 'Naval Ravikant' },
];

const App: React.FC = () => {
  // --- STATE ---
  const [section, setSection] = useState<AppSection>('MUSCLE');
  const [tab, setTab] = useState<AppTab>('DASHBOARD');

  const [muscleLogs, setMuscleLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('fitTrackLogs');
    return saved ? JSON.parse(saved) : INITIAL_MUSCLE_DATA;
  });

  const [moneyLogs, setMoneyLogs] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moneyTrackerData');
    return saved ? JSON.parse(saved) : INITIAL_MONEY_DATA;
  });

  const [mindLogs, setMindLogs] = useState<MindLog[]>(() => {
    const saved = localStorage.getItem('mindTrackerData');
    return saved ? JSON.parse(saved) : INITIAL_MIND_DATA;
  });

  // Modals
  const [isMuscleFormOpen, setIsMuscleFormOpen] = useState(false);
  const [editingMuscleLog, setEditingMuscleLog] = useState<DailyLog | undefined>(undefined);

  const [isMoneyFormOpen, setIsMoneyFormOpen] = useState(false);
  const [editingMoneyLog, setEditingMoneyLog] = useState<Transaction | undefined>(undefined);

  const [isMindFormOpen, setIsMindFormOpen] = useState(false);
  const [editingMindLog, setEditingMindLog] = useState<MindLog | undefined>(undefined);

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('fitTrackLogs', JSON.stringify(muscleLogs)), [muscleLogs]);
  useEffect(() => localStorage.setItem('moneyTrackerData', JSON.stringify(moneyLogs)), [moneyLogs]);
  useEffect(() => localStorage.setItem('mindTrackerData', JSON.stringify(mindLogs)), [mindLogs]);

  // --- HANDLERS: MUSCLE ---
  const handleSaveMuscle = (data: Omit<DailyLog, 'id'>) => {
    if (editingMuscleLog) {
      setMuscleLogs(prev => prev.map(l => l.id === editingMuscleLog.id ? { ...data, id: editingMuscleLog.id } : l));
    } else {
      setMuscleLogs(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
    }
  };
  const handleDeleteMuscle = (id: string) => setMuscleLogs(prev => prev.filter(l => l.id !== id));
  
  // --- HANDLERS: MONEY ---
  const handleSaveMoney = (data: Omit<Transaction, 'id'>) => {
    if (editingMoneyLog) {
      setMoneyLogs(prev => prev.map(l => l.id === editingMoneyLog.id ? { ...data, id: editingMoneyLog.id } : l));
    } else {
      setMoneyLogs(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
    }
  };
  const handleDeleteMoney = (id: string) => setMoneyLogs(prev => prev.filter(l => l.id !== id));

  // --- HANDLERS: MIND ---
  const handleSaveMind = (data: Omit<MindLog, 'id'>) => {
    if (editingMindLog) {
      setMindLogs(prev => prev.map(l => l.id === editingMindLog.id ? { ...data, id: editingMindLog.id } : l));
    } else {
      setMindLogs(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
    }
  };
  const handleDeleteMind = (id: string) => setMindLogs(prev => prev.filter(l => l.id !== id));

  // --- ADD BUTTON LOGIC ---
  const handleAddNew = () => {
    if (section === 'MUSCLE') { setEditingMuscleLog(undefined); setIsMuscleFormOpen(true); }
    if (section === 'MONEY') { setEditingMoneyLog(undefined); setIsMoneyFormOpen(true); }
    if (section === 'MIND') { setEditingMindLog(undefined); setIsMindFormOpen(true); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Growth Tracker AI</h1>
          </div>

          {/* Section Navigation */}
          <nav className="flex bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'MUSCLE', label: 'Muscle', icon: Dumbbell },
              { id: 'MIND', label: 'Mind', icon: Brain },
              { id: 'MONEY', label: 'Money', icon: Wallet },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id as AppSection); setTab('DASHBOARD'); }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  section === item.id 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <item.icon size={16} />
                <span className={section === item.id ? 'inline' : 'hidden sm:inline'}>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleAddNew}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </header>

      {/* --- SUB NAVIGATION --- */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto">
                <button 
                    onClick={() => setTab('DASHBOARD')}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${tab === 'DASHBOARD' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center gap-2"><LayoutDashboard size={16}/> Dashboard</div>
                </button>
                <button 
                    onClick={() => setTab('LOGS')}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${tab === 'LOGS' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center gap-2"><Table2 size={16}/> Logs</div>
                </button>
                <button 
                    onClick={() => setTab('INSIGHTS')}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${tab === 'INSIGHTS' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center gap-2"><Sparkles size={16}/> AI Coach</div>
                </button>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
            
            {/* MUSCLE SECTION */}
            {section === 'MUSCLE' && (
                <>
                    {tab === 'DASHBOARD' && <Dashboard logs={muscleLogs} />}
                    {tab === 'LOGS' && <DataGrid logs={muscleLogs} onEdit={(l) => { setEditingMuscleLog(l); setIsMuscleFormOpen(true); }} onDelete={handleDeleteMuscle} />}
                    {tab === 'INSIGHTS' && <AIInsights section="MUSCLE" data={muscleLogs} />}
                </>
            )}

            {/* MIND SECTION */}
            {section === 'MIND' && (
                <>
                    {tab === 'DASHBOARD' && <MindDashboard logs={mindLogs} />}
                    {tab === 'LOGS' && <MindDataGrid logs={mindLogs} onEdit={(l) => { setEditingMindLog(l); setIsMindFormOpen(true); }} onDelete={handleDeleteMind} />}
                    {tab === 'INSIGHTS' && <AIInsights section="MIND" data={mindLogs} />}
                </>
            )}

            {/* MONEY SECTION */}
            {section === 'MONEY' && (
                <>
                    {tab === 'DASHBOARD' && <MoneyDashboard transactions={moneyLogs} />}
                    {tab === 'LOGS' && <MoneyDataGrid transactions={moneyLogs} onEdit={(l) => { setEditingMoneyLog(l); setIsMoneyFormOpen(true); }} onDelete={handleDeleteMoney} />}
                    {tab === 'INSIGHTS' && <AIInsights section="MONEY" data={moneyLogs} />}
                </>
            )}

        </div>
      </main>

      {/* --- MODALS --- */}
      {isMuscleFormOpen && (
        <LogForm initialData={editingMuscleLog} onSave={handleSaveMuscle} onClose={() => setIsMuscleFormOpen(false)} />
      )}

      {isMoneyFormOpen && (
        <MoneyForm initialData={editingMoneyLog} onSave={handleSaveMoney} onClose={() => setIsMoneyFormOpen(false)} />
      )}

      {isMindFormOpen && (
        <MindForm initialData={editingMindLog} onSave={handleSaveMind} onClose={() => setIsMindFormOpen(false)} />
      )}
    </div>
  );
};

export default App;
