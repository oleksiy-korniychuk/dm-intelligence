export const characterSheetSchema = {
    "type": "object",
    "description": "A structured character sheet for a Dungeons & Dragons 5e character. Only include in response if there are updates to be made.",
    "properties": {
        "version": {
            "type": "number",
            "description": "Version of the character sheet. Increment this number each time the character sheet changes."
        },
        "name": {
            "type": "string",
            "description": "The character's name"
        },
        "class": {
            "type": "string"
        },
        "race": {
            "type": "string"
        },
        "background": {
            "type": "string",
            "description": "The character's background"
        },
        "level": {
            "type": "number",
            "description": "The character's level"
        },
        "abilityScores": {
            "type": "object",
            "description": "The character's ability scores. Must be integers between 1 and 20.",
            "properties": {
                "strength": {
                    "type": "number"
                },
                "dexterity": {
                    "type": "number"
                },
                "constitution": {
                    "type": "number"
                },
                "intelligence": {
                    "type": "number"
                },
                "wisdom": {
                    "type": "number"
                },
                "charisma": {
                    "type": "number"
                }
            }
        },
        "savingThrows": {
            "type": "object",
            "description": "The character's saving throw proficiencies. True if proficient, false if not.",
            "properties": {
                "strength": {
                    "type": "boolean"
                },
                "dexterity": {
                    "type": "boolean"
                },
                "constitution": {
                    "type": "boolean"
                },
                "intelligence": {
                    "type": "boolean"
                },
                "wisdom": {
                    "type": "boolean"
                },
                "charisma": {
                    "type": "boolean"
                }
            }
        },
        "skills": {
            "type": "object",
            "description": "The character's skill proficiencies. True if proficient, false if not.",
            "properties": {
                "acrobatics": {
                    "type": "boolean"
                },
                "animalHandling": {
                    "type": "boolean"
                },
                "arcana": {
                    "type": "boolean"
                },
                "athletics": {
                    "type": "boolean"
                },
                "deception": {
                    "type": "boolean"
                },
                "history": {
                    "type": "boolean"
                },
                "insight": {
                    "type": "boolean"
                },
                "intimidation": {
                    "type": "boolean"
                },
                "investigation": {
                    "type": "boolean"
                },
                "medicine": {
                    "type": "boolean"
                },
                "nature": {
                    "type": "boolean"
                },
                "perception": {
                    "type": "boolean"
                },
                "performance": {
                    "type": "boolean"
                },
                "persuasion": {
                    "type": "boolean"
                },
                "religion": {
                    "type": "boolean"
                },
                "sleightOfHand": {
                    "type": "boolean"
                },
                "stealth": {
                    "type": "boolean"
                },
                "survival": {
                    "type": "boolean"
                }
            }
        },
        "armorClass": {
            "type": "number",
            "description": "The character's armor class"
        },
        "initiativeBonus": {
            "type": "number",
            "description": "The character's initiative bonus"
        },
        "proficiencyBonus": {
            "type": "number",
            "description": "The character's proficiency bonus"
        },
        "speed": {
            "type": "number",
            "description": "The character's speed in feet"
        },
        "hitPoints": {
            "type": "number",
            "description": "The character's maximum hit points"
        },
        "hitDice": {
            "type": "object",
            "description": "The total number and type of hit dice the character has",
            "properties": {
                "total": {
                    "type": "number",
                    "description": "must be a positive integer"
                },
                "type": {
                    "type": "string",
                    "description": "for example: 'd4', 'd6', 'd8', 'd10', 'd12'"
                }
            }
        },
        "spellSlots": {
            "type": "object",
            "description": "The character's spell slots. The number of spell slots available at each level.",
            "properties": {
                "level1": {
                    "type": "number"
                },
                "level2": {
                    "type": "number"
                },
                "level3": {
                    "type": "number"
                },
                "level4": {
                    "type": "number"
                },
                "level5": {
                    "type": "number"
                },
                "level6": {
                    "type": "number"
                },
                "level7": {
                    "type": "number"
                },
                "level8": {
                    "type": "number"
                },
                "level9": {
                    "type": "number"
                }
            }
        },
        "spellSaveDC": {
            "type": "number"
        },
        "spellAttackBonus": {
            "type": "number"
        },
        "spellcastingAbility": {
            "type": "string"
        },
        "attacksAndSpellcasting": {
            "type": "array",
            "description": "The character's attacks and spellcasting options.",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the attack or spell"
                    },
                    "bonusDc": {
                        "type": "string",
                        "description": "The attack bonus and/or DC for the attack or spell"
                    },
                    "damage": {
                        "type": "string",
                        "description": "The damage dealt by the attack and the type of damage (e.g., '1d8 + 3 bludgeoning')"
                    }
                }
            }
        },
        "featuresAndTraits": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "description": {
                        "type": "string"
                    }
                }
            }
        }
    },
    "required": ["version", "name", "class", "race", "background", "level", "abilityScores", "savingThrows", "skills", "armorClass", "initiativeBonus", "proficiencyBonus", "speed", "hitPoints", "hitDice", "spellSlots", "spellSaveDC", "spellAttackBonus", "spellcastingAbility", "attacksAndSpellcasting", "featuresAndTraits"]
};
