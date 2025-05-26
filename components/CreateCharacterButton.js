'use client';

import { useRouter } from 'next/navigation';

export default function CreateCharacterButton({ adventureId = null }) {
    const router = useRouter();
    
    return (
        <div className="text-center">
            <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => router.push('/create-character' + (adventureId ? `?adventure_id=${adventureId}` : ''))}
            >
                Create Character
            </button>
        </div>
    );
} 