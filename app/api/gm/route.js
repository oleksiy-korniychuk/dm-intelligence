import { gameMasterResponse } from '@/lib/gemini/gmAgentService';

export async function POST(request) {
    try {
        const { playerMessage, history } = await request.json();

        // playerDescription will eventually come from the database
        const playerDescription = "I am Gerard, a level 3 human fighter with a background as a soldier. I am brave and loyal, always ready to protect my friends. I wield a longsword and shield, and have a pet wolf named Fang.";
        const initialHistory = [
            {
                role: "user",
                parts: [{text: "Hello, GM! " + playerDescription + " I am ready to start our adventure. Please set the stage and then let me know where I am and what I can see so that we can start playing."}],
            },
        ];

        const historyWithPlayerDescription = [...initialHistory, ...history];

        const response = await gameMasterResponse(playerMessage, historyWithPlayerDescription);

        return new Response(JSON.stringify({ response }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}