/**
 * GIF URL management — Custom API
 */

import { getGifMappings, setGifUrl as apiSetGifUrl } from '../pbService';

export async function getGifUrl(exerciseId: string): Promise<string | null> {
  try {
    const mappings = await getGifMappings();
    const m = mappings.find((r: any) => r.exercise_id === exerciseId);
    return m?.gif_url || null;
  } catch (err) {
    console.error('Error loading GIF URL:', err);
    return null;
  }
}

export async function setGifUrl(exerciseId: string, url: string): Promise<void> {
  try {
    await apiSetGifUrl(exerciseId, url);
  } catch (err) {
    console.error('Error setting GIF URL:', err);
  }
}

export async function getAllGifMappings(): Promise<Record<string, string>> {
  try {
    const mappings = await getGifMappings();
    const result: Record<string, string> = {};
    for (const r of mappings) {
      result[r.exercise_id] = r.gif_url;
    }
    return result;
  } catch (err) {
    console.error('Error loading GIF mappings:', err);
    return {};
  }
}
