import { gameMasterResponse } from '@/lib/gemini/gmAgentService';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request) {
    try {
        const { playerMessage, lastSyncedAt, adventureId } = await request.json();
        if (!adventureId) {
            redirect('/adventures');
        }
        const supabase = await createClient();
        // Initial message will eventually be dynamically generated based on the player character
        const initialMessage = "Hello, GM! Lets get started. Please welcome the player(s) and then jump right into introducing the adventure setting. Finish your introduction by zoom into where the player characters find themselves and what they are seeing. Assume the players know nothing about the adventure other than whats listed in their character sheets and what you tell them going forward.";

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // retrieve the adventure outline
        const { data: adventureData, error: adventureError } = await supabase
            .from('adventures')
            .select('adventure')
            .eq('id', adventureId)
            .single();

        if (adventureError || !adventureData) {
            throw new Error("Adventure not found or you don't have access");
        }

        // Get characters associated with this adventure
        const { data: adventureCharacters, error: charactersError } = await supabase
            .from('adventure_characters')
            .select(`
                character_id,
                characters (
                    character_sheet
                )
            `)
            .eq('adventure_id', adventureId);

        if (charactersError) throw charactersError;

        const characters = adventureCharacters.map(ac => ac.characters.character_sheet);

        // Get existing chat history
        const { data: dbHistory } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', adventureId)
            .order('created_at', { ascending: true });

        let messageForGm;
        // If we have a chat history, check who the last message was from
        if (dbHistory && dbHistory.length > 0) {
            const newMessages = dbHistory.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                created_at: msg.created_at
            }));
            const lastMessage = dbHistory[dbHistory.length - 1];
            if (lastMessage.role === 'model') {
                // Return the full history to the client
                if (!playerMessage) {
                    return new Response(JSON.stringify({
                        gmMessage: '',
                        gmMessageId: null,
                        newMessages,
                        latestTimestamp: lastMessage.created_at
                    }), { status: 200 });
                } else {
                    messageForGm = { message: playerMessage };
                }
            }
            else if (lastMessage.role === 'user') {
                // We need to have the GM respond and return the full history to the client
                messageForGm = { message: '' };
            }
        } else {
            // If there's no history, we need to start a new conversation
            messageForGm = { message: initialMessage, type: 'initial' };
        }

        // If the messageForGm is not empty, we need to add it to the database
        if (messageForGm.message) {
            const { error: insertError } = await supabase
                    .from('chat_messages')
                    .insert({
                        user_id: user.id,
                        session_id: adventureId,
                        role: 'user',
                        content: messageForGm
                    });
            if (insertError) throw insertError;
        }

        // Format history for GM response
        const formattedHistory = dbHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content.message }]
        }));
        
        const response = await gameMasterResponse(
            messageForGm.message,
            formattedHistory, 
            adventureData.adventure,
            characters
        );
        
        // Store GM response
        const { data: gmMessage } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                session_id: adventureId,
                role: 'model',
                content: { message: response },
                metadata: response.usageMetadata
            })
            .select('id, created_at')
            .single();
        
        // Get new messages since lastSyncedAt
        let newMessages = [];
        if (lastSyncedAt) {
            const { data: messages } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', adventureId)
                .gte('created_at', new Date(lastSyncedAt).toISOString())
                .order('created_at', { ascending: true });
                
            newMessages = messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                created_at: msg.created_at
            }));
        }
        
        return new Response(JSON.stringify({
            gmMessage: response,
            gmMessageId: gmMessage.id,
            newMessages,
            latestTimestamp: gmMessage.created_at
        }), { status: 200 });
    } catch (error) {
        console.error('GM API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
