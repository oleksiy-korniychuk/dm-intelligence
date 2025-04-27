import { generateAdventure } from '@/lib/gemini/adventureService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const { prompt } = await request.json();
            if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await generateAdventure(prompt);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Store the adventure in the database
        const { data: insertedAdventure, error: insertError } = await supabase
        .from('adventures')
        .insert({
            user_id: user.id,
            user_prompt: prompt,
            adventure: response
        })
        .select('id')
        .single();

        if (insertError) {
            console.error('Error inserting adventure:', insertError);
            throw new Error('Failed to save adventure');
        }

        return new Response(JSON.stringify({ outline: response, id: insertedAdventure.id }), {
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