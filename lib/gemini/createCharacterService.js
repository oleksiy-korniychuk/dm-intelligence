import { GoogleGenAI } from "@google/genai";
import { characterChatSchema } from "./schemas/characterChatSchema.js";

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({apiKey: key});

export const generateGmResponse = async (history, character) => {
    try {
        const config = {
            systemInstruction: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are assisting a player with filling out their character sheet by answering their questions and advising them on the options available and on rules related to their character sheet. Do not provide any information that you are not sure about.

If the player requests an update to their character sheet, respond with the updated character sheet (including an incremented version number) and a summary of the changes made.

**Most Up-to-Date Player-Character Sheet:** ${JSON.stringify(character, null, 2)}
            `,
            responseMimeType: 'application/json',
            responseSchema: characterChatSchema,
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: config,
        });
        return JSON.parse(response.text);
    }
    catch (error) {
        console.error("Error generating GM response:", error);
        throw new Error("Failed to generate GM response. Please try again.");
    }
}