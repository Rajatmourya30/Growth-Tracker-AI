import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, Transaction, MindLog } from "../types";

// Lazy load the client to prevent crashes if API key is missing on load
const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseNaturalLanguageLog = async (text: string): Promise<Partial<DailyLog>> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract fitness data from this text into a JSON object.
      Current date is ${new Date().toISOString().split('T')[0]}.
      If date is not specified, use current date.
      Fields: date (YYYY-MM-DD), weight (number), workoutType (string), workoutDuration (number, minutes), sleepHours (number), waterIntake (number, liters), calories (number), fiber (number), protein (number), carbs (number), fat (number).
      Input: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            weight: { type: Type.NUMBER },
            workoutType: { type: Type.STRING },
            workoutDuration: { type: Type.NUMBER },
            sleepHours: { type: Type.NUMBER },
            waterIntake: { type: Type.NUMBER },
            calories: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (error) {
    console.error("Gemini parse error:", error);
    throw error;
  }
};

export const calculateNutrition = async (foodDescription: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}> => {
  try {
    const ai = getAiClient();
    // Using gemini-3-pro-preview for better reasoning on messy text/brands
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a nutrition expert. Analyze the following food intake text.
      1. Correct any typos (e.g. "protine" -> "protein", "ates" -> "ate").
      2. Identify specific brands if mentioned (e.g. "yogabar" -> "Yoga Bar").
      3. If quantities are vague, estimate based on standard serving sizes.
      4. Calculate the TOTAL nutritional content for ALL items listed.
      5. Return the sum of calories, protein (g), carbs (g), fat (g), and fiber (g).
      
      Input Text: "${foodDescription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  } catch (error) {
    console.error("Gemini nutrition calculation error:", error);
    throw error;
  }
};

export const analyzeWeeklyProgress = async (logs: DailyLog[]): Promise<{ summary: string; tips: string[] }> => {
  try {
    const ai = getAiClient();
    const dataStr = JSON.stringify(logs);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as an Elite Fitness Coach. Analyze this fitness data for a week. 
      Focus on Progressive Overload, Recovery Efficiency, and Macro Adherence.
      
      1. Provide a "No Fluff" summary of their physical adaptation.
      2. Provide 3 specific, technical, and actionable tips (e.g., "Increase protein by 10g post-workout", "Sleep debt detected, add 30min tonight").
      
      Data: ${dataStr}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { summary: "Could not generate analysis.", tips: [] };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
};

export const analyzeMoneyProgress = async (transactions: Transaction[]): Promise<{ summary: string; tips: string[] }> => {
  try {
    const ai = getAiClient();
    const dataStr = JSON.stringify(transactions);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as a Financial Strategist. Analyze this transaction data.
      
      1. Summarize cash flow velocity. Are they leaking money on small things? Is the savings rate healthy?
      2. Identify specific "Lifestyle Inflation" or unnecessary categorical spending.
      3. Provide 3 ruthless, actionable tips to increase Net Worth velocity (e.g., "Cut dining budget by 15% to fund X").
      
      Data: ${dataStr}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { summary: "Could not generate financial analysis.", tips: [] };
  } catch (error) {
    console.error("Gemini money analysis error:", error);
    throw error;
  }
};

export const analyzeMindProgress = async (logs: MindLog[]): Promise<{ summary: string; tips: string[] }> => {
  try {
    const ai = getAiClient();
    const dataStr = JSON.stringify(logs);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as a High-Performance Psychologist. Analyze this mental wellness data.
      
      1. Look for Dopamine triggers. Does high screen time correlate with lower Mind Scores?
      2. Analyze the 'Deep Work' ratio (Reading/Meditation vs Screen Time).
      3. Provide 3 scientific, habit-based tips to induce Flow State and reduce mental fog.
      
      Data: ${dataStr}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { summary: "Could not generate wellness analysis.", tips: [] };
  } catch (error) {
    console.error("Gemini mind analysis error:", error);
    throw error;
  }
};