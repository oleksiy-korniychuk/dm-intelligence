export const characterSheetSchema = {
    "type": "object",
    "description": "A structured character sheet for a Dungeons & Dragons 5e character. Only include in response if there are updates to be made.",
    "properties": {
        "version": {
            "type": "number",
            "description": "Version of the character sheet. Increment this number each time the character sheet changes. Must be an integer. Start at 1."
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
            "description": "The character's level. Must be an integer between 1 and 20."
        },
        "abilityScores": {
            "type": "object",
            "description": "The character's ability scores. Must be integers between 1 and 20. Always include all 6 ability scores.",
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
            "description": "The character's skill proficiencies. Valid values are 'yes', 'no', or 'expertise'.",
            "properties": {
                "acrobatics": {
                    "type": "string"
                },
                "animalHandling": {
                    "type": "string"
                },
                "arcana": {
                    "type": "string"
                },
                "athletics": {
                    "type": "string"
                },
                "deception": {
                    "type": "string"
                },
                "history": {
                    "type": "string"
                },
                "insight": {
                    "type": "string"
                },
                "intimidation": {
                    "type": "string"
                },
                "investigation": {
                    "type": "string"
                },
                "medicine": {
                    "type": "string"
                },
                "nature": {
                    "type": "string"
                },
                "perception": {
                    "type": "string"
                },
                "performance": {
                    "type": "string"
                },
                "persuasion": {
                    "type": "string"
                },
                "religion": {
                    "type": "string"
                },
                "sleightOfHand": {
                    "type": "string"
                },
                "stealth": {
                    "type": "string"
                },
                "survival": {
                    "type": "string"
                }
            }
        },
        "armorClass": {
            "type": "number",
            "description": "The character's armor class. Must be an integer."
        },
        "initiativeBonus": {
            "type": "number",
            "description": "The character's initiative bonus. Must be an integer."
        },
        "proficiencyBonus": {
            "type": "number",
            "description": "The character's proficiency bonus. Must be an integer."
        },
        "speed": {
            "type": "number",
            "description": "The character's speed in feet. Must be an integer."
        },
        "hitPoints": {
            "type": "number",
            "description": "The character's maximum hit points. Must be an integer."
        },
        "hitDice": {
            "type": "object",
            "description": "The total number and type of hit dice the character has.",
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
            "description": "The character's spell slots. The number of spell slots available at each level. Must be integers. Only include levels that the character has spell slots for.",
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
            "type": "number",
            "description": "The character's spell save DC. Must be an integer."
        },
        "spellAttackBonus": {
            "type": "number",
            "description": "The character's spell attack bonus. Must be an integer."
        },
        "spellcastingAbility": {
            "type": "string",
            "description": "The character's spellcasting ability. Must be one of the 6 abilities."
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
