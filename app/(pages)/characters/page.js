import CharacterList from '@/components/CharacterList';
import { createClient } from '@/lib/supabase/server';

export default async function CharactersPage({ searchParams }) {
    const { adventure_id: adventureId} = await searchParams;
    
    const supabase = await createClient();
    const { data: characters, error } = await supabase
        .from('characters')
        .select('id, character_sheet');

    if (error) {
        console.error('Error fetching characters:', error);
        return <div>Error loading characters</div>;
    }

    return (
        <div className="container mx-auto p-6 px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Select a Character</h1>
            <CharacterList 
                characters={characters} 
                adventureId={adventureId}
            />
        </div>
    );
}