'use client';

import { useState } from 'react';
import { useBasicChat } from '../lib/hooks/useBasicChat';
import CharacterSheet from './CharacterSheet';
import GmChat from './GmChat';

export default function CreateCharacter({ sessionId }) {
    const [character, setCharacter] = useState(null);
    
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

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-center pt-4">Create New Character</h2>
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
                <div className="w-2/3 flex-shrink-0">
                    <CharacterSheet characterData={character} />
                </div>
            </div>
        </div>
    );
}