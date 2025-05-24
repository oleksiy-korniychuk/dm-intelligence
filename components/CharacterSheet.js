'use client';


export default function CharacterSheet({ characterData }) {
    if (!characterData) {
        return (
            <div className="p-4 bg-slate-800 text-slate-100 rounded-lg shadow-md flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold mb-3 text-center border-b border-slate-700 pb-2 w-full">Character Sheet</h3>
                <p className="text-center text-slate-400 mt-4">No character data yet. Start chatting with the GM!</p>
            </div>
        );
    }

    // Helper function to render individual properties
    const renderProperty = (key, value) => {
        if (value === null || value === undefined || value === '') return null;

        let displayValue;
        if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
        } else if (Array.isArray(value)) {
            if (value.length === 0) return null;
            displayValue = (
                <ul className="list-disc list-inside pl-4 mt-1">
                    {value.map((item, index) => (
                        <li key={index} className="text-sm">
                            {typeof item === 'object' ? renderObject(item) : item.toString()}
                        </li>
                    ))}
                </ul>
            );
        } else if (typeof value === 'object') {
            if (Object.keys(value).length === 0) return null;
            displayValue = renderObject(value);
        } else {
            displayValue = value.toString();
        }

        // Simple title case for keys
        const titleKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        return (
            <div key={key} className="mb-2">
                <span className="font-semibold text-slate-300">{titleKey}:</span>
                <div className="pl-2 text-slate-400">{displayValue}</div>
            </div>
        );
    };

    // Helper function to render nested objects
    const renderObject = (obj) => {
        if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) return <span className="text-slate-500 italic">N/A</span>;
        return (
            <div className="pl-4 border-l border-slate-700 ml-2">
                {Object.entries(obj).map(([subKey, subValue]) => renderProperty(subKey, subValue))}
            </div>
        );
    };

    return (
        <div className="h-full p-4 bg-slate-800 text-slate-100 rounded-lg shadow-md overflow-y-auto">
            <h3 className="text-xl font-semibold mb-3 text-center border-b border-slate-700 pb-2">Character Sheet</h3>
            {Object.entries(characterData).map(([key, value]) => renderProperty(key, value))}
        </div>
    );
}
