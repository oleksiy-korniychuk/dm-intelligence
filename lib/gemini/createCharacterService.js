import { FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";
import { characterChatSchema } from "./schemas/characterChatSchema.js";
import { tools } from "./tools.js";

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({apiKey: key});

export const buildUpContext = async (history, character) => {
    try {
        const config = {
            systemInstruction: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are assisting a player with filling out their character sheet by answering their questions and advising them on the options available and on rules related to their character sheet.

**Always follow these three steps:**
1. Analyze the last user message and available context and determine if you need more information.
2. If you need more information, use the fetchInfo(query: string) function to retrieve it.
3. If you have enough information to respond to the user's last message, call the continue() function.

**Most Up-to-Date Player-Character Sheet:** ${JSON.stringify(character, null, 2)}
            `,
            tools: [{ functionDeclarations: tools }],
            toolConfig: { functionCallingConfig: {
                mode: FunctionCallingConfigMode.ANY,
                allowedFunctionNames: ["continue", "fetchInfo"]
            }},
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: config,
        });
        return response;
    }
    catch (error) {
        console.error("Error generating GM response:", error);
        throw new Error("Failed to generate GM response. Please try again.");
    }
};

export const generateGmResponse = async (history, character) => {
    try {
        const config = {
            systemInstruction: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are assisting a player with filling out their character sheet by answering their questions and advising them on the options available and on rules related to their character sheet. Do not provide any information that you are not sure about. If asked for guidance, lead the player through the character creation process.

If the player requests an update to their character sheet, respond with the updated character sheet (including an incremented version number). Whenever you update the character sheet, provide a summary of the changes made at the start of your response.

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