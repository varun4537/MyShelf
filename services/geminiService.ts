import { GoogleGenAI, Type } from "@google/genai";
import { Book } from '../types';

// Fix: Per coding guidelines, initialize GoogleGenAI with process.env.API_KEY directly
// and assume it is always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const bookSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The full title of the book." },
    authors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of author names." },
    genre: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of genres for the book." },
    description: { type: Type.STRING, description: "A brief summary of the book." },
    pageCount: { type: Type.INTEGER, description: "The total number of pages in the book." },
    coverUrl: { type: Type.STRING, description: "A URL to a high-quality image of the book cover. Use a placeholder from picsum.photos if a real one isn't available, e.g., https://picsum.photos/400/600" }
  },
  required: ["title", "authors", "genre", "description", "pageCount", "coverUrl"],
};


export const fetchBookByISBN = async (isbn: string): Promise<Book | null> => {
  // Fix: Per coding guidelines, remove mock data logic and assume API key is always present.
  try {
    const prompt = `Find book details for ISBN: ${isbn}. Provide the information in JSON format.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: bookSchema,
      },
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("Empty response from API");
    }

    const bookData = JSON.parse(text);

    return {
      ...bookData,
      isbn,
      dateAdded: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Error fetching book data from Gemini API:", error);
    return null;
  }
};
