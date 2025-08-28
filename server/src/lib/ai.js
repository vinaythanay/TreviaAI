import { GoogleGenerativeAI } from '@google/generative-ai';
const key = process.env.GEMINI_API_KEY;
const genAI = key ? new GoogleGenerativeAI(key) : null;
export async function generateText(prompt) {
  if (!genAI) return 'AI not configured. Set GEMINI_API_KEY.';
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
