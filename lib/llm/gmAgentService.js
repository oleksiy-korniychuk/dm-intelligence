import { createLLMClient, getDefaultModel } from "./client.js";

/**
 * Game Master Agent Service using OpenRouter
 *
 * This service handles GM responses for D&D gameplay using chat completions.
 */

/**
 * Generate a Game Master response
 * @param {string} playerMessage - The player's message
 * @param {Array} history - The chat history in Gemini format
 * @param {Object} adventureOutline - The adventure outline
 * @param {Array} characters - The character sheets
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<string>} - The GM response text
 */
export const gameMasterResponse = async (
    playerMessage,
    history,
    adventureOutline,
    characters,
    userId = null
) => {
    try {
        const { client } = await createLLMClient(userId);
        const model = getDefaultModel();

        // Convert Gemini history format to OpenAI messages format
        const messages = convertHistoryToMessages(history);

        // Add system message
        const systemMessage = {
            role: "system",
            content: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are a creative storyteller. You are running a one-shot adventure following the attached Adventure Outline. Follow the outline closely, but be empowered to improvise by adding details, characters, challenges, or encounters, or reflavoring parts of the outline to keep the players on track without making them feel like they are on rails. But be certain that everything you say makes sense in the adventure setting. Start with the hook of the outline and try your best to end with the conclusion of the outline. When you have reached the conclusion, and closed out the final narration, say "The End!" and stop responding.

You can use markdown for simple formatting like bold or italics, but do not use headers outside of combat. Do not include any code blocks or other formatting that would make it difficult to read.

You will be given a player message and you will respond as the DM. You can ask questions to the player to clarify their actions or intentions but do not make decisions for them. You can push back on the players if what they say does not make sense in the context of the game or world setting. But be fair and let the player have fun. Prefer "yes but" or "no but" types of responses to "no".

**Player-Character Sheets:** ${JSON.stringify(characters, null, 2)}

**Adventure Outline:** ${JSON.stringify(adventureOutline, null, 2)}
            `.trim()
        };

        // Add the player's current message
        messages.push({
            role: "user",
            content: playerMessage
        });

        // Make the API call
        const completion = await client.chat.completions.create({
            model,
            messages: [systemMessage, ...messages],
            max_tokens: 5000,
            temperature: 1.0
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error generating GM response:", error);
        if (error.message?.includes("API key")) {
            throw new Error("Invalid or missing API key. Please check your OpenRouter configuration.");
        }
        throw new Error("Failed to generate GM response. Please try again.");
    }
};

/**
 * Convert Gemini history format to OpenAI messages format
 * @param {Array} history - History in Gemini format [{role, parts: [{text}]}]
 * @returns {Array} - History in OpenAI format [{role, content}]
 */
function convertHistoryToMessages(history) {
    return history.map(msg => {
        // Handle different role mappings
        let role = msg.role;
        if (role === "model") {
            role = "assistant";
        }
        // Skip function responses for now (they're handled differently in OpenAI)
        if (role === "function") {
            return null;
        }

        // Extract text from parts
        const content = msg.parts?.[0]?.text || "";

        return {
            role,
            content
        };
    }).filter(msg => msg !== null && msg.content);
}
