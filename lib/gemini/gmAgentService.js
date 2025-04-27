import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({apiKey: key});

export const gameMasterResponse = async (playerMessage, history, adventureOutline) => {
    try {
        const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            history: history,
            config: {
                systemInstruction: `
                    You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are running a one-shot adventure following the attached Adventure Outline. You will be given a player message and you will respond as the DM. You can ask questions to the player to clarify their actions or intentions.
                    
                    **Adventure Outline:** ${adventureOutline}
                `,
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