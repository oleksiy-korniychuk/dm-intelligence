import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
    try {
        const { adventure_id: adventureId } = await params;
        const supabase = await createClient();

        const { data: adventureData, error } = await supabase
            .from('adventures')
            .select('adventure')
            .eq('id', adventureId)
            .single();

        if (error) {
            return new Response(JSON.stringify({ error: 'Adventure not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ adventure: adventureData.adventure }), {
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