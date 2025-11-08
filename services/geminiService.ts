import { GoogleGenAI, Type } from "@google/genai";
import { BmiCategory, Recommendation } from '../types';

const getPrompt = (category: BmiCategory, bmi: number): string => {
  const sharedInstructions = `
    You are an expert fitness and nutrition coach. A user has a BMI of ${bmi.toFixed(1)} which is in the '${category}' category.
    Provide a concise, motivating, and actionable plan for them. The tone should be encouraging and positive, not clinical or judgmental.
    Return your response as a JSON object with the structure: {"diet": "...", "exercise": "..."}.
    Format the content in the "diet" and "exercise" keys using markdown for readability, including headings and bullet points.
  `;

  switch (category) {
    case BmiCategory.Underweight:
      return `${sharedInstructions}
      - In the "diet" key, provide a brief, safe, and healthy diet plan focused on gaining weight and muscle mass. Emphasize nutrient-dense foods and protein.
      - In the "exercise" key, provide a brief exercise plan focusing on strength training to build muscle. Suggest a few compound exercises.
      `;
    case BmiCategory.Overweight:
    case BmiCategory.Obese:
      return `${sharedInstructions}
      - In the "diet" key, provide a brief diet plan focusing on healthy, sustainable weight loss. Include examples of whole foods to eat and processed foods to avoid.
      - In the "exercise" key, provide a brief exercise plan suggesting a mix of cardio (like brisk walking or cycling) and strength training exercises suitable for a beginner.
      `;
    case BmiCategory.Normal:
    default:
      return `${sharedInstructions}
      - In the "diet" key, provide a brief diet plan for maintaining a healthy weight and lifestyle. Focus on balanced nutrition with whole foods.
      - In the "exercise" key, provide a brief, well-rounded exercise plan for maintaining fitness, suggesting a mix of cardio, strength, and flexibility work.
      `;
  }
};

export const getFitnessAdvice = async (category: BmiCategory, bmi: number): Promise<Recommendation> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getPrompt(category, bmi),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diet: {
              type: Type.STRING,
              description: "Dietary recommendations formatted in markdown.",
            },
            exercise: {
              type: Type.STRING,
              description: "Exercise recommendations formatted in markdown.",
            },
          },
          required: ["diet", "exercise"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (
        typeof parsedResponse.diet === 'string' && 
        typeof parsedResponse.exercise === 'string'
    ) {
      return parsedResponse;
    } else {
      throw new Error("Invalid response format from API.");
    }
  } catch (error) {
    console.error("Error fetching fitness advice:", error);
    throw new Error("Failed to get recommendations from AI. Please try again.");
  }
};