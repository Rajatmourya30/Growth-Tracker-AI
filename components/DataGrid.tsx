import React, { useState } from 'react';
import { DailyLog } from '../types';
import { Edit2, Trash2, AlertTriangle, Droplets } from 'lucide-react';

interface DataGridProps {
  logs: DailyLog[];
  onEdit: (log: DailyLog) => void;
  onDelete: (id: string) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ logs, onEdit, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Workout</th>
                <th className="px-4 py-3 font-medium text-center">Mins</th>
                <th className="px-4 py-3 font-medium text-center">Sleep</th>
                <th className="px-4 py-3 font-medium text-center">Water</th>
                <th className="px-4 py-3 font-medium text-right">Cals</th>
                <th className="px-4 py-3 font-medium text-right">Fiber</th>
                <th className="px-4 py-3 font-medium text-right">Prot</th>
                <th className="px-4 py-3 font-medium text-right">Carb</th>
                <th className="px-4 py-3 font-medium text-right">Fat</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((log) => {
                const dateObj = new Date(log.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{log.date}</td>
                    <td className="px-4 py-3 text-slate-500">{dayName}</td>
                    <td className="px-4 py-3 text-slate-700">{log.weight}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={log.workoutType}>{log.workoutType}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{log.workoutDuration}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{log.sleepHours}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Droplets size={10} />
                        {log.waterIntake} L
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{log.calories}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{log.fiber}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{log.protein}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{log.carbs}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{log.fat}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onEdit(log)} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteId(log.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Entry?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this log entry? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataGrid;