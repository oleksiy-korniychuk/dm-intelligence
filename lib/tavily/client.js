import { tavily } from "@tavily/core";

export function createTavilyClient() {
    if (!process.env.TAVILY_API_KEY) {
        throw new Error("TAVILY_API_KEY is not defined in environment variables.");
    }

    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    return tvly;
}