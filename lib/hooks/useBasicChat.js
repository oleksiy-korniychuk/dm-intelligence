'use client';

import { useState } from 'react';

export const useBasicChat = ({ id, api = '/api/use-chat', onResponse = null }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;
        
        // Add user message to chat history
        const userMessage = { id: Date.now().toString(), role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        
        // Clear input and set loading state
        setInput('');
        setIsLoading(true);
        
        try {            
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedMessages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    id
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Add model response to chat history
                if (data.messages && data.messages.length > 0) {
                    const modelMessage = {
                        id: Date.now().toString() + '-model',
                        role: 'model',
                        content: data.messages[data.messages.length - 1].content
                    };
                    setMessages(prev => [...prev, modelMessage]);
                }
                
                // Execute callback with data if provided
                if (onResponse && typeof onResponse === 'function') {
                    onResponse(data);
                }
            } else {
                const errorText = await response.text().catch(() => 'No error details available');
                console.error(`Failed to fetch response: ${response.status} ${response.statusText}`, errorText);
            }
        } catch (error) {
            console.error('Error during chat submission:', error.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        isLoading,
    };
} 