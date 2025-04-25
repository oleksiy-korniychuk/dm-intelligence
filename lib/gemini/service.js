const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in .env.local');
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(apiKey);
const ai = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const adventureSchema = {
    "title": "String: The adventure's name",
    "players": "String: Number of players (e.g., '1')",
    "level": "String: Recommended player level range (e.g., '3')",
    "setting": "String: Brief description of the world/region (2–3 sentences)",
    "background": "String: Context or lore leading to the adventure (3–5 sentences)",
    "hook": "String: How players are drawn into the adventure (2–3 sentences)",
    "plot": [
        {
            "act": "String: Act name (e.g., 'Act 1: The Mystery Unfolds')",
            "description": "String: Narrative overview of the act (4–6 sentences)",
            "locations": [
                {
                    "name": "String: Location name",
                    "description": "String: Visual and atmospheric details (2–3 sentences)",
                    "encounters": [
                        {
                            "type": "String: 'Combat', 'Social', or 'Exploration'",
                            "description": "String: Pragmatic details of the encounter (3–5 sentences)",
                            "mechanics": "String: Rules, stats, or checks (e.g., 'DC 15 Perception check', 'Goblin stats from MM')",
                            "rewards": "String: Loot, XP, or story rewards (1–2 sentences)"
                        }
                    ]
                }
            ]
        }
    ],
    "npcs": [
        {
            "name": "String: NPC name",
            "role": "String: Their function (e.g., 'Adversary', 'Ally')",
            "description": "String: Personality, appearance, motives (3–4 sentences)",
            "stats": "String: Optional stat block or reference (e.g., 'Use Bandit Captain from MM')"
        }
    ],
    "conclusion": "String: How the adventure wraps up, including potential follow-ups (3–5 sentences)",
}

// Generic function to generate adventure summary
export const generateAdventure = async (userInput) => {
  try {
    const prompt = `
    You are a creative Dungeons & Dragons 5e adventure designer tasked with generating a complete one-shot adventure (designed for a 3–5 hour session) in a structured JSON format. The adventure must be inspired by the user's input, incorporating specific elements they provide (e.g., themes, settings, or characters). Follow this exact JSON schema:

    ${JSON.stringify(adventureSchema)}

    **Instructions:**
    - Generate a one-shot adventure for one player at level 3.
    - This adventure will be played one-on-one with a Dungeon Master (DM).
    - Incorporate the user's input as key elements (e.g., setting, theme, or specific characters).
    - Ensure the adventure has exactly 3 acts, each with 1–2 locations, and each location with 1–2 encounters (mixing Combat, Social, and Exploration types).
    - Use D&D 5e rules and reference Monster Manual or Player's Handbook for mechanics (e.g., monster stats, skill checks).
    - Ensure narrative coherence, with a clear beginning (hook), middle (plot), and end (conclusion).
    - Include at least 3 NPCs with distinct roles (e.g., ally, adversary, neutral).
    - Output only the JSON object, with no additional text, headings, or explanations.
    - Ensure all strings are concise, immersive, and aligned with D&D 5e fantasy themes.
    - One-shots like Honey Heist and We Be Goblins are great examples of the design you should aim for.

    **User Input:** "${userInput}"
    `;

    const result = await ai.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up the response and parse it into a JSON object
    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      const errorMessage = `Failed to parse LLM response as JSON. This likely means the LLM output was not in the expected format.\nError: ${parseError.message}\nReceived content (first 500 chars):\n${cleanedText.substring(0, 500)}...`;
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