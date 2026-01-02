import { AIAnalysis } from "../types";

// This service now connects to the Cloudflare Pages Function '/api/analyze'
// The actual AI logic (running Qwen) happens on the server side (Cloudflare Workers).

export const analyzeNoteWithGemini = async (content: string): Promise<AIAnalysis> => {
  try {
    // Call the Cloudflare Pages Function
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare AI API Error: ${response.status}`);
    }

    const result = await response.json();
    return result as AIAnalysis;

  } catch (error) {
    console.error("AI analysis failed:", error);
    // Return a fallback so the app doesn't crash
    return {
      tags: [],
      isTodo: false,
      isResource: false,
      resourceType: null
    };
  }
};