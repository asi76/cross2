// GIF storage — Supabase + localStorage
// URLs are stored in localStorage for persistence
// Supabase bucket "gifs" stores the actual files

const STORAGE_KEY = 'crosstraining_gif_urls';

export function getGifUrl(exerciseId: string): string | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const urls = JSON.parse(stored);
    return urls[exerciseId] || null;
  }
  return null;
}

export function setGifUrl(exerciseId: string, url: string): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const urls = stored ? JSON.parse(stored) : {};
  urls[exerciseId] = url;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export function removeGifUrl(exerciseId: string): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const urls = JSON.parse(stored);
    delete urls[exerciseId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }
}

export function getMappedExerciseIds(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return Object.keys(JSON.parse(stored));
  }
  return [];
}
