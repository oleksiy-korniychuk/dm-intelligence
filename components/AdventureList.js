'use client';

import AdventureDisplay from '@/components/AdventureDisplay';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdventureList({ adventures }) {
    const [expandedId, setExpandedId] = useState(null);
    const router = useRouter();

    const handleAdventureClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleRunClick = (id, e) => {
        e.stopPropagation(); // Prevent triggering the adventure expansion
        const adventure = adventures.find(a => a.id === id);
        router.push(adventure.started ? `/run/${id}` : `/characters?adventure_id=${id}`);
    };

    return (
        <div className="space-y-4">
            {adventures.map((adventure) => (
                <div 
                    key={adventure.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                    <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center"
                        onClick={() => handleAdventureClick(adventure.id)}
                    >
                        <div className="pr-4">
                            <h2 className="text-xl font-semibold">{adventure.adventure.title}{" "+ adventure.adventure_characters}</h2>
                            {adventure.user_prompt && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    &ldquo;{adventure.user_prompt}&rdquo;
                                </p>
                            )}
                        </div>
                        <button
                            onClick={(e) => handleRunClick(adventure.id, e)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            {adventure.started ? 'Continue' : 'Start'}
                        </button>
                    </div>
                    
                    {expandedId === adventure.id && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <AdventureDisplay adventure={adventure.adventure} adventureId={adventure.id} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}