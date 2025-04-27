'use client';

import AdventureDisplay from '@/components/AdventureDisplay';
import { useState } from 'react';

export default function AdventureGenerator() {
  const [userInput, setUserInput] = useState('');
  const [adventure, setAdventure] = useState(null);
  const [adventureId, setAdventureId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError('Please enter a prompt to generate an adventure.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
        const response = await fetch('/api/new-adventure', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userInput }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate adventure.');
        }
        setAdventure(data.outline);
        setAdventureId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Adventure Generator
      </h1>
      <div className="mb-4">
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Enter your adventure inspiration (e.g., 'A haunted forest with a lost elven artifact')"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
      </div>
      <button
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Adventure'}
      </button>
      {error && (
        <p className="mt-4 text-red-600 text-center">{error}</p>
      )}
      {adventure && (
        <div className="mt-8">
          <AdventureDisplay adventure={adventure} adventureId={adventureId} />
        </div>
      )}
    </div>
  );
}