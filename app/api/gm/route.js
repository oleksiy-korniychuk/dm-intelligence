import { gameMasterResponse } from '@/lib/gemini/gmAgentService';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request) {
    try {
        const { playerMessage, lastSyncedAt, adventureId } = await request.json();
        const supabase = await createClient();
        // Initial message will eventually be dynamically generated based on the player character
        const initialMessage = "Hello, GM! Name's Gerard. A soldier by trade, a fighter by heart. I stand ready with sword and shield to protect my companions, and my wolf Fang's always by my side to watch my back. Please set the stage and then let me know where I am and what I can see so that we can start playing";

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!adventureId) {
            redirect('/adventures');
        }

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

        // If there's no player message but we have history, check if we're just reloading an existing conversation
        if (!playerMessage && dbHistory && dbHistory.length > 0) {
            const lastMessage = dbHistory[dbHistory.length - 1];
            if (lastMessage.role === 'model') {
                // We're reloading a conversation that ended with a GM response
                // Return the full history as new messages
                const newMessages = dbHistory.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    message: msg.content.message,
                    created_at: msg.created_at
                }));

                return new Response(JSON.stringify({
                    response: '',
                    playerMessageId: null,
                    gmMessageId: lastMessage.id,
                    newMessages,
                    latestTimestamp: lastMessage.created_at
                }), { status: 200 });
            }
        }

        // If there's no history, we need to start a new conversation
        const playerOrInitialMessage = playerMessage || initialMessage;
                
        // Store player message if provided
        let playerMessageId = null;
        if (playerOrInitialMessage) {
            const { data: userMessage, error: insertError } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    adventure_id: adventureId,
                    role: 'user',
                    content: { message: playerOrInitialMessage }
                })
                .select('id, created_at')
                .single();
            
            if (insertError) throw insertError;
            playerMessageId = userMessage.id;
            dbHistory.push({
                id: userMessage.id,
                role: 'user',
                content: { message: playerOrInitialMessage },
                created_at: userMessage.created_at
            });
        }

        // Format history for GM response
        const formattedHistory = dbHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content.message }]
        }));
        
        const response = await gameMasterResponse(playerOrInitialMessage, formattedHistory, adventureData.adventure);
        
        // Store GM response
        const { data: gmMessage } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                adventure_id: adventureId,
                role: 'model',
                content: { message: response }
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
                message: msg.content.message,
                created_at: msg.created_at
            }));
        }
        
        return new Response(JSON.stringify({
            response,
            playerMessageId,
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
