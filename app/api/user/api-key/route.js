import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/api-key
 * Check if the user has an API key configured
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { data, error } = await supabase
            .from('user_api_keys')
            .select('id, created_at, updated_at')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // If no key exists, return hasKey: false
            if (error.code === 'PGRST116') {
                return new Response(JSON.stringify({ hasKey: false }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            throw error;
        }

        return new Response(JSON.stringify({
            hasKey: true,
            created_at: data.created_at,
            updated_at: data.updated_at
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error checking API key:', error);
        return new Response(JSON.stringify({ error: 'Failed to check API key' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * POST /api/user/api-key
 * Store or update the user's OpenRouter API key
 */
export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { apiKey } = await request.json();

        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'API key is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Basic validation for OpenRouter API key format (starts with sk-)
        if (!apiKey.startsWith('sk-')) {
            return new Response(JSON.stringify({ error: 'Invalid API key format. OpenRouter keys start with "sk-"' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Upsert the API key
        const { error } = await supabase
            .from('user_api_keys')
            .upsert({
                user_id: user.id,
                openrouter_api_key: apiKey.trim(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'API key saved successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error saving API key:', error);
        return new Response(JSON.stringify({ error: 'Failed to save API key' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * DELETE /api/user/api-key
 * Remove the user's OpenRouter API key
 */
export async function DELETE() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { error } = await supabase
            .from('user_api_keys')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'API key removed successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error removing API key:', error);
        return new Response(JSON.stringify({ error: 'Failed to remove API key' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
