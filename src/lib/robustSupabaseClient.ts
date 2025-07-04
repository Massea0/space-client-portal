// src/lib/robustSupabaseClient.ts

import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { notificationManager } from '@/components/ui/notification-provider';

// Configuration du client Supabase avec gestion plus robuste des erreurs réseau
const createRobustClient = (): SupabaseClient => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables d\'environnement Supabase manquantes');
    notificationManager.error('Erreur de configuration', {
      message: 'Configuration incorrecte de l\'application'
    });
    throw new Error('Variables d\'environnement Supabase manquantes');
  }

  // Options pour rendre le client plus robuste face aux problèmes réseau
  const options = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Augmenter le délai de l'expiration de session
      storageKey: 'supabase-auth',
    },
    global: {
      // Options pour rendre les requêtes plus résilientes
      headers: { 
        'X-Client-Info': 'supabase-js/2.x' 
      },
      // Augmenter les timeouts pour les connexions réseau lentes
      fetch: (url: RequestInfo, init?: RequestInit) => {
        if (!init) init = {};
        // Augmenter le timeout à 30s au lieu des 10s par défaut
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        init.signal = controller.signal;
        
        return fetch(url, init).finally(() => {
          clearTimeout(timeoutId);
        });
      }
    }
  };

  return createClient(supabaseUrl, supabaseKey, options);
};

// Exporter le client robuste
export const robustSupabase = createRobustClient();

// Exporter un hook de base pour la detection online/offline
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      notificationManager.warning('Hors ligne', {
        message: 'Vous êtes actuellement hors ligne'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
