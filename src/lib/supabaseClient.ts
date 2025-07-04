import { createClient } from '@supabase/supabase-js';
import { Diagnostics } from './diagnostics';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.");
}

// Création du client avec debug pour suivre les requêtes
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});

// Ajout d'un mécanisme de logging et de détection des appels en boucle
// Cette approche n'interfère pas directement avec supabase mais permet de surveiller
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' 
        ? input 
        : input instanceof Request 
            ? input.url 
            : input.toString();
    
    // Si c'est une requête Supabase (identifiée par l'URL)
    if (url.includes(supabaseUrl)) {
        console.log(`[Supabase] Requête: ${url.slice(0, 100)}...`);
        
        // Utiliser notre outil de diagnostic pour suivre les requêtes
        Diagnostics.monitorRequest(url);
        
        const start = Date.now();
        try {
            const response = await originalFetch(input, init);
            const duration = Date.now() - start;
            
            if (!response.ok) {
                console.error(`[Supabase] Erreur ${response.status} en ${duration}ms`);
            } else {
                console.log(`[Supabase] Réponse ${response.status} en ${duration}ms`);
            }
            
            return response;
        } catch (error) {
            console.error('[Supabase] Exception:', error);
            throw error;
        }
    }
    
    return originalFetch(input, init);
};

export { supabase };