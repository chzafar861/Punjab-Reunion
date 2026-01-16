import type { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const languageNames: Record<string, string> = {
  en: "English",
  pa: "Punjabi (Gurmukhi script)",
  ur: "Urdu",
  hi: "Hindi",
};

export function registerTranslateRoutes(app: Express): void {
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Text and targetLanguage are required" });
      }

      const targetLangName = languageNames[targetLanguage] || targetLanguage;

      const prompt = `Translate the following text to ${targetLangName}. 
Only respond with the translated text, nothing else. 
Preserve the meaning, tone, and any cultural references.
If the text is already in ${targetLangName}, return it as-is.

Text to translate:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const translatedText = response.text || text;

      res.json({ translatedText: translatedText.trim() });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });
}
