'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateCharacter from './CreateCharacter';

export default function CharacterList({ characters, adventureId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [characterList, setCharacterList] = useState(characters);
    const router = useRouter();

    const handleSelectCharacter = async (characterId) => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('adventure_characters')
                .insert({
                    user_id: user.id,
                    adventure_id: adventureId,
                    character_id: characterId,
                });

            if (error) {
                console.error('Error saving selected character:', error);
                return;
            }

            router.push(`/run/${adventureId}`);
        } catch (error) {
            console.error('Error selecting character:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCharacterCreated = (newCharacter) => {
        setCharacterList([...characterList, newCharacter]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Available Characters</h2>
                {characterList.length === 0 ? (
                    <p className="text-foreground/60">No characters available. Create one below!</p>
                ) : (
                    <ul className="space-y-4">
                        {characterList.map((character) => (
                            <li key={character.id}>
                                <div className="p-4 border border-foreground/10 rounded-lg bg-background">
                                    <p className="mb-3">{character.character_sheet.description}</p>
                                    {adventureId && (
                                        <button
                                            onClick={() => handleSelectCharacter(character.id)}
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:bg-foreground/50 transition-colors"
                                        >
                                            {isLoading ? 'Selecting...' : 'Select Character'}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <CreateCharacter onCharacterCreated={handleCharacterCreated} />
        </div>
    );
}