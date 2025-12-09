import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, Tag, Percent, CreditCard, Activity } from 'lucide-react';

interface MoneyTrackerProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const MoneyTracker: React.FC<MoneyTrackerProps> = ({ transactions }) => {
  // Filter for last 7 days based on latest transaction
  const recentTransactions = useMemo(() => {
    if (transactions.length === 0) return [];
    
    // Sort ascending by date to find latest
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestDate = new Date(sorted[sorted.length - 1].date);
    latestDate.setHours(0,0,0,0);
    
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - 6);
    cutoffDate.setHours(0,0,0,0);

    return sorted.filter(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        return tDate >= cutoffDate;
    });
  }, [transactions]);

  // Calculate Totals and Stats
  const stats = useMemo(() => {
    const income = recentTransactions
      .filter(t => t.type === 'Income' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = recentTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const dailyAvgSpend = expense / 7;

    return {
      income,
      expense,
      balance: income - expense,
      savingsRate,
      dailyAvgSpend
    };
  }, [recentTransactions]);

  // Prepare Daily Data for Bar Chart
  const dailyData = useMemo(() => {
    if (recentTransactions.length === 0) return [];
    
    const dayMap = new Map<string, { day: string, income: number, expense: number }>();
    
    // Initialize last 7 days
    const endDate = new Date(recentTransactions[recentTransactions.length - 1].date);
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dayMap.set(key, { 
            day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
            income: 0, 
            expense: 0 
        });
    }

    recentTransactions.forEach(t => {
        const key = t.date;
        if (dayMap.has(key)) {
            const entry = dayMap.get(key)!;
            if (t.type === 'Income') entry.income += t.amount;
            if (t.type === 'Expense') entry.expense += Math.abs(t.amount);
        }
    });

    return Array.from(dayMap.values());
  }, [recentTransactions]);

  // Group by Category for Pie Chart
  const categoryData = useMemo(() => {
    const groups: Record<string, number> = {};
    recentTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const cat = t.category || 'Uncategorized';
        groups[cat] = (groups[cat] || 0) + Math.abs(t.amount);
      });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 
  }, [recentTransactions]);

  if (recentTransactions.length === 0) return <div className="p-8 text-center text-slate-500">No transactions in the latest week.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-bold text-slate-700">Financial Overview (Last 7 Days)</h2>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Net Flow</p>
            <h3 className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
               <Wallet size={14} /> Balance change
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Savings Rate</p>
            <h3 className={`text-2xl font-bold ${stats.savingsRate >= 20 ? 'text-emerald-600' : 'text-slate-800'}`}>
              {stats.savingsRate.toFixed(1)}%
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
               <Percent size={14} /> of Income saved
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.expense)}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
               <ArrowDownCircle size={14} /> {formatCurrency(stats.dailyAvgSpend)} / day avg
            </div>
          </div>
        </div>

         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Income</p>
            <h3 className="text-2xl font-bold text-indigo-600">
              {formatCurrency(stats.income)}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
               <ArrowUpCircle size={14} /> Cash in
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Flow Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-blue-500" /> Daily Cash Flow
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Spending Mix
          </h3>
          <div className="h-48 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar">
             <div className="space-y-3">
              {categoryData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-600 truncate max-w-[120px]" title={cat.name}>{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{((cat.value / (stats.expense || 1)) * 100).toFixed(0)}%</span>
                </div>
              ))}
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={20} className="text-slate-500" /> Recent Transactions
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Details</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {recentTransactions.slice().reverse().slice(0, 5).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500">{t.date}</td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                    {t.category}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{t.details}</td>
                            <td className={`px-4 py-3 text-right font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {t.type === 'Expense' ? '-' : '+'}{formatCurrency(t.amount)}
                            </td>
                        </tr>
                    ))}
                    {recentTransactions.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-slate-400">No recent activity</td></tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default MoneyTracker;