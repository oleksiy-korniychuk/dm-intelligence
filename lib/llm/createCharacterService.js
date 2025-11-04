import { createLLMClient, getDefaultModel } from "./client.js";
import { characterChatSchema } from "@/lib/gemini/schemas/characterChatSchema.js";

/**
 * Character Creation Service using OpenRouter
 *
 * This service handles character creation with function calling support.
 */

// Convert Gemini tools to OpenAI tools format
const openAITools = [
    {
        type: "function",
        function: {
            name: "continue",
            description: "Continue the conversation without further function calls",
            parameters: {
                type: "object",
                properties: {
                    none: {
                        type: "string",
                        description: "No parameters needed"
                    }
                },
                additionalProperties: false
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fetchInfo",
            description: "Fetch information based on a custom query",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query to fetch more information"
                    }
                },
                required: ["query"],
                additionalProperties: false
            }
        }
    }
];

/**
 * Build up context with function calling
 * @param {Array} history - Chat history in Gemini format
 * @param {Object} character - The character sheet
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<Object>} - Response with function calls if any
 */
export const buildUpContext = async (history, character, userId = null) => {
    try {
        const { client } = await createLLMClient(userId);
        const model = getDefaultModel();

        const systemMessage = {
            role: "system",
            content: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are assisting a player with filling out their character sheet by answering their questions and advising them on the options available and on rules related to their character sheet.

**Always follow these three steps:**
1. Analyze the last user message and available context and determine if you need more information.
2. If you need more information, use the fetchInfo(query: string) function to retrieve it.
3. If you have enough information to respond to the user's last message, call the continue() function.

**Most Up-to-Date Player-Character Sheet:** ${JSON.stringify(character, null, 2)}
            `.trim()
        };

        // Convert history to OpenAI format
        const messages = convertHistoryToMessages(history);

        const completion = await client.chat.completions.create({
            model,
            messages: [systemMessage, ...messages],
            tools: openAITools,
            tool_choice: "required"  // Force function calling (equivalent to FunctionCallingConfigMode.ANY)
        });

        const responseMessage = completion.choices[0].message;

        // Convert tool calls to Gemini-compatible format
        if (responseMessage.tool_calls) {
            const functionCalls = responseMessage.tool_calls.map(toolCall => ({
                name: toolCall.function.name,
                args: JSON.parse(toolCall.function.arguments)
            }));

            return { functionCalls };
        }

        return { functionCalls: [] };
    } catch (error) {
        console.error("Error generating GM response:", error);
        if (error.message?.includes("API key")) {
            throw new Error("Invalid or missing API key. Please check your OpenRouter configuration.");
        }
        throw new Error("Failed to generate GM response. Please try again.");
    }
};

/**
 * Generate final GM response with structured output
 * @param {Array} history - Chat history in Gemini format
 * @param {Object} character - The character sheet
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<Object>} - {characterSheet, message}
 */
export const generateGmResponse = async (history, character, userId = null) => {
    try {
        const { client } = await createLLMClient(userId);
        const model = getDefaultModel();

        const systemMessage = {
            role: "system",
            content: `
You are a Dungeon Master(DM) running Dungeons & Dragons 5e. You are assisting a player with filling out their character sheet by answering their questions and advising them on the options available and on rules related to their character sheet. Do not provide any information that you are not sure about. If asked for guidance, lead the player through the character creation process.

If the player requests an update to their character sheet, respond with the updated character sheet (including an incremented version number). Whenever you update the character sheet, provide a summary of the changes made at the start of your response.

**Most Up-to-Date Player-Character Sheet:** ${JSON.stringify(character, null, 2)}
            `.trim()
        };

        // Convert history to OpenAI format
        const messages = convertHistoryToMessages(history);

        // Convert schema for structured output
        const openAISchema = convertToOpenAISchema(characterChatSchema);

        const completion = await client.chat.completions.create({
            model,
            messages: [systemMessage, ...messages],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "character_chat_response",
                    strict: true,
                    schema: openAISchema
                }
            }
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText);
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
    const messages = [];

    for (const msg of history) {
        let role = msg.role;

        // Handle role mappings
        if (role === "model") {
            role = "assistant";
        } else if (role === "function") {
            role = "tool";
        }

        // Handle different message types
        if (msg.parts) {
            const part = msg.parts[0];

            // Regular text message
            if (part.text) {
                messages.push({
                    role,
                    content: part.text
                });
            }
            // Function call from model
            else if (part.functionCall) {
                messages.push({
                    role: "assistant",
                    content: null,
                    tool_calls: [{
                        id: `call_${Date.now()}`,
                        type: "function",
                        function: {
                            name: part.functionCall.name,
                            arguments: JSON.stringify(part.functionCall.args || {})
                        }
                    }]
                });
            }
            // Function response
            else if (part.functionResponse) {
                const lastMessage = messages[messages.length - 1];
                const toolCallId = lastMessage?.tool_calls?.[0]?.id || `call_${Date.now()}`;

                messages.push({
                    role: "tool",
                    tool_call_id: toolCallId,
                    content: JSON.stringify(part.functionResponse.response || {})
                });
            }
        }
    }

    return messages.filter(msg => msg.content !== undefined || msg.tool_calls);
}

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
