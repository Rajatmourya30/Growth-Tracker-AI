import React, { useState } from 'react';
import { DailyLog } from '../types';
import { X, Sparkles, Loader2, Utensils, Calculator, Dumbbell, ChevronDown, Droplets } from 'lucide-react';
import { parseNaturalLanguageLog, calculateNutrition } from '../services/geminiService';

interface LogFormProps {
  initialData?: DailyLog;
  onSave: (log: Omit<DailyLog, 'id'>) => void;
  onClose: () => void;
}

const emptyLog: Omit<DailyLog, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  weight: 0,
  workoutType: 'Rest / Active Recovery',
  workoutDuration: 0,
  sleepHours: 0,
  waterIntake: 3,
  calories: 0,
  fiber: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const WORKOUT_OPTIONS = [
  "Rest / Active Recovery",
  "Chest & Triceps",
  "Back & Biceps",
  "Legs (Quads Focus)",
  "Legs (Hamstrings/Glutes)",
  "Legs (General)",
  "Shoulders & Abs",
  "Push Day",
  "Pull Day",
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Cardio",
  "HIIT",
  "Crossfit",
  "Yoga / Pilates",
  "Other / Custom"
];

const LogForm: React.FC<LogFormProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<DailyLog, 'id'>>(initialData || emptyLog);
  
  // Local state for nutrition inputs to allow text typing (e.g. "200kcal", "30g", "10.")
  const [nutritionDisplay, setNutritionDisplay] = useState({
    calories: (initialData?.calories || 0).toString(),
    protein: (initialData?.protein || 0).toString(),
    carbs: (initialData?.carbs || 0).toString(),
    fat: (initialData?.fat || 0).toString(),
    fiber: (initialData?.fiber || 0).toString(),
  });

  const [smartInput, setSmartInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // New state for food calculator
  const [foodInput, setFoodInput] = useState('');
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  const [addToExisting, setAddToExisting] = useState(false);

  // Derived state to control the dropdown value
  const currentWorkoutSelectValue = WORKOUT_OPTIONS.includes(formData.workoutType) 
    ? formData.workoutType 
    : 'Other / Custom';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Explicitly handle waterIntake as number since it's a select but represents a number
    const isNumberField = type === 'number' || name === 'waterIntake';
    
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Special handler for nutrition fields to allow flexible input
  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update display value immediately to allow typing
    setNutritionDisplay(prev => ({ ...prev, [name]: value }));

    // Extract first valid number from string (e.g. "200kcal" -> 200, "approx 30" -> 30)
    // Matches integer or float (10, 10.5, .5)
    const match = value.replace(/,/g, '').match(/[+-]?([0-9]*[.])?[0-9]+/);
    const numValue = match ? parseFloat(match[0]) : 0;

    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Clean up input on blur (e.g. "200kcal" -> "200")
  const handleNutritionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const val = formData[name as keyof typeof formData] as number;
    setNutritionDisplay(prev => ({ ...prev, [name]: val.toString() }));
  };

  const handleWorkoutSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other / Custom') {
      // Clear the workout type so the input is empty for typing
      setFormData(prev => ({ ...prev, workoutType: '' }));
    } else {
      setFormData(prev => ({ ...prev, workoutType: value }));
    }
  };

  const handleSmartFill = async () => {
    if (!smartInput.trim()) return;
    setIsProcessingAI(true);
    try {
      const parsed = await parseNaturalLanguageLog(smartInput);
      setFormData((prev) => {
        const newData = { ...prev, ...parsed };
        // Sync display state
        setNutritionDisplay({
            calories: (newData.calories ?? prev.calories).toString(),
            protein: (newData.protein ?? prev.protein).toString(),
            carbs: (newData.carbs ?? prev.carbs).toString(),
            fat: (newData.fat ?? prev.fat).toString(),
            fiber: (newData.fiber ?? prev.fiber).toString(),
        });
        return newData;
      });
    } catch (error) {
      alert("Failed to parse with AI. Please check your API key or try again.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleCalculateNutrition = async () => {
    if (!foodInput.trim()) return;
    setIsCalculatingNutrition(true);
    try {
        const result = await calculateNutrition(foodInput);
        
        if (result.calories === 0 && result.protein === 0) {
           alert("Could not identify nutritional info. Please check your spelling and try again.");
           return;
        }

        setFormData(prev => {
            const newCalories = parseFloat(((addToExisting ? (prev.calories || 0) : 0) + (result.calories || 0)).toFixed(1));
            const newProtein = parseFloat(((addToExisting ? (prev.protein || 0) : 0) + (result.protein || 0)).toFixed(1));
            const newCarbs = parseFloat(((addToExisting ? (prev.carbs || 0) : 0) + (result.carbs || 0)).toFixed(1));
            const newFat = parseFloat(((addToExisting ? (prev.fat || 0) : 0) + (result.fat || 0)).toFixed(1));
            const newFiber = parseFloat(((addToExisting ? (prev.fiber || 0) : 0) + (result.fiber || 0)).toFixed(1));

            setNutritionDisplay({
                calories: newCalories.toString(),
                protein: newProtein.toString(),
                carbs: newCarbs.toString(),
                fat: newFat.toString(),
                fiber: newFiber.toString(),
            });

            return {
                ...prev,
                calories: newCalories,
                protein: newProtein,
                carbs: newCarbs,
                fat: newFat,
                fiber: newFiber,
            };
        });
    } catch (e) {
        alert('Failed to calculate nutrition. Please try again.');
    } finally {
        setIsCalculatingNutrition(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Smart Entry Section */}
          {!initialData && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2 text-indigo-900 font-medium">
                <Sparkles size={18} className="text-indigo-600" />
                <span>AI Smart Fill (Day Summary)</span>
              </div>
              <p className="text-sm text-indigo-700 mb-3">
                Describe your day naturally (e.g., "Today I weighed 77.5kg, did a 60 min back workout, ate 2200 cals").
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Type your daily summary here..."
                  className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-indigo-300"
                />
                <button
                  type="button"
                  onClick={handleSmartFill}
                  disabled={isProcessingAI || !smartInput}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessingAI ? <Loader2 size={16} className="animate-spin" /> : 'Auto-Fill'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Weight (kg)</label>
                <input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-1 md:col-span-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Workout Type</label>
                <div className="relative">
                  <select 
                    value={currentWorkoutSelectValue}
                    onChange={handleWorkoutSelectChange} 
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {WORKOUT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                
                {currentWorkoutSelectValue === 'Other / Custom' && (
                  <div className="mt-2 relative">
                    <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      name="workoutType" 
                      value={formData.workoutType} 
                      onChange={handleChange} 
                      placeholder="Enter custom workout..."
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" 
                      autoFocus
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Duration (mins)</label>
                <input type="number" name="workoutDuration" value={formData.workoutDuration} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Sleep (hrs)</label>
                <input type="number" step="0.1" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Droplets size={12} className="text-blue-500" /> Water Intake
                </label>
                <div className="relative">
                    <select 
                        name="waterIntake" 
                        value={formData.waterIntake} 
                        onChange={handleChange} 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="1">1 Liter</option>
                        <option value="2">2 Liters</option>
                        <option value="3">3 Liters</option>
                        <option value="4">4 Liters</option>
                        <option value="5">5+ Liters</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Nutrition</h3>
              
              {/* Meal Calculator Section */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-medium">
                      <Utensils size={18} className="text-emerald-600" />
                      <span>Meal Calculator</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-emerald-800 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={addToExisting} 
                        onChange={(e) => setAddToExisting(e.target.checked)}
                        className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Add to existing totals
                    </label>
                  </div>
                  <p className="text-sm text-emerald-700 mb-3">
                    Enter your meals (e.g., "3 eggs, 2 slices toast, 1 protein shake") and we'll calculate the macros.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      value={foodInput}
                      onChange={(e) => setFoodInput(e.target.value)}
                      placeholder="Describe what you ate..."
                      className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleCalculateNutrition}
                      disabled={isCalculatingNutrition || !foodInput}
                      className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCalculatingNutrition ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator size={16} /> 
                          {addToExisting ? 'Calculate & Add' : 'Calculate & Replace'}
                        </>
                      )}
                    </button>
                  </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Calories</label>
                  <input required type="text" inputMode="decimal" name="calories" value={nutritionDisplay.calories} onChange={handleNutritionChange} onBlur={handleNutritionBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Protein (g)</label>
                  <input type="text" inputMode="decimal" name="protein" value={nutritionDisplay.protein} onChange={handleNutritionChange} onBlur={handleNutritionBlur} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Carbs (g)</label>
                  <input type="text" inputMode="decimal" name="carbs" value={nutritionDisplay.carbs} onChange={handleNutritionChange} onBlur={handleNutritionBlur} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Fat (g)</label>
                  <input type="text" inputMode="decimal" name="fat" value={nutritionDisplay.fat} onChange={handleNutritionChange} onBlur={handleNutritionBlur} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Fiber (g)</label>
                  <input type="text" inputMode="decimal" name="fiber" value={nutritionDisplay.fiber} onChange={handleNutritionChange} onBlur={handleNutritionBlur} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogForm;