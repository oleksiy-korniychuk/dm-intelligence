'use client';

import { saveCharacter } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBasicChat } from '../lib/hooks/useBasicChat';
import CharacterSheet from './CharacterSheet';
import GmChat from './GmChat';

export default function CreateCharacter({ sessionId, adventureId = null }) {
    const router = useRouter();
    const [character, setCharacter] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const handleResponse = (data) => {
        if (data.character) {
            setCharacter(data.character);
        }
    };
    
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useBasicChat({
        id: sessionId,
        api: '/api/character-gm',
        onResponse: handleResponse
    });

    const handleComplete = async () => {
        if (!character) {
            setError("No character data to save");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const result = await saveCharacter({
                sessionId,
                character,
                adventureId
            });
            
            if (result.error) {
                setError(result.error);
            } else if (result.redirectUrl) {
                router.push(result.redirectUrl);
            }
        } catch (err) {
            setError("Failed to save character. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-4 pt-4">
                <div className="flex-1"></div>
                <h2 className="text-2xl font-bold text-center">Create New Character</h2>
                <div className="flex-1 flex justify-end">
                    {character && (
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            onClick={handleComplete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Complete'}
                        </button>
                    )}
                </div>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <div className="flex flex-1 gap-4 overflow-hidden">
                <div className="flex-1 flex flex-col">
                    <GmChat
                        history={messages}
                        message={input}
                        handleInputChange={handleInputChange}
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                        placeholder="Lets build your character..."
                    />
                </div>
                <div className="w-1/2 flex-shrink-0">
                    <CharacterSheet characterData={character} />
                </div>
            </div>
        </div>
    );
}