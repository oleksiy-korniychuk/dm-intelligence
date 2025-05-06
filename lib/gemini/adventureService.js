const { GoogleGenAI } = require("@google/genai");
const { adventureSchema } = require("@/lib/gemini/schemas/adventureSchema.js");

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error('GEMINI_API_KEY is not set in .env.local');
}

const ai = new GoogleGenAI({apiKey: key});

export const generateAdventure = async (userInput) => {
    try {
        const prompt = `
You are a creative Dungeons & Dragons 5e adventure designer tasked with designing the complete outline for a One-shot adventure (completable  in a 3–5 hour session). The adventure must be inspired by the user's input, incorporating specific elements they provide.

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
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: adventureSchema,
                temperature: 1.5,
            }
        });
        console.log(response.usageMetadata)
        
        // Clean up the response and parse it into a JSON object
        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        
        try {
            return JSON.parse(cleanedText);
        } catch (parseError) {
            const errorMessage = `Failed to parse LLM response as JSON. This likely means the LLM output was not in the expected format.\nError: ${parseError.message}\nReceived content:\n${cleanedText}...`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error generating adventure:", error);
        // Re-throw the error if it's our detailed JSON parse error, otherwise throw a generic error
        if (error.message.includes('Failed to parse LLM response as JSON')) {
            throw error;
        }
        throw new Error("Failed to generate adventure summary. Please try again.");
    }
};