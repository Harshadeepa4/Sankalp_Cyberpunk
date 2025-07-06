import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Function to get farming advice based on crop, soil, and weather conditions
export async function getFarmingAdvice(
  crop: string,
  soilType: string,
  weatherConditions: {
    temperature: string;
    humidity: string;
    rainfall: string;
  }
) :Promise<string> {
  try {
    // Input validation
    if (!crop || !soilType || !weatherConditions) {
      throw new Error("Crop, soil type, and weather conditions are required.");
    }

    // For text-only input, use the gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      As an agricultural expert, provide specific and actionable farming advice for the following conditions:
      
      **Crop:** ${crop}
      **Soil Type:** ${soilType}
      **Current Weather:**
      - Temperature: ${weatherConditions.temperature}
      - Humidity: ${weatherConditions.humidity}
      - Recent Rainfall: ${weatherConditions.rainfall}
      
      Provide your advice in the following format:
      1. **Irrigation Recommendations:** (How much and how often to irrigate)
      2. **Pest/Disease Risks:** (Potential risks and how to mitigate them)
      3. **Fertilizer Recommendations:** (Type, quantity, and application frequency)
      4. **Protective Measures:** (Any additional steps to protect the crop)
      
      Keep the response concise, practical, and tailored to the provided conditions.
    `;

    console.log("Prompt sent to Gemini API:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();

    console.log("Response from Gemini API:", responseText);

    if (!responseText || responseText.trim() === "") {
      return "No advice could be generated. Please check your inputs and try again.";
    }

    return responseText;
  } catch (error) {
    console.error("Error getting farming advice:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Unable to generate farming advice at this time. Please try again later.";
  }
}

// Function to get market insights for a specific crop
export async function getMarketInsights(crop: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      As an agricultural market expert, provide brief market insights for ${crop} in India:
      
      Please include:
      1. Current estimated market price range (in ₹ per quintal)
      2. Short-term price trend forecast (rising, falling, or stable)
      3. One key market factor affecting prices
      
      Keep the response concise and practical for farmers.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting market insights:", error);
    return "Unable to generate market insights at this time. Please check your API key and try again.";
  }
}