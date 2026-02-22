import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExtractedCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

export async function extractCardData(base64Image: string): Promise<ExtractedCardData> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: "Extract contact information from this business card. If a field is not found, return an empty string.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          website: { type: Type.STRING },
          address: { type: Type.STRING },
        },
        required: ["name", "title", "company", "email", "phone", "website", "address"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      address: "",
    };
  }
}
