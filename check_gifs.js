import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { exercises } from './src/data/exercises.ts';
import { fileURLToPath } from 'url';
import path from 'path';

// Try to load env
try {
  dotenv.config();
} catch {}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'set' : 'not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingGifs() {
  // Get all gif mappings
  const { data: mappings } = await supabase
    .from('gif_mappings')
    .select('exercise_id');

  const mappedIds = new Set(mappings?.map(m => m.exercise_id) || []);
  
  const exerciseIds = exercises.map(e => e.id);
  const missing = exerciseIds.filter(id => !mappedIds.has(id));
  
  console.log('Total exercises in code:', exercises.length);
  console.log('Exercises with GIFs in DB:', mappedIds.size);
  console.log('Missing GIFs:', missing.length);
  console.log('\nMissing exercises:');
  missing.forEach(id => {
    const ex = exercises.find(e => e.id === id);
    console.log(' -', id, '-', ex?.name);
  });
}

checkMissingGifs();
