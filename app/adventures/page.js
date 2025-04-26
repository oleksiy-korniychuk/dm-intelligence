import AdventureList from '@/components/AdventureList';
import { createClient } from '@/lib/supabase/server';

export default async function AdventuresPage() {
    const supabase = await createClient();
    
    const { data: adventures, error } = await supabase
        .from('adventures')
        .select('id, adventure, user_prompt, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching adventures:', error);
        return <div>Error loading adventures</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Adventures</h1>
            <AdventureList adventures={adventures} />
        </div>
    );
}