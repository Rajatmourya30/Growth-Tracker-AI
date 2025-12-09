import React, { useMemo } from 'react';
import { MindLog } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { Smile, Brain, BookOpen, Smartphone, ShieldCheck, Zap, AppWindow } from 'lucide-react';

interface MindDashboardProps {
  logs: MindLog[];
}

const StatCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color: string }> = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-all">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 group-hover:scale-105 transition-transform origin-left">{value}</h3>
      {subValue && <p className={`text-xs mt-1 font-medium ${color}`}>{subValue}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${color}` })}
    </div>
  </div>
);

const MindDashboard: React.FC<MindDashboardProps> = ({ logs }) => {
  // Filter for last 7 days based on latest log
  const recentLogs = useMemo(() => {
    if (logs.length === 0) return [];
    
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestLogDate = new Date(sorted[sorted.length - 1].date);
    latestLogDate.setHours(0, 0, 0, 0);

    const cutoffDate = new Date(latestLogDate);
    cutoffDate.setDate(cutoffDate.getDate() - 6);
    cutoffDate.setHours(0, 0, 0, 0);

    return sorted.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate >= cutoffDate;
    });
  }, [logs]);

  const stats = useMemo(() => {
    if (recentLogs.length === 0) return null;
    const totalMeditation = recentLogs.reduce((sum, l) => sum + l.meditationMinutes, 0);
    const totalPages = recentLogs.reduce((sum, l) => sum + l.pagesRead, 0);
    const avgScore = recentLogs.reduce((sum, l) => sum + l.mindScore, 0) / recentLogs.length;
    const avgScreenTime = recentLogs.reduce((sum, l) => sum + l.screenTimeMinutes, 0) / recentLogs.length;
    const detoxCount = recentLogs.filter(l => l.digitalDetox).length;
    
    // Impact Calculation: Avg Score when Meditated > 0 vs No Meditation
    const meditatedDays = recentLogs.filter(l => l.meditationMinutes > 0);
    const noMedDays = recentLogs.filter(l => l.meditationMinutes === 0);
    
    const avgScoreWithMed = meditatedDays.length ? meditatedDays.reduce((sum, l) => sum + l.mindScore, 0) / meditatedDays.length : 0;
    const avgScoreNoMed = noMedDays.length ? noMedDays.reduce((sum, l) => sum + l.mindScore, 0) / noMedDays.length : 0;
    
    const impact = meditatedDays.length && noMedDays.length ? (avgScoreWithMed - avgScoreNoMed) : 0;

    // Top App Logic
    const allApps = recentLogs.map(l => l.topApps).join(',').split(',').map(s => s.trim()).filter(Boolean);
    const appCounts = allApps.reduce((acc, app) => { acc[app] = (acc[app] || 0) + 1; return acc; }, {} as Record<string, number>);
    const topApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const h = Math.floor(avgScreenTime / 60);
    const m = Math.round(avgScreenTime % 60);

    return {
      avgScore,
      totalMeditation,
      totalPages,
      screenTimeStr: `${h}h ${m}m`,
      detoxCount,
      impact,
      topApp
    };
  }, [recentLogs]);

  if (!stats || recentLogs.length === 0) return <div className="p-8 text-center text-slate-500">No data available for the latest week. Start logging!</div>;

  const chartData = recentLogs.map(log => ({
    ...log,
    screenTimeHrs: parseFloat((log.screenTimeMinutes / 60).toFixed(1)),
    day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-bold text-slate-700">Weekly Mind Metrics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Mind Score" 
            value={`${stats.avgScore.toFixed(1)}/10`} 
            subValue="Daily Average"
            icon={<Smile />} 
            color="text-amber-500" 
        />
        <StatCard 
            title="Screen Time" 
            value={stats.screenTimeStr}
            subValue={`Most used: ${stats.topApp}`}
            icon={<Smartphone />} 
            color="text-red-500" 
        />
        <StatCard 
            title="Mindful Minutes" 
            value={`${stats.totalMeditation}m`} 
            subValue={`${stats.detoxCount} Digital Detox Days`}
            icon={<Brain />} 
            color="text-teal-500" 
        />
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-xl shadow-md text-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Smart Insight</p>
                <Zap size={20} className="text-yellow-300" />
            </div>
            <div>
                 {stats.impact !== 0 ? (
                    <>
                        <h3 className="text-2xl font-bold">
                            {stats.impact > 0 ? '+' : ''}{stats.impact.toFixed(1)} pts
                        </h3>
                        <p className="text-xs text-indigo-100 mt-1">
                            Impact on Mind Score when you meditate.
                        </p>
                    </>
                 ) : (
                    <p className="text-sm font-medium mt-2">Log both meditation and no-meditation days to see impact.</p>
                 )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood vs Screen Time Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Smile size={20} className="text-amber-500" /> Mood & Screen Time Flow
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="mindScore" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} name="Mind Score" />
                <Line yAxisId="right" type="monotone" dataKey="screenTimeHrs" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Screen Time (hrs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habits Stacked Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-500" /> Daily Habits (Pages & Minutes)
          </h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
                <Legend />
                <Bar dataKey="pagesRead" stackId="a" fill="#3b82f6" name="Pages Read" radius={[0, 0, 4, 4]} />
                <Bar dataKey="meditationMinutes" stackId="a" fill="#14b8a6" name="Meditation (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Top Apps List (Horizontal) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AppWindow size={20} className="text-indigo-500" /> Digital Distractions (Top Apps)
        </h3>
        <div className="flex flex-wrap gap-2">
            {recentLogs.map(log => log.topApps.split(',').map(app => app.trim())).flat().filter(Boolean).slice(0, 10).map((app, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                    {app}
                </span>
            ))}
             {recentLogs.every(l => !l.topApps) && <span className="text-slate-400 text-sm">No apps logged.</span>}
        </div>
      </div>
    </div>
  );
};

export default MindDashboard;