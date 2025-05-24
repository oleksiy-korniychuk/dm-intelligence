import { characterSheetSchema } from "./characterSheetSchema";

export const characterChatSchema = {
    "type": "object",
    "description": "A structured response for a character creation chat",
    "properties": {
        "characterSheet": characterSheetSchema,
        "message": {
            "type": "string",
            "description": "The gm response message to the player's last message"
        }
    },
    required: ["message"]
};
