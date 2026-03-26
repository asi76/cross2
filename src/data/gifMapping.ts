// GIF storage — Supabase database
// This module provides utility functions for GIF URL management

import { supabase } from '../supabase';

export async function setGifUrl(exerciseId: string, url: string): Promise<void> {
  console.log('setGifUrl called:', exerciseId, url);
  
  try {
    const { data, error } = await supabase
      .from('gif_mappings')
      .upsert({ 
        exercise_id: exerciseId, 
        gif_url: url
      });
    
    console.log('setGifUrl result:', data, error);
    
    if (error) {
      console.error('Error saving GIF URL:', error);
      alert('Errore salvataggio URL: ' + error.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Errore: ' + err);
  }
}

export async function removeGifUrl(exerciseId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('gif_mappings')
      .delete()
      .eq('exercise_id', exerciseId);
    
    if (error) {
      console.error('Error deleting GIF URL:', error);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
