export interface DailyLog {
  id: string;
  date: string; // ISO YYYY-MM-DD
  weight: number;
  workoutType: string;
  workoutDuration: number;
  sleepHours: number;
  waterIntake: number;
  calories: number;
  fiber: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  avgWeight: number;
  weightChange: number;
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  avgSleep: number;
  avgWaterIntake: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
}

export interface AIAnalysisResponse {
  analysis: string;
  recommendations: string[];
}

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  type: 'Income' | 'Expense' | 'No Expense';
  amount: number;
  category: string;
  details: string;
  subcategory?: string;
}

export interface MindLog {
  id: string;
  date: string;
  mindScore: number; // 1-10
  meditationMinutes: number;
  bookName: string;
  pagesRead: number;
  screenTimeMinutes: number;
  topApps: string;
  digitalDetox: boolean; // Yes/No
  podcast: string;
}

export type AppSection = 'MUSCLE' | 'MIND' | 'MONEY';
export type AppTab = 'DASHBOARD' | 'LOGS' | 'INSIGHTS';