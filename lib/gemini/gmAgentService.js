import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({apiKey: key});

export const gameMasterResponse = async (playerMessage, history, adventureOutline, characters) => {
    try {
        const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            history: history,
            config: {
                systemInstruction: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are a creative storyteller. You are running a one-shot adventure following the attached Adventure Outline. Follow the outline closely, but be empowered to improvise by adding details, characters, challenges, or encounters, or reflavoring parts of the outline to keep the players on track without making them feel like they are on rails. But be certain that everything you say makes sense in the adventure setting. Start with the hook of the outline and try your best to end with the conclusion of the outline. When you have reached the conclusion, and closed out the final narration, say "The End!" and stop responding.

You can use markdown for simple formatting like bold or italics, but do not use headers outside of combat. Do not include any code blocks or other formatting that would make it difficult to read.

You will be given a player message and you will respond as the DM. You can ask questions to the player to clarify their actions or intentions but do not make decisions for them. You can push back on the players if what they say does not make sense in the context of the game or world setting. But be fair and let the player have fun. Prefer "yes and", "yes but", or "no but" types of responses to "no".

**Player-Character Sheets:** ${JSON.stringify(characters, null, 2)}

**Adventure Outline:** ${JSON.stringify(adventureOutline, null, 2)}
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