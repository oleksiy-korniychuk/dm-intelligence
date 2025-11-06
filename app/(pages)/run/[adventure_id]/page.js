'use client';

import GmChat from '@/components/GmChat';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RunAdventurePage() {
    const params = useParams();
    const adventureId = params.adventure_id;
    const [history, setHistory] = useState([]);
    const [playerMessage, setPlayerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const initialLoadingRef = useRef(false);
    const [adventureTitle, setAdventureTitle] = useState('');
    
    // Initial load
    useEffect(() => {
        // Skip if we've already initialized or if we're already loading
        if (isInitialized || initialLoadingRef.current) return;
        
        async function loadInitialChat() {
            // Mark as loading immediately using the ref
            initialLoadingRef.current = true;
            setIsLoading(true);
            try {
                const response = await fetch('/api/gm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        playerMessage: '', 
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
                        content: { message: data.gmMessage },
                        created_at: data.latestTimestamp
                    };
                    setHistory([gmResponse]);
                    setLastSyncedAt(data.latestTimestamp);
                }
                // Mark as initialized after successful load
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize chat with GM:', error);
                const errorResponse = { role: 'model', content: { message: `Sorry, I couldn't start the adventure: ${error.message}` } };
                setHistory([errorResponse]);
            } finally {
                setIsLoading(false);
                initialLoadingRef.current = false; // Reset the loading ref
            }
        }
        
        loadInitialChat();
    }, [adventureId, isInitialized]);

    const handleInputChange = (e) => {
        setPlayerMessage(e.target.value);
    }
    
    // Message submission with optimistic updates
    const handleSubmit = async () => {
        if (!playerMessage.trim() || isLoading) return;
        
        // Create optimistic update with temporary ID
        const optimisticUserMsg = { 
            id: `temp-${Date.now()}`,
            role: 'user', 
            content: { message: playerMessage },
            created_at: new Date().toISOString(),
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

    useEffect(() => {
        async function fetchAdventureTitle() {
            try {
                const response = await fetch(`/api/adventure-details/${adventureId}`);
                if (!response.ok) throw new Error(`Failed to fetch adventure title: ${response.statusText}`);
                const data = await response.json();
                setAdventureTitle(data.adventure.title);
            } catch (error) {
                console.error('Error fetching adventure title:', error);
                setAdventureTitle('Adventure Awaits!');
            }
        }

        fetchAdventureTitle();
    }, [adventureId]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4 text-center pt-4">{adventureTitle}</h1>
            <div className="flex-1 min-h-0">
                <GmChat 
                    history={history} 
                    message={playerMessage}
                    handleInputChange={handleInputChange}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
