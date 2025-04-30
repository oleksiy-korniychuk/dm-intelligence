import AdventureList from '@/components/AdventureList';
import { createClient } from '@/lib/supabase/server';

export default async function AdventuresPage() {
    const supabase = await createClient();
    
    const { data: adventures, error } = await supabase
        .from('adventures')
        .select(`
            id,
            adventure,
            user_prompt,
            created_at,
            has_characters:adventure_characters(adventure_id)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching adventures:', error);
        return <div>Error loading adventures</div>;
    }

    // Process the adventures to add the started boolean property
    const processedAdventures = adventures.map(adventure => ({
        ...adventure,
        started: adventure.has_characters && adventure.has_characters.length > 0
    }));

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Your Adventures</h1>
            <AdventureList adventures={processedAdventures} />
        </div>
    );
}