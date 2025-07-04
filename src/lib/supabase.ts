// src/lib/supabase.ts
// Export du client Supabase pour l'utilisation dans l'application

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.");
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'mock-key', {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});

export default supabase;
