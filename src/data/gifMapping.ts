// GIF storage — Supabase database
// This module provides utility functions for GIF URL management

import { supabase } from '../supabase';

export async function getGifUrl(exerciseId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('gif_mappings')
      .select('gif_url')
      .eq('exercise_id', exerciseId)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading GIF URL:', error);
      return null;
    }
    
    return data?.gif_url || null;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

export async function setGifUrl(exerciseId: string, url: string): Promise<void> {
  try {
    // First try to delete any existing
    await supabase
      .from('gif_mappings')
      .delete()
      .eq('exercise_id', exerciseId);
    
    // Then insert new
    const { error } = await supabase
      .from('gif_mappings')
      .insert({ 
        exercise_id: exerciseId, 
        gif_url: url
      });
    
    if (error) {
      console.error('Error saving GIF URL:', error);
    }
  } catch (err) {
    console.error('Error:', err);
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
