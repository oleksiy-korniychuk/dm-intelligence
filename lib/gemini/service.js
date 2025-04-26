const { GoogleGenAI } = require("@google/genai");

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error('GEMINI_API_KEY is not set in .env.local');
}

const ai = new GoogleGenAI({apiKey: key});

const structuredSchema = {
    type: 'object',
    title: 'Adventure Outline',
    description: 'A structured outline for a Dungeons & Dragons 5e adventure',
    properties: {
        'title': {
            type: 'string',
            description: 'The adventure\'s name'
        },
        'players': {
            type: 'number',
            description: 'Number of players'
        },
        'level': {
            type: 'number',
            description: 'Recommended player level'
        },
        'background': {
            type: 'string',
            description: 'Context or lore leading to the adventure (4–6 sentences)'
        },
        'synopsis': {
            type: 'string',
            description: 'Brief summary of the major points of the adventure (4–6 sentences)'
        },
        'hook': {
            type: 'string',
            description: 'How player(s) are drawn into the adventure (2–3 sentences)'
        },
        'plot': {
            type: 'array',
            items: {
                type: 'object',
                title: 'Act',
                properties: {
                    'name': {
                        type: 'string',
                        description: 'Creative act name (e.g. \'Act 1: Anchors Aweigh\')'
                    },
                    'transition': {
                        type: 'string',
                        description: 'Text providing an intro into the act (1-2 sentences)'
                    },
                    'scenes': {
                        type: 'array',
                        description: 'Scenes can be chronological(players more or less have to follow them) or optional(players can choose to engage with them)',
                        items: {
                            type: 'object',
                            title: 'Scene',
                            properties: {
                                'name': {
                                    type: 'string',
                                    description: 'Scene name (e.g. \'Enter the Hawklords\')'
                                },
                                'overview': {
                                    type: 'string',
                                    description: 'Text providing an overview of the scene (2–3 sentences)'
                                },
                                'encounters': {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        title: 'Encounter',
                                        properties: {
                                            'type': {
                                                type: 'string',
                                                enum: ['Combat', 'Social', 'Exploration']
                                            },
                                            'details': {
                                                type: 'string',
                                                description: 'Pragmatic details of the encounter (3–5 sentences)'
                                            },
                                            'mechanics': {
                                                type: 'string',
                                                description: 'Rules, stats, or checks (e.g. \'each time you fail a DC 15 Dex check to catch the bird, it lets out a loud screech and flys to a new location\' or \'DC 15 Perception check\' or \'3 Goblins (stats from MM) and 1 Hobgoblin (stats from MM)\')'
                                            },
                                            'reward': {
                                                type: 'string',
                                                description: 'Loot or story reward (1–2 sentences)'
                                            }
                                        },
                                        propertyOrdering: ['type', 'details', 'mechanics', 'reward']
                                    }
                                }
                            },
                            propertyOrdering: ['overview', 'name', 'encounters']
                        }
                    }
                },
                propertyOrdering: ['transition', 'name', 'scenes'],
                required: ['name', 'transition', 'scenes']
            }
        },
        'npcs' : {
            type: 'array',
            description: 'List of main NPCs in the adventure',
            items: {
                type: 'object',
                title: 'NPC',
                properties: {
                    'name' : {
                        type: 'string',
                        description: 'NPC name'
                    },
                    'role' : {
                        type: 'string',
                        description: 'The NPC\'s initial disposition towards the players',
                        enum: ['Adversary', 'Ally', 'Neutral'],
                    },
                    'description' : {
                        type: 'string',
                        description: 'Personality, appearance, motives (3–4 sentences)'
                    },
                    'stats' : {
                        type: 'string',
                        description: 'Stat block or reference (e.g. \'AC: 15, HP: 50, Speed: 30ft, STR: +2, DEX: +0, CON: +1, INT: -2, WIS: +1, CHA: -2, Actack: \'Longsword +5 to hit, 1d8+3 slashing damage\' or \'Use Bandit Captain from MM\')',
                        nullable: true
                    }
                },
                propertyOrdering: ['role', 'description', 'name', 'stats'],
                required: ['name', 'role', 'description']
            }
        },
        'conclusion' : {
            type: 'string',
            description: 'How the adventure wraps up (3–5 sentences)'
        }
    },
    propertyOrdering: ['players', 'level', 'background', 'hook', 'plot', 'npcs', 'conclusion', 'synopsis', 'title'],
    required: ['title', 'players', 'level', 'background', 'hook', 'plot', 'npcs', 'conclusion', 'synopsis']
};

export const generateAdventure = async (userInput) => {
  try {
    const prompt = `
    You are a creative Dungeons & Dragons 5e adventure designer tasked with designing the complete outline for a One-shot adventure (completable  in a 3–5 hour session). The adventure must be inspired by the user's input, incorporating specific elements they provide.

    **Instructions:**
    - Generate a one-shot adventure for one player at level 3.
    - This adventure will be played one-on-one with a Dungeon Master (DM).
    - Incorporate the user's input as key elements (e.g., setting, theme, or specific characters).
    - Ensure the adventure has exactly 3 acts, each with 1–2 scenes, and each scene with 1–2 encounters (mixing Combat, Social, and Exploration types).
    - Use D&D 5e rules and reference Monster Manual(MM) or Player's Handbook(PHB) for mechanics (e.g., monster stats, skill checks).
    - Ensure narrative coherence, with a clear beginning (hook), middle (plot), and end (conclusion).
    - Include at least 3 NPCs with a mix of roles.
    - Ensure all text is immersive and evocative.
    - One-shots like 'Honey Heist' and 'We Be Goblins' are great examples of the design you should aim for.

    **User Input:** "${userInput}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: structuredSchema
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