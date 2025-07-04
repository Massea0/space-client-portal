// src/hooks/use-supabase-client.ts

import { useEffect, useState } from 'react';
import { 
  AuthError, 
  PostgrestError, 
  User 
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling, withRetry, SupabaseErrorType } from '@/lib/supabaseErrorHandler';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook pour gérer les requêtes Supabase avec gestion d'erreurs
 */
export function useSupabaseClient() {
  const { user } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  
  // Surveille l'état de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Surveille les erreurs d'authentification
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // La gestion des utilisateurs est déjà faite dans AuthContext
          console.log('[SupabaseClient] Auth state changed:', event);
        } 
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user]);
  
  /**
   * Exécuter une requête à la base de données avec gestion d'erreurs
   */
  const query = async <T>(
    operation: string,
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    options = { retry: false }
  ): Promise<T | null> => {
    if (isOffline) {
      return withErrorHandling(
        () => Promise.reject(new Error('Vous êtes hors ligne')),
        { operation, resource: 'database', method: 'query' }
      );
    }
    
    const execute = () => queryFn().then((result) => {
      if (result.error) {
        return Promise.reject(result.error);
      }
      return result.data;
    });
    
    if (options.retry) {
      return withRetry(execute, { operation, resource: 'database', method: 'query' });
    }
    
    return withErrorHandling(execute, { operation, resource: 'database', method: 'query' });
  };
  
  /**
   * Exécuter une opération d'authentification avec gestion d'erreurs
   */
  const auth = async <T>(
    operation: string,
    authFn: () => Promise<{ data: T | null; error: AuthError | null }>,
    options = { retry: false }
  ): Promise<T | null> => {
    const execute = () => authFn().then((result) => {
      if (result.error) {
        return Promise.reject(result.error);
      }
      return result.data;
    });
    
    if (options.retry) {
      return withRetry(execute, { operation, resource: 'auth', method: 'authOperation' });
    }
    
    return withErrorHandling(execute, { operation, resource: 'auth', method: 'authOperation' });
  };
  
  /**
   * Exécuter une opération de stockage avec gestion d'erreurs
   */
  const storage = async <T>(
    operation: string,
    storageFn: () => Promise<{ data: T | null; error: Error | null }>,
    options = { retry: false }
  ): Promise<T | null> => {
    if (isOffline) {
      return withErrorHandling(
        () => Promise.reject(new Error('Vous êtes hors ligne')),
        { operation, resource: 'storage', method: 'storageOperation' }
      );
    }
    
    const execute = () => storageFn().then((result) => {
      if (result.error) {
        return Promise.reject(result.error);
      }
      return result.data;
    });
    
    if (options.retry) {
      return withRetry(execute, { operation, resource: 'storage', method: 'storageOperation' });
    }
    
    return withErrorHandling(execute, { operation, resource: 'storage', method: 'storageOperation' });
  };
  
  return {
    query,
    auth,
    storage,
    isOffline,
    supabase // Accès direct au client si nécessaire
  };
}
