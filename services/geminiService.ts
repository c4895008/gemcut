import { GoogleGenAI, Type } from "@google/genai";
import { Clip, TrackType } from "../types";

// Ensure API Key is present (handled by environment in real apps, mocked check here)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export interface AIStoryboardSegment {
  description: string;
  duration: number;
  suggestedText: string;
}

export const generateStoryboard = async (prompt: string): Promise<AIStoryboardSegment[]> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a video storyboard for the following topic: "${prompt}". 
      Break it down into 3-5 engaging segments. 
      For each segment, provide a visual description, a suggested duration (between 2 and 5 seconds), and a short text overlay string.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              suggestedText: { type: Type.STRING }
            },
            required: ["description", "duration", "suggestedText"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as AIStoryboardSegment[];
  } catch (error) {
    console.error("Error generating storyboard:", error);
    return [];
  }
};

export const refineText = async (currentText: string, style: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following short video caption to be "${style}": "${currentText}". Keep it short (under 10 words). Return only the plain text.`,
    });
    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Error refining text:", error);
    return currentText;
  }
};
