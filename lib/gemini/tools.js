import { Type } from "@google/genai";

export const tools = [
    {
        name: "continue",
        description: "Continue the conversation without further function calls",
        parameters: {
            type: Type.OBJECT,
            properties: {
                none: {
                    type: Type.STRING,
                    description: "No parameters needed"
                }
            }
        }
    },
    {
        name: "fetchInfo",
        description: "Fetch information based on a custom query",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: {
                    type: Type.STRING,
                    description: "Search query to fetch more information"
                }
            },
            required: ["query"]
        }
    },
    {
        name: "updateCharacterSheet",
        description: "Update a specific property of the character sheet",
        parameters: {
            type: Type.OBJECT,
            properties: {
                property: {
                    type: Type.STRING,
                    description: "The property path to update (e.g. 'name', 'class', 'skills.animalHandling')"
                },
                value: {
                    type: Type.ANY,
                    description: "The new value to set for the property"
                }
            },
            required: ["property", "value"]
        }
    }
];