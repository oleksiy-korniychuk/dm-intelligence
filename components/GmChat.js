'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function GmChat({
    history = [],
    message = '',
    handleInputChange,
    placeholder = "What do you do next?",
    isLoading = false,
    onSubmit
}) {
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    // Scroll to bottom of chat on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    // Helper function to adjust textarea height and scrollbar visibility
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto'; // Reset height to auto to calculate new height
        textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`; // Set height dynamically, max 4 lines (96px)
        textarea.style.overflowY = textarea.scrollHeight > textarea.offsetHeight ? 'auto' : 'hidden'; // Show scrollbar only if content exceeds visible area
    }

    // Adjust textarea height when message changes
    useEffect(() => {
        if (inputRef.current) {
            adjustTextareaHeight(inputRef.current);
        }
    }, [message]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        onSubmit();
    };

    return (        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg shadow min-h-0">
                {history.filter(entry => !entry.content?.type).map((entry, index) => (
                    <div key={index} className={"mb-3 text-left"}>
                        <span className={`inline-block p-2 rounded shadow-sm ${entry.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            <strong>{entry.role === 'user' ? 'You' : 'GM'}:</strong> 
                            <ReactMarkdown>{typeof entry.content === 'string' ? entry.content : entry.content.message}</ReactMarkdown>
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex mt-auto">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => {
                        handleInputChange(e);
                        adjustTextareaHeight(e.target);
                    }}
                    placeholder={ placeholder }
                    className={`flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isLoading ? 'bg-gray-100' : ''}`}
                    disabled={isLoading}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    style={{ maxHeight: '6rem' }}
                />
                <button
                    type="submit"
                    className={`p-2 px-4 rounded-r ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Thinking...' : 'Send'}
                </button>
            </form>
        </div>
    );
}