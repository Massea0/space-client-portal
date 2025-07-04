// src/lib/cache.ts
/**
 * Service de cache local pour l'application
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Classe de gestion de cache avec TTL pour les données qui changent peu fréquemment
 */
export class LocalStorageCache {
  /**
   * Récupérer une valeur mise en cache si elle n'a pas expiré
   */
  static get<T>(key: string, ttlMs = 60000): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;
      
      const cache = JSON.parse(item) as CacheEntry<T>;
      if (Date.now() - cache.timestamp < ttlMs) {
        return cache.data;
      }
      
      // Nettoyage des entrées expirées
      localStorage.removeItem(`cache_${key}`);
      return null;
    } catch (e) {
      console.error(`[Cache] Error reading ${key}:`, e);
      return null;
    }
  }

  /**
   * Mettre en cache une valeur
   */
  static set<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      } as CacheEntry<T>));
      return true;
    } catch (e) {
      console.error(`[Cache] Error saving ${key}:`, e);
      return false;
    }
  }

  /**
   * Supprimer une valeur du cache
   */
  static remove(key: string): void {
    localStorage.removeItem(`cache_${key}`);
  }

  /**
   * Nettoyer les entrées expirées du cache
   */
  static cleanup(ttlMs = 3600000): void {
    try {
      const now = Date.now();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const cache = JSON.parse(item) as CacheEntry<unknown>;
              if (now - cache.timestamp > ttlMs) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.error('[Cache] Error during cleanup:', e);
    }
  }
}

// Hook React pour utiliser le cache
import { useCallback } from 'react';

export function useLocalStorageCache<T>(key: string, ttlMs = 60000) {
  // Prefixer la clé pour éviter les collisions
  const cacheKey = `app_${key}`;
  
  const getData = useCallback(() => {
    return LocalStorageCache.get<T>(cacheKey, ttlMs);
  }, [cacheKey, ttlMs]);

  const setData = useCallback((data: T) => {
    return LocalStorageCache.set<T>(cacheKey, data);
  }, [cacheKey]);

  // Ajouter une fonction pour invalider le cache
  const invalidateData = useCallback(() => {
    LocalStorageCache.remove(cacheKey);
    return true;
  }, [cacheKey]);

  return { getData, setData, invalidateData };
}
