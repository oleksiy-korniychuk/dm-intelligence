import { createClient } from '@/lib/supabase/server';
import { processPlayerMessage } from '@/lib/workflows/createCharacterWorkflow';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { id: sessionId, messages } = await request.json();

        if (!sessionId || !messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Session ID and messages array are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Load the character sheet if it exists
        const { data: characterData } = await supabase
            .from('characters')
            .select('*')
            .eq('id', sessionId)
            .single();

        const character = characterData ? JSON.parse(characterData.character_sheet) : {};

        const response = await processPlayerMessage(sessionId, messages, character);

        // Save the character sheet if it was updated
        if (response.character) {
            const { error: characterError } = await supabase
                .from('characters')
                .upsert({
                    id: sessionId,
                    user_id: user.id,
                    character_sheet: response.character
                });

            if (characterError) throw characterError;
        }
        

        return Response.json({
            messages: [...messages, { role: 'model', content: response.message }],
            character: response.character
        });

    } catch (error) {
        console.error("Error processing message:", error);
        return Response.json({ error: "Failed to process message" }, { status: 500 });
    }
}