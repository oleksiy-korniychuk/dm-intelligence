export const adventureSchema = {
    "type": "object",
    "description": "A structured outline for a Dungeons & Dragons 5e adventure",
    "properties": {
        "title": {
            "type": "string",
            "description": "The adventure's name"
        },
        "players": {
            "type": "number",
            "description": "Number of players"
        },
        "level": {
            "type": "number",
            "description": "Recommended player level"
        },
        "background": {
            "type": "string",
            "description": "Context or lore leading to the adventure (4–6 sentences)"
        },
        "synopsis": {
            "type": "string",
            "description": "Brief summary of the major points of the adventure (4–6 sentences)"
        },
        "hook": {
            "type": "string",
            "description": "How player(s) are drawn into the adventure (2–3 sentences)"
        },
        "plot": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Creative act name (e.g. 'Act 1: Anchors Aweigh')"
                    },
                    "transition": {
                        "type": "string",
                        "description": "Text providing an intro into the act (1-2 sentences)"
                    },
                    "scenes": {
                        "type": "array",
                        "description": "Scenes can be chronological(players more or less have to follow them) or optional(players can choose to engage with them)",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "Scene name (e.g. 'Enter the Hawklords')"
                                },
                                "overview": {
                                    "type": "string",
                                    "description": "Text providing an overview of the scene (2–3 sentences)"
                                },
                                "encounters": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "type": {
                                                "type": "string",
                                                "enum": ["Combat", "Social", "Exploration"]
                                            },
                                            "details": {
                                                "type": "string",
                                                "description": "Pragmatic details of the encounter (3–5 sentences)"
                                            },
                                            "mechanics": {
                                                "type": "string",
                                                "description": "Rules, stats, or checks (e.g. 'each time you fail a DC 15 Dex check to catch the bird, it lets out a loud screech and flys to a new location' or 'DC 15 Perception check' or '3 Goblins (stats from MM) and 1 Hobgoblin (stats from MM)')"
                                            },
                                            "reward": {
                                                "type": "string",
                                                "description": "Loot or story reward (1–2 sentences)"
                                            }
                                        },
                                        "propertyOrdering": ["type", "details", "mechanics", "reward"]
                                    }
                                }
                            },
                            "propertyOrdering": ["overview", "name", "encounters"]
                        }
                    }
                },
                "propertyOrdering": ["transition", "name", "scenes"],
                "required": ["name", "transition", "scenes"]
            }
        },
        "npcs": {
            "type": "array",
            "description": "List of main NPCs in the adventure",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "NPC name"
                    },
                    "role": {
                        "type": "string",
                        "description": "The NPC's initial disposition towards the players",
                        "enum": ["Adversary", "Ally", "Neutral"]
                    },
                    "description": {
                        "type": "string",
                        "description": "Personality, appearance, motives (3–4 sentences)"
                    },
                    "stats": {
                        "type": "string",
                        "description": "Stat block or reference (e.g. 'AC: 15, HP: 50, Speed: 30ft, STR: +2, DEX: +0, CON: +1, INT: -2, WIS: +1, CHA: -2, Attack: 'Longsword +5 to hit, 1d8+3 slashing damage' or 'Use Bandit Captain from MM')",
                        "nullable": true
                    }
                },
                "propertyOrdering": ["role", "description", "name", "stats"],
                "required": ["name", "role", "description"]
            }
        },
        "conclusion": {
            "type": "string",
            "description": "How the adventure wraps up (3–5 sentences)"
        }
    },
    "propertyOrdering": ["players", "level", "background", "hook", "plot", "npcs", "conclusion", "synopsis", "title"],
    "required": ["title", "players", "level", "background", "hook", "plot", "npcs", "conclusion", "synopsis"]
};
