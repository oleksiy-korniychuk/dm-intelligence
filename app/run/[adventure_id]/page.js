'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RunAdventurePage() {
    const params = useParams();
    const adventureId = params.adventure_id;
    const [history, setHistory] = useState([]);
    const [playerMessage, setPlayerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const localStorageKey = `adventureHistory_${adventureId}`;

    // Function to initialize chat with the GM
    const initializeChat = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/gm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerMessage: "", history: [] }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const gmResponse = { role: 'model', parts: [{ text: data.response }] };

            // Set history with the initial GM response
            setHistory([gmResponse]);

        } catch (error) {
            console.error('Failed to initialize chat with GM:', error);
            // Optionally add an error message to the chat
            const errorResponse = { role: 'model', parts: [{ text: `Sorry, I couldn't start the adventure: ${error.message}` }] };
            setHistory([errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load history from local storage or initialize chat
    useEffect(() => {
        const storedHistory = localStorage.getItem(localStorageKey);
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        } else {
            // No history found, initialize the chat
            initializeChat();
        }
    }, [adventureId, localStorageKey]); // Run only once on mount based on adventureId

    // Save history to local storage whenever it changes
    useEffect(() => {
        if (history.length > 0) { // Avoid saving empty initial state before initialization
            localStorage.setItem(localStorageKey, JSON.stringify(history));
        }
    }, [history, localStorageKey]);

    // Scroll to bottom of chat on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!playerMessage.trim() || isLoading) return;

        const newMessage = { role: 'user', parts: [{ text: playerMessage }] };
        const updatedHistory = [...history, newMessage];

        setHistory(updatedHistory);
        setPlayerMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/gm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the history *before* adding the user's latest message,
                // as the API expects the context leading up to the player's action.
                // The API adds its own initial prompt + player description.
                body: JSON.stringify({ playerMessage: playerMessage, history: history }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const gmResponse = { role: 'model', parts: [{ text: data.response }] };

            // Add GM response to history
            setHistory(prevHistory => [...prevHistory, gmResponse]);

        } catch (error) {
            console.error('Failed to get response from GM:', error);
            // Optionally add an error message to the chat
            const errorResponse = { role: 'model', parts: [{ text: `Sorry, I encountered an error: ${error.message}` }] };
            setHistory(prevHistory => [...prevHistory, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Adventure {adventureId}</h1>
            {/* Change background to dark gray and adjust message bubble colors */}
            <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-800 rounded shadow">
                {history.map((entry, index) => (
                    <div key={index} className={`mb-3 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded shadow-sm ${entry.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            <strong>{entry.role === 'user' ? 'You' : 'GM'}:</strong> {entry.parts[0].text}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} /> {/* Element to scroll to */}
            </div>
            <form onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    value={playerMessage}
                    onChange={(e) => setPlayerMessage(e.target.value)}
                    placeholder="What do you do next?"
                    className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`p-2 px-4 rounded-r ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}
