import { createClient } from '@/lib/supabase/server';
import { createTavilyClient } from '@/lib/tavily/client';

/**
 * Fetches additional information using the Tavily Search API
 * @param {string} query - Search query to fetch more information
 * @returns {Promise<Object>} - The search results
 */
export async function fetchInfo(query) {
    try {
        const tavily = createTavilyClient();
        
        const results = await tavily.search(query);
        
        return {
            success: true,
            results
        };
    } catch (error) {
        console.error("Error fetching additional information from Tavily:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Updates a specific property of the character sheet in the database
 * @param {string} property - The property path to update (e.g. 'name', 'abilityScores.strength')
 * @param {any} value - The new value to set for the property
 * @param {string} characterId - The ID of the character to update
 * @returns {Promise<Object>} - Status of the update operation
 */
export async function updateCharacterSheet(property, value, characterId) {
    try {
        if (!characterId) {
            throw new Error("Character ID is required for updating character sheet");
        }

        const supabase = await createClient();
        
        // First, get the current character data
        const { data: character, error: fetchError } = await supabase
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();
        
        if (fetchError) {
            throw new Error(`Error fetching character: ${fetchError.message}`);
        }
        
        if (!character) {
            throw new Error(`Character with ID ${characterId} not found`);
        }
        
        // Parse the character sheet JSON (assuming it's stored in a 'sheet' column)
        const characterSheet = character.sheet || {};
        
        // Parse the property path and update the nested value
        const propertyPath = property.split('.');
        let current = characterSheet;
        
        // Navigate to the nested property, creating objects as needed
        for (let i = 0; i < propertyPath.length - 1; i++) {
            const key = propertyPath[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the value at the final property
        const finalKey = propertyPath[propertyPath.length - 1];
        current[finalKey] = value;
        
        // Increment the version number if it exists
        if (characterSheet.version !== undefined) {
            characterSheet.version += 1;
        }
        
        // Update the character in the database
        const { data: updatedCharacter, error: updateError } = await supabase
            .from('characters')
            .update({ 
                sheet: characterSheet,
                updated_at: new Date().toISOString()
            })
            .eq('id', characterId)
            .select()
            .single();
        
        if (updateError) {
            throw new Error(`Error updating character: ${updateError.message}`);
        }
        
        return {
            success: true,
            updatedProperty: property,
            newValue: value,
            version: characterSheet.version,
            characterId,
            message: `Character property '${property}' updated to '${value}'`
        };
    } catch (error) {
        console.error("Error updating character sheet:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
