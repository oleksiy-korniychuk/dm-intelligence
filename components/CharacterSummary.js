'use client';

export default function CharacterSummary({ characterSheet }) {
    if (!characterSheet) return null;
    const { name, race, class: characterClass, background, level } = characterSheet;
    
    return (
        <div className="character-summary p-3 rounded-md bg-background/50">
            <h2 className="text-lg font-medium">{name}</h2>
            <div className="text-foreground/70 mt-1 space-y-1">
                <h3>Level {level} | {race} | {characterClass}</h3>
                <h3>Background: {background}</h3>
            </div>
        </div>
    );
} 