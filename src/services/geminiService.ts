import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function identifyPartFromImage(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image,
          },
        },
        {
          text: "Identify this automotive part. Provide its probable name, category, and 3 compatible vehicle models (Brand Model Year). Return the result in JSON format.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          compatibility: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["name", "category", "compatibility"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function searchMarketPrices(partName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for the current market prices (in BRL/R$) for an automotive part named "${partName}". Provide the minimum, average, and maximum prices found. Also suggest the best provider or marketplace. Return as JSON.`,
    tools: [{ googleSearch: {} }] as any,
    toolConfig: { includeServerSideToolInvocations: true } as any,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          min: { type: Type.NUMBER },
          avg: { type: Type.NUMBER },
          max: { type: Type.NUMBER },
          bestProvider: { type: Type.STRING }
        },
        required: ["min", "avg", "max", "bestProvider"]
      } as any
    }
  } as any);

  return JSON.parse(response.text || "{}");
}
