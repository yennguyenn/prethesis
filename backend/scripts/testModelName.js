import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Say hello");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error with gemini-1.5-flash-latest:", err.message);
    try {
      console.log("Trying gemini-pro...");
      const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model2 = genAI2.getGenerativeModel({ model: "gemini-pro" });
      const result2 = await model2.generateContent("Say hello");
      console.log("Success with gemini-pro:", result2.response.text());
    } catch (err2) {
      console.error("Error with gemini-pro:", err2.message);
    }
  }
  process.exit(0);
}

test();
