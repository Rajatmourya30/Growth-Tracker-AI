import React, { useEffect, useState } from 'react';
import { DailyLog, Transaction, MindLog, AppSection } from '../types';
import { analyzeWeeklyProgress, analyzeMoneyProgress, analyzeMindProgress } from '../services/geminiService';
import { Bot, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  section: AppSection;
  data: any[]; // Accepts logs for Muscle, Money, or Mind
}

const AIInsights: React.FC<AIInsightsProps> = ({ section, data }) => {
  const [analysis, setAnalysis] = useState<{ summary: string; tips: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset analysis when section changes
  useEffect(() => {
    setAnalysis(null);
    setError('');
  }, [section]);

  const runAnalysis = async () => {
    if (data.length < 3) {
      setError(`Please add at least 3 ${section.toLowerCase()} entries to get a meaningful analysis.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      let result;
      if (section === 'MUSCLE') {
        result = await analyzeWeeklyProgress(data as DailyLog[]);
      } else if (section === 'MONEY') {
        result = await analyzeMoneyProgress(data as Transaction[]);
      } else if (section === 'MIND') {
        result = await analyzeMindProgress(data as MindLog[]);
      }
      
      setAnalysis(result || null);
    } catch (e) {
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch(section) {
        case 'MUSCLE': return 'Fitness Insights';
        case 'MONEY': return 'Financial Advisor';
        case 'MIND': return 'Wellness Coach';
        default: return 'AI Insights';
    }
  };

  const getDescription = () => {
    switch(section) {
        case 'MUSCLE': return 'Personalized feedback on your workouts and nutrition.';
        case 'MONEY': return 'Analysis of your spending habits and saving opportunities.';
        case 'MIND': return 'Insights into your mood, habits, and digital balance.';
        default: return 'AI analysis of your data.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className={`rounded-2xl p-8 text-white shadow-xl ${
          section === 'MUSCLE' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
          section === 'MONEY' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
          'bg-gradient-to-r from-amber-500 to-orange-500'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{getTitle()}</h2>
            <p className="text-white/90">{getDescription()}</p>
          </div>
        </div>
        
        {!analysis && !loading && (
           <button 
             onClick={runAnalysis}
             className={`mt-4 bg-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg ${
                section === 'MUSCLE' ? 'text-indigo-600 hover:bg-indigo-50' :
                section === 'MONEY' ? 'text-emerald-600 hover:bg-emerald-50' :
                'text-amber-600 hover:bg-amber-50'
             }`}
           >
             Generate Analysis
           </button>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-white/90 mt-4">
             <Loader2 className="animate-spin" />
             <span>Analyzing your metrics...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {analysis && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`
                ${section === 'MUSCLE' ? 'text-blue-600' : section === 'MONEY' ? 'text-emerald-600' : 'text-amber-600'}
              `} />
              <h3 className="text-lg font-bold text-slate-800">Summary</h3>
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {analysis.summary}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">Actionable Tips</h3>
            </div>
            <ul className="space-y-4">
              {analysis.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      section === 'MUSCLE' ? 'bg-indigo-100 text-indigo-700' :
                      section === 'MONEY' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-600">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
