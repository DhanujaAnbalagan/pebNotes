import { getGeminiModel } from "@/lib/gemini";
import prisma from "@/lib/prisma";

export interface AIInsightResponse {
  summary: string;
  action_items: string[];
  suggested_title: string;
}

export class AIService {
  private static promptTemplate = `
    Analyze the following note content and provide:
    1. A concise summary (max 3 sentences).
    2. A list of actionable items (max 5 items).
    3. A suggested improved title for the note.

    You MUST return the response in this exact JSON format:
    {
      "summary": "Short concise summary here",
      "action_items": ["Action item 1", "Action item 2"],
      "suggested_title": "Improved note title"
    }

    Note Content:
    ---
    {{CONTENT}}
    ---
  `;

  static async generateNoteInsights(content: string, userId: string): Promise<AIInsightResponse> {
    if (!content || content.trim().length === 0) {
      throw new Error("Note content is empty");
    }

    try {
      const prompt = this.promptTemplate.replace("{{CONTENT}}", content);
      
      // Fetch user's custom API key if it exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { geminiApiKey: true }
      });

      const model = getGeminiModel(user?.geminiApiKey);
      if (!model) {
        throw new Error("AI service is currently unavailable. Please check your configuration.");
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Reliable parsing: strip markdown code blocks if present
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const jsonResponse = JSON.parse(cleanText) as AIInsightResponse;
        
        // Basic validation of the required fields
        if (!jsonResponse.summary || !Array.isArray(jsonResponse.action_items) || !jsonResponse.suggested_title) {
          throw new Error("Invalid AI response structure");
        }

        return {
          summary: jsonResponse.summary,
          action_items: jsonResponse.action_items,
          suggested_title: jsonResponse.suggested_title,
        };
      } catch (parseError) {
        console.error("AI JSON Parse Error:", parseError, "Original text:", text);
        throw new Error("Failed to parse AI insights. The model returned an invalid format.");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      const errorMessage = error.message || "";
      const status = error.status || 0;

      if (errorMessage.includes("suspended") || errorMessage.includes("CONSUMER_SUSPENDED") || status === 403) {
        throw new Error("Your Gemini API key is suspended or invalid. Please check your AI Studio settings.");
      }
      
      if (errorMessage.includes("quota") || status === 429) {
        throw new Error("Gemini API quota exceeded. Please try again later.");
      }
      
      if (errorMessage.includes("API key not found") || errorMessage.includes("invalid")) {
        throw new Error("Invalid Gemini API key. Please verify your .env configuration.");
      }
      
      throw new Error(errorMessage || "An unexpected error occurred during AI generation.");
    }
  }
}
