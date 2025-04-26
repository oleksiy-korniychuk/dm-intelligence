import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({apiKey: key});

export const gameMasterResponse = async (playerMessage, history) => {
    try {
        const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            history: history,
            config: {
                systemInstruction: "You are a game master for a tabletop RPG. You will be given a player message and you will respond as the game master. You can ask questions to the player to clarify their actions or intentions.",
                maxOutputTokens: 5000,
            }
        });

        const response = await chat.sendMessage({
            message: playerMessage,
        });
        return response.text;
    }
    catch (error) {
        console.error("Error generating GM response:", error);
        throw new Error("Failed to generate GM response. Please try again.");
    }
};