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
    const inputRef = useRef(null);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    useEffect(() => {
        const focusInput = () => {
            if (!isLoading) {
                inputRef.current?.focus();
            }
        };

        focusInput();
    }, [isLoading]);
    
    // Initial load
    useEffect(() => {
        async function loadInitialChat() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/gm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        playerMessage: "", 
                        lastSyncedAt: null, 
                        adventureId 
                    }),
                });
                
                if (!response.ok) throw new Error(`API error: ${response.statusText}`);
                
                const data = await response.json();
                
                // Use the full new messages array for initial load
                if (data.newMessages && data.newMessages.length > 0) {
                    setHistory(data.newMessages);
                    setLastSyncedAt(data.latestTimestamp);
                } else {
                    const gmResponse = { 
                        id: data.gmMessageId,
                        role: 'model', 
                        message: data.response,
                        created_at: data.latestTimestamp
                    };
                    setHistory([gmResponse]);
                    setLastSyncedAt(data.latestTimestamp);
                }
            } catch (error) {
                console.error('Failed to initialize chat with GM:', error);
                const errorResponse = { role: 'model', message: `Sorry, I couldn't start the adventure: ${error.message}` };
                setHistory([errorResponse]);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadInitialChat();
    }, [adventureId]);
    
    // Message submission with optimistic updates
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!playerMessage.trim() || isLoading) return;
        
        // Create optimistic update with temporary ID
        const optimisticUserMsg = { 
            id: `temp-${Date.now()}`,
            role: 'user', 
            message: playerMessage,
            pending: true
        };
        
        setHistory(prev => [...prev, optimisticUserMsg]);
        const msgToSend = playerMessage;
        setPlayerMessage('');
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/gm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    playerMessage: msgToSend, 
                    lastSyncedAt,
                    adventureId 
                }),
            });
            
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            
            const data = await response.json();
            
            // Replace optimistic updates with real messages and add new ones
            setHistory(prev => {
                // Remove pending/optimistic messages
                const withoutPending = prev.filter(msg => !msg.pending);
                
                // Create a map of existing messages by ID
                const existingMsgs = new Map();
                withoutPending.forEach(msg => existingMsgs.set(msg.id, msg));
                
                // Add or update with new messages
                if (data.newMessages) {
                    data.newMessages.forEach(msg => {
                        existingMsgs.set(msg.id, msg);
                    });
                }
                
                // Convert map back to array and sort by timestamp
                return Array.from(existingMsgs.values())
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
            
            setLastSyncedAt(data.latestTimestamp);
        } catch (error) {
            // Error handling - remove optimistic update
            setHistory(prev => prev.filter(msg => !msg.pending));
        } finally {
            setIsLoading(false);
        }
    };

    // Scroll to bottom of chat on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);
    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4 text-center pt-4">Adventure Awaits!</h1>
            <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-800 rounded shadow">
                {history.map((entry, index) => (
                    <div key={index} className={`mb-3 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded shadow-sm ${entry.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            <strong>{entry.role === 'user' ? 'You' : 'GM'}:</strong> {entry.message}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex pb-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={playerMessage}
                    onChange={(e) => setPlayerMessage(e.target.value)}
                    placeholder={isLoading ? "GM is thinking..." : "What do you do next?"}
                    className={`flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100' : ''}`}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`p-2 px-4 rounded-r ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Waiting...' : 'Send'}
                </button>
            </form>
        </div>
    );
}
