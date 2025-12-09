import React, { useState } from 'react';
import { MindLog } from '../types';
import { Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface MindDataGridProps {
  logs: MindLog[];
  onEdit: (log: MindLog) => void;
  onDelete: (id: string) => void;
}

const MindDataGrid: React.FC<MindDataGridProps> = ({ logs, onEdit, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getScoreColor = (val: number) => {
    if (val >= 8) return 'text-emerald-600 bg-emerald-50';
    if (val >= 5) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDuration = (mins: number) => {
    if (!mins) return '-';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium text-center">Score</th>
              <th className="px-6 py-3 font-medium text-center">Meditation</th>
              <th className="px-6 py-3 font-medium">Book / Pages</th>
              <th className="px-6 py-3 font-medium text-center">Screen Time</th>
              <th className="px-6 py-3 font-medium text-center">Detox</th>
              <th className="px-6 py-3 font-medium">Podcast / Apps</th>
              <th className="px-6 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">{log.date}</td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg font-bold ${getScoreColor(log.mindScore)}`}>
                        {log.mindScore}
                    </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-700">
                    {log.meditationMinutes > 0 ? `${log.meditationMinutes}m` : '-'}
                </td>
                <td className="px-6 py-4 text-slate-700">
                    {log.bookName ? (
                        <div className="flex flex-col">
                            <span className="font-medium">{log.bookName}</span>
                            <span className="text-xs text-slate-500">{log.pagesRead} pages</span>
                        </div>
                    ) : '-'}
                </td>
                <td className="px-6 py-4 text-center text-slate-700 font-medium">
                    {formatDuration(log.screenTimeMinutes)}
                </td>
                <td className="px-6 py-4 text-center">
                    {log.digitalDetox ? (
                        <CheckCircle2 size={18} className="text-emerald-500 inline" />
                    ) : (
                        <XCircle size={18} className="text-slate-300 inline" />
                    )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                    <div className="flex flex-col gap-1 max-w-[150px]">
                        {log.podcast && <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded truncate" title={log.podcast}>🎙️ {log.podcast}</span>}
                        {log.topApps && <span className="text-xs text-slate-400 truncate" title={log.topApps}>📱 {log.topApps}</span>}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
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
            ))}
          </tbody>
        </table>
      </div>
      
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Delete Entry?</h3>
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

export default MindDataGrid;