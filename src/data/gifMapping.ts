// GIF storage — Supabase + database table
// URL format: https://[project].supabase.co/storage/v1/object/public/gifs/[exerciseId].gif

import { supabase } from '../supabase';

const SUPABASE_URL = 'https://kdsstxsthxusgcizzmpr.supabase.co';
const BUCKET = 'gifs';

// Load all GIF URLs from Supabase database
export async function loadGifMappings(): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {};
  
  try {
    const { data, error } = await supabase
      .from('gif_mappings')
      .select('exercise_id, gif_url');
    
    if (error) {
      console.error('Error loading GIF mappings:', error);
      return mapping;
    }
    
    if (data && data.length > 0) {
      data.forEach(row => {
        mapping[row.exercise_id] = row.gif_url;
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
  
  return mapping;
}

export function getGifUrl(exerciseId: string): string | null {
  return `${SUPABASE_URL}/storage/v1/object/public/gifs/${exerciseId}.gif`;
}

export async function setGifUrl(exerciseId: string, url: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('gif_mappings')
      .upsert({ 
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

export function getMappedExerciseIds(): string[] {
  return [];
}

export async function initGifMappings(): Promise<void> {
  // Nothing to init anymore - we load from database
}
