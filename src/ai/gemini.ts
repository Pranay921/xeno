import { GoogleGenerativeAI } from "@google/generative-ai";

// Standard client for older SDK interface, or newer SDK interface
const apiKey = process.env.GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({
    model: modelName,
  });
};
