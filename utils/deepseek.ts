import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? ""
});

export async function queryDeepseek(prompt: string, systemInstruction?: string, temperature = 0.3): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY in environment variables.");
  }

  const { text } = await generateText({
    model: deepseek("deepseek-chat"),
    prompt,
    system: systemInstruction,
    temperature
  });

  return text.trim();
}

export async function translateTextWithDeepseek(text: string, from: string, to: string): Promise<string> {
  const fromLangName = from === "vi" ? "Vietnamese" : "English";
  const toLangName = to === "en" ? "English" : "Vietnamese";

  const systemInstruction = `You are a professional, accurate translator. Translate the given text from ${fromLangName} to ${toLangName}.
Provide only the exact translated text without any explanation, markdown formatting, quotes, or notes.`;

  return await queryDeepseek(text, systemInstruction, 0.3);
}
