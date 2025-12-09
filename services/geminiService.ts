import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, Transaction, MindLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageLog = async (text: string): Promise<Partial<DailyLog>> => {
  try {
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
    const dataStr = JSON.stringify(logs);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this fitness data for a week. Provide a summary of progress (weight trend, adherence, water intake, nutrition balance) and 3 specific actionable tips for next week.
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
    const dataStr = JSON.stringify(transactions);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this financial transaction data.
      1. Summarize spending habits, major expense categories, and income vs expense flow.
      2. Identify specific unnecessary spending or opportunities for saving.
      3. Provide 3 concrete, actionable financial tips based on this data.
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
    const dataStr = JSON.stringify(logs);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this mental wellness data (Mind Score, Meditation, Reading, Screen Time).
      1. Look for correlations (e.g., does high screen time lower mind score? does meditation help?).
      2. Summarize the user's mental state and habit consistency.
      3. Provide 3 actionable tips to improve mental clarity and reduce digital fatigue.
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