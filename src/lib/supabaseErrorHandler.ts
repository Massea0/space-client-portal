// src/lib/supabaseErrorHandler.ts

import { notificationManager } from '@/components/ui/notification-provider';
import { errorReporter } from '@/lib/errorReporter';
import { supabase } from '@/lib/supabaseClient';

// Types d'erreurs Supabase
export type SupabaseErrorType = 
  | 'auth' 
  | 'network' 
  | 'timeout' 
  | 'database' 
  | 'storage' 
  | 'unknown';

interface SupabaseErrorContext {
  operation: string;
  resource: string;
  method?: string;
  data?: unknown;
  silent?: boolean;
}

/**
 * Wrapper pour exécuter une fonction Supabase avec gestion d'erreur
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>, 
  context: SupabaseErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error: unknown) {
    // Détecter le type d'erreur
    const errorType = getErrorType(error);
    
    // Capturer l'erreur avec contexte
    errorReporter.captureException(error, {
      source: 'supabase',
      type: errorType,
      ...context
    });
    
    // Log de débogage
    console.error(`[Supabase Error] ${context.operation} on ${context.resource}:`, error);
    
    // Notification utilisateur si pas en mode silencieux
    if (!context.silent) {
      notifyUser(errorType, context);
    }
    
    // Renouveler la session si erreur d'authentification
    if (errorType === 'auth') {
      await refreshSession();
    }
    
    return null;
  }
}

/**
 * Déterminer le type d'erreur
 */
function getErrorType(error: unknown): SupabaseErrorType {
  if (!error) return 'unknown';
  
  const message = (error as { message?: string }).message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'network';
  }
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }
  
  if (message.includes('auth') || message.includes('jwt') || message.includes('token')) {
    return 'auth';
  }
  
  if (message.includes('database') || message.includes('db') || message.includes('sql')) {
    return 'database';
  }
  
  if (message.includes('storage') || message.includes('bucket')) {
    return 'storage';
  }
  
  return 'unknown';
}

/**
 * Afficher une notification appropriée selon le type d'erreur
 */
function notifyUser(errorType: SupabaseErrorType, context: SupabaseErrorContext) {
  const messages: Record<SupabaseErrorType, { title: string, message: string }> = {
    network: {
      title: 'Problème de connexion',
      message: 'Vérifiez votre connexion internet et réessayez.'
    },
    timeout: {
      title: 'Délai d\'attente dépassé',
      message: 'Le serveur prend trop de temps à répondre, veuillez réessayer.'
    },
    auth: {
      title: 'Session expirée',
      message: 'Veuillez vous reconnecter.'
    },
    database: {
      title: 'Erreur de base de données',
      message: 'Une erreur est survenue lors de l\'accès aux données.'
    },
    storage: {
      title: 'Erreur de stockage',
      message: 'Impossible d\'accéder aux fichiers demandés.'
    },
    unknown: {
      title: 'Erreur inattendue',
      message: 'Une erreur est survenue, veuillez réessayer.'
    }
  };
  
  const { title, message } = messages[errorType];
  notificationManager.error(title, { message });
}

/**
 * Tente de rafraîchir la session
 */
async function refreshSession() {
  try {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('[Auth] Refresh session failed:', error);
      // Rediriger vers login si impossible de rafraîchir
      window.location.href = '/login';
    }
  } catch (refreshError) {
    console.error('[Auth] Exception during refresh:', refreshError);
    window.location.href = '/login';
  }
}

/**
 * Utilisation optimiste avec retries pour les opérations critiques
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: SupabaseErrorContext,
  options: { maxRetries?: number, delayMs?: number } = {}
): Promise<T | null> {
  const { maxRetries = 3, delayMs = 1000 } = options;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        return withErrorHandling(() => Promise.reject(error), context);
      }
      
      // Délai exponentiel entre les tentatives
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempts - 1)));
    }
  }
  
  return null;
}
