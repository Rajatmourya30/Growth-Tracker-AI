import React, { useState } from 'react';
import { Transaction } from '../types';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface MoneyDataGridProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const MoneyDataGrid: React.FC<MoneyDataGridProps> = ({ transactions, onEdit, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Sort by date desc
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Details</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{t.date}</td>
                <td className="px-6 py-4">
                    {t.type === 'Income' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium"><ArrowUpCircle size={14}/> Income</span>
                    ) : (
                        <span className="flex items-center gap-1 text-slate-500"><ArrowDownCircle size={14}/> Expense</span>
                    )}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col">
                      <span className="font-medium">{t.details}</span>
                      {t.subcategory && <span className="text-xs text-slate-400">{t.subcategory}</span>}
                  </div>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(t)} className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Delete Confirmation */}
       {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Delete Transaction?</h3>
            <p className="text-sm text-slate-600 mb-6 text-center">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { onDelete(deleteId); setDeleteId(null); }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyDataGrid;