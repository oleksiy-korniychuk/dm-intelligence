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
        const initialMessage = "Hello, GM! Name's Gerard and I am a level 3 fighter. I stand ready with sword and shield to protect my companions, and my wolf Fang's always by my side to watch my back. Please set the stage for this adventure and then let me know where I am and what I can see so that we can start playing";

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

        // Get existing chat history
        const { data: dbHistory } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('adventure_id', adventureId)
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
                        adventure_id: adventureId,
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
            adventureData.adventure
        );
        
        // Store GM response
        const { data: gmMessage } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                adventure_id: adventureId,
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
                .eq('adventure_id', adventureId)
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
