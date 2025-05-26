'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveCharacter(characterData) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'User not authenticated' };
    }
    
    // Extract necessary data from the character object
    const { sessionId, character, adventureId } = characterData;
    
    // Add complete flag to character data
    const completedCharacter = {
      ...character,
      complete: true
    };
    
    // Upsert character
    const { error } = await supabase
      .from('characters')
      .upsert({
        id: sessionId,
        user_id: user.id,
        character_sheet: completedCharacter,
      });
      
    if (error) {
      console.error("Error saving character:", error);
      return { error: error.message };
    }
    
    // Revalidate the characters page
    revalidatePath('/characters');
    
    return { 
      success: true, 
      redirectUrl: '/characters' + (adventureId ? `?adventure_id=${adventureId}` : '')
    };
  } catch (error) {
    console.error("Error in saveCharacter action:", error);
    return { error: 'An unexpected error occurred' };
  }
} 