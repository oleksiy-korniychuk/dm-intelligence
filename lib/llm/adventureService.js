import { createLLMClient, getDefaultModel } from "./client.js";
import { adventureSchema } from "@/lib/gemini/schemas/adventureSchema.js";

/**
 * Adventure Generation Service using OpenRouter
 *
 * This service generates D&D adventure outlines with structured JSON outputs.
 */

/**
 * Generate a D&D adventure outline
 * @param {string} userInput - The user's prompt for adventure generation
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<Object>} - The generated adventure as a structured JSON object
 */
export const generateAdventure = async (userInput, userId = null) => {
    try {
        const { client } = await createLLMClient(userId);
        const model = getDefaultModel();

        const prompt = `
You are a creative Dungeons & Dragons 5e adventure designer tasked with designing the complete outline for a One-shot adventure (completable in a 3–5 hour session). The adventure must be inspired by the user's input, incorporating specific elements they provide.

**Instructions:**
- Do not assign the player character a name or class; this will be done by the player.
- Generate a one-shot adventure for one player at level 3.
- This adventure will be played one-on-one with a Dungeon Master (DM).
- Incorporate the user's input as key elements (e.g., setting, theme, or specific characters).
- Ensure the adventure has exactly 3 acts, each with 1–2 scenes, and each scene with 1–2 encounters (mixing Combat, Social, and Exploration types).
- Use D&D 5e rules and reference Monster Manual(MM) or Player's Handbook(PHB) for mechanics (e.g., monster stats, skill checks).
- Ensure narrative coherence, with a clear beginning (hook), middle (plot), and end (conclusion).
- Include at least 3 NPCs with a mix of roles.
- Ensure all text is immersive and evocative.
- This outline is intended for a DM to read (not the players), so include all necessary details for them to run the adventure.
- One-shots like 'Honey Heist' and 'We Be Goblins' are great examples of the design you should aim for.

**User Input:** "${userInput}"
        `.trim();

        // Convert Gemini schema to OpenAI JSON Schema format
        const openAISchema = convertToOpenAISchema(adventureSchema);

        const completion = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "adventure_outline",
                    strict: true,
                    schema: openAISchema
                }
            },
            temperature: 1.5
        });

        // Parse the response
        const responseText = completion.choices[0].message.content;

        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            const errorMessage = `Failed to parse LLM response as JSON. This likely means the LLM output was not in the expected format.\nError: ${parseError.message}\nReceived content:\n${responseText.substring(0, 500)}...`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error generating adventure:", error);

        // Re-throw the error if it's our detailed JSON parse error
        if (error.message.includes("Failed to parse LLM response as JSON")) {
            throw error;
        }

        // Handle API key errors
        if (error.message?.includes("API key")) {
            throw new Error("Invalid or missing API key. Please check your OpenRouter configuration.");
        }

        throw new Error("Failed to generate adventure summary. Please try again.");
    }
};

/**
 * Convert Gemini schema format to OpenAI JSON Schema format
 * @param {Object} geminiSchema - Schema in Gemini format
 * @returns {Object} - Schema in OpenAI format
 */
function convertToOpenAISchema(geminiSchema) {
    // Create a deep copy to avoid modifying the original
    const schema = JSON.parse(JSON.stringify(geminiSchema));

    // Remove propertyOrdering fields (not supported by OpenAI)
    function removePropertyOrdering(obj) {
        if (typeof obj !== "object" || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach(item => removePropertyOrdering(item));
        } else {
            delete obj.propertyOrdering;
            Object.values(obj).forEach(value => removePropertyOrdering(value));
        }
    }

    removePropertyOrdering(schema);

    // Add additionalProperties: false for strict mode
    function addAdditionalProperties(obj) {
        if (typeof obj !== "object" || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach(item => addAdditionalProperties(item));
        } else {
            if (obj.type === "object") {
                obj.additionalProperties = false;
            }
            Object.values(obj).forEach(value => addAdditionalProperties(value));
        }
    }

    addAdditionalProperties(schema);

    return schema;
}
