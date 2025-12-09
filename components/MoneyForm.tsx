import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, IndianRupee } from 'lucide-react';

interface MoneyFormProps {
  initialData?: Transaction;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const emptyTransaction: Omit<Transaction, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  type: 'Expense',
  amount: 0,
  category: 'Others',
  details: '',
  subcategory: ''
};

// Consolidated categories for cleaner UI
const CATEGORIES = [
  'Food & Dining',        // Groceries, Vegetables, Milk, Restaurants, Snacks
  'Transportation',       // Fuel, Public Transport, Maintenance, Travel
  'Housing & Utilities',  // Rent, Bills, Internet, Subscriptions
  'Shopping',             // Clothing, Electronics, Amazon, Personal Items
  'Health & Wellness',    // Medical, Grooming, Gym, Therapy
  'Investments & Debt',   // SIP, Mutual Funds, EMI, Loans
  'Social & Leisure',     // Gifts, Parties, Donations, Entertainment
  'Income',               // Salary, Freelance, Business, Returns
  'Others'
];

const MoneyForm: React.FC<MoneyFormProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>(initialData || emptyTransaction);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAmount = Math.abs(formData.amount);
    if (formData.type === 'Expense') {
        finalAmount = -finalAmount;
    }

    onSave({ ...formData, amount: finalAmount });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Date</label>
            <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Amount</label>
                <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="number" step="0.01" name="amount" value={Math.abs(formData.amount)} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-[10px] text-slate-400 pt-1">Select a broad category. Use details for specifics.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Details / Item</label>
            <input type="text" name="details" value={formData.details} onChange={handleChange} placeholder="What did you buy?" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Subcategory (Optional)</label>
            <input type="text" name="subcategory" value={formData.subcategory || ''} onChange={handleChange} placeholder="e.g. Brand, specific type" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
             <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoneyForm;