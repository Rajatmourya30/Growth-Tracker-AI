import React, { useMemo } from 'react';
import { DailyLog, WeeklySummary } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart
} from 'recharts';
import { Activity, Scale, Utensils, Droplets, Moon } from 'lucide-react';

interface DashboardProps {
  logs: DailyLog[];
}

const StatCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color: string }> = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subValue && <p className={`text-xs mt-1 font-medium ${color}`}>{subValue}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${color}` })}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  // Filter for last 7 days based on latest log
  const recentLogs = useMemo(() => {
    if (logs.length === 0) return [];
    
    // Sort ascending to find the latest date
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestLogDate = new Date(sorted[sorted.length - 1].date);
    latestLogDate.setHours(0, 0, 0, 0);

    // Calculate start date (6 days before latest = 7 days total)
    const cutoffDate = new Date(latestLogDate);
    cutoffDate.setDate(cutoffDate.getDate() - 6);
    cutoffDate.setHours(0, 0, 0, 0);

    return sorted.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate >= cutoffDate;
    });
  }, [logs]);

  const summary = useMemo<WeeklySummary | null>(() => {
    if (recentLogs.length === 0) return null;

    // recentLogs are already sorted ascending from the filter step
    const latestWeight = recentLogs[recentLogs.length - 1].weight;
    const startWeight = recentLogs[0].weight;

    // Use Number() casting to prevent string concatenation issues (e.g. "3" + "3" = "33")
    const totalDuration = recentLogs.reduce((sum, log) => sum + (Number(log.workoutDuration) || 0), 0);
    const totalSleep = recentLogs.reduce((sum, log) => sum + (Number(log.sleepHours) || 0), 0);
    const totalWater = recentLogs.reduce((sum, log) => sum + (Number(log.waterIntake) || 0), 0);

    const avg = (key: keyof DailyLog) => recentLogs.reduce((sum, log) => sum + (Number(log[key]) || 0), 0) / recentLogs.length;

    return {
      startDate: recentLogs[0].date,
      endDate: recentLogs[recentLogs.length - 1].date,
      avgWeight: avg('weight'),
      weightChange: latestWeight - startWeight,
      totalWorkouts: recentLogs.filter(l => l.workoutDuration > 0).length,
      totalDuration,
      avgDuration: totalDuration / 7, // Assuming weekly view
      avgSleep: totalSleep / recentLogs.length,
      avgWaterIntake: totalWater / recentLogs.length,
      avgCalories: avg('calories'),
      avgProtein: avg('protein'),
      avgCarbs: avg('carbs'),
      avgFat: avg('fat'),
      avgFiber: avg('fiber')
    };
  }, [recentLogs]);

  if (!summary) return <div className="p-8 text-center text-slate-500">No data available for the latest week. Add some logs!</div>;

  const chartData = recentLogs.map(log => ({
    ...log,
    day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <h2 className="text-lg font-bold text-slate-700">Weekly Overview ({new Date(summary.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(summary.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})})</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Avg Weight"
          value={`${summary.avgWeight.toFixed(1)} kg`}
          subValue={`${summary.weightChange > 0 ? '+' : ''}${summary.weightChange.toFixed(1)} kg this week`}
          icon={<Scale />}
          color="text-blue-600"
        />
        <StatCard
          title="Avg Calories"
          value={`${Math.round(summary.avgCalories)} kcal`}
          subValue={`P:${Math.round(summary.avgProtein)} C:${Math.round(summary.avgCarbs)} F:${Math.round(summary.avgFat)}`}
          icon={<Utensils />}
          color="text-emerald-600"
        />
        <StatCard
          title="Avg Sleep"
          value={`${summary.avgSleep.toFixed(1)} hrs`}
          subValue={summary.avgSleep >= 7 ? 'Optimal Rest' : 'Needs improvement'}
          icon={<Moon />}
          color="text-indigo-600"
        />
        <StatCard
          title="Hydration"
          value={`${summary.avgWaterIntake.toFixed(1)} L`}
          subValue="Daily Average"
          icon={<Droplets />}
          color="text-cyan-600"
        />
        <StatCard
          title="Activity"
          value={`${summary.totalDuration} mins`}
          subValue={`${summary.totalWorkouts} workouts`}
          icon={<Activity />}
          color="text-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight & Calories Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weight vs Calories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 500', 'dataMax + 500']} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Calories" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macros Stacked Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Macronutrient Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
                <Legend />
                <Bar dataKey="protein" stackId="a" fill="#3b82f6" name="Protein (g)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="carbs" stackId="a" fill="#10b981" name="Carbs (g)" />
                <Bar dataKey="fat" stackId="a" fill="#f59e0b" name="Fat (g)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep & Hydration Trends - Full Width */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recovery Trends (Sleep & Hydration)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 12]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 6]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="sleepHours" fill="#818cf8" name="Sleep (hrs)" barSize={30} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="waterIntake" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} name="Water (L)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;