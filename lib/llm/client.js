import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

/**
 * OpenRouter LLM Client
 *
 * This module provides an abstraction layer for making LLM calls through OpenRouter.
 * It supports both user-provided API keys (BYOK) and a default admin key.
 *
 * Features:
 * - Automatic key selection (user key or fallback to default)
 * - OpenAI SDK compatibility
 * - Support for chat completions, structured outputs, and function calling
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Get the appropriate API key for the current user
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<{apiKey: string, source: 'user'|'default'}>}
 */
export async function getApiKey(userId = null) {
    // If no userId provided, use default key
    if (!userId) {
        const defaultKey = process.env.OPENROUTER_API_KEY;
        if (!defaultKey) {
            throw new Error("OPENROUTER_API_KEY is not set in environment variables");
        }
        return { apiKey: defaultKey, source: "default" };
    }

    try {
        // Try to get user's API key from database
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_api_keys")
            .select("openrouter_api_key")
            .eq("user_id", userId)
            .single();

        if (!error && data?.openrouter_api_key) {
            return { apiKey: data.openrouter_api_key, source: "user" };
        }
    } catch (error) {
        console.warn("Failed to retrieve user API key, falling back to default:", error.message);
    }

    // Fallback to default key
    const defaultKey = process.env.OPENROUTER_API_KEY;
    if (!defaultKey) {
        throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }
    return { apiKey: defaultKey, source: "default" };
}

/**
 * Create an OpenAI client configured for OpenRouter
 * @param {string|null} userId - The authenticated user's ID (optional)
 * @returns {Promise<{client: OpenAI, source: 'user'|'default'}>}
 */
export async function createLLMClient(userId = null) {
    const { apiKey, source } = await getApiKey(userId);

    const client = new OpenAI({
        apiKey,
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "DM Intelligence"
        }
    });

    return { client, source };
}

/**
 * Get the default model name (configurable via environment variable)
 * @returns {string}
 */
export function getDefaultModel() {
    return process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.5-flash-preview-09-2025";
}
