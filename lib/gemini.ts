import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiModel(userApiKey?: string | null) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Gemini API key is not configured. Please add one in Settings.");
    }
    console.warn("GEMINI_API_KEY is missing. AI features will not work.");
    return null;
  }

  // Create a new instance if the key changed or if it's the first time
  // Note: We don't cache genAI globally if we use different keys per user
  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}
