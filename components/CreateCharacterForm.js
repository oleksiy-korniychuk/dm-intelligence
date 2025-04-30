'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function CreateCharacterForm({ onCharacterCreated }) {
    const [newCharacterDescription, setNewCharacterDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateCharacter = async (e) => {
        e.preventDefault();
        if (!newCharacterDescription.trim()) return;
        
        setIsCreating(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('characters')
                .insert({
                    user_id: user.id,
                    character_sheet: { description: newCharacterDescription.trim() }
                })
                .select();

            if (error) {
                console.error('Error creating character:', error);
                return;
            }

            if (data && data[0]) {
                onCharacterCreated(data[0]);
                setNewCharacterDescription('');
            }
        } catch (error) {
            console.error('Error creating character:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="border border-foreground/10 rounded-lg bg-background p-6 w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Character</h2>
            <form onSubmit={handleCreateCharacter}>
                <div className="mb-4">
                    <label htmlFor="character-description" className="block text-sm font-medium mb-2">
                        Character Description
                    </label>
                    <textarea
                        id="character-description"
                        className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        rows="4"
                        value={newCharacterDescription}
                        onChange={(e) => setNewCharacterDescription(e.target.value)}
                        placeholder="Describe your character..."
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isCreating || !newCharacterDescription.trim()}
                    className="w-full py-2 px-4 bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:bg-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
                >
                    {isCreating ? 'Creating...' : 'Create Character'}
                </button>
            </form>
        </div>
    );
}