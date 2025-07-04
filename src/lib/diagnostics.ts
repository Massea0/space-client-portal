// src/lib/diagnostics.ts

/**
 * Classe utilitaire pour diagnostiquer les problèmes de performance et de rechargement de l'application
 */
export class Diagnostics {
  private static requestCounts: Map<string, number> = new Map();
  private static lastRequestTime: Map<string, number> = new Map();

  /**
   * Surveille les requêtes réseau pour détecter les boucles infinies
   * @param url URL de la requête à surveiller
   */
  static monitorRequest(url: string): void {
    // Extraire une version simplifiée de l'URL pour le regroupement
    const baseUrl = url.split('?')[0];
    
    const now = Date.now();
    const count = (this.requestCounts.get(baseUrl) || 0) + 1;
    const lastTime = this.lastRequestTime.get(baseUrl) || 0;
    const timeDiff = now - lastTime;
    
    this.requestCounts.set(baseUrl, count);
    this.lastRequestTime.set(baseUrl, now);
    
    // Détecter les requêtes trop fréquentes (plus de 5 requêtes en moins de 10 secondes)
    if (count > 5 && timeDiff < 10000) {
      console.warn(
        `[Diagnostics] Détection de requêtes fréquentes pour ${baseUrl}. ` +
        `${count} requêtes en ${timeDiff / 1000}s. Dernier intervalle: ${timeDiff}ms`
      );
      
      // Si nous avons plus de 10 requêtes en moins de 3 secondes, c'est probablement une boucle infinie
      if (count > 10 && timeDiff < 3000) {
        console.error(`[Diagnostics] ALERTE: Boucle infinie possible pour ${baseUrl}`);
        try {
          throw new Error('Trace de boucle infinie');
        } catch (e) {
          console.error('Stack trace:', e);
        }
      }
    }
    
    // Réinitialiser le compteur après 30 secondes d'inactivité
    setTimeout(() => {
      const lastRequestTime = this.lastRequestTime.get(baseUrl) || 0;
      if ((Date.now() - lastRequestTime) >= 30000) {
        this.requestCounts.delete(baseUrl);
      }
    }, 30000);
  }

  /**
   * Surveille le nombre de rendus d'un composant React
   * @param componentName Nom du composant à surveiller
   * @returns Un hook useEffect à utiliser dans le composant
   */
  static monitorRenders(componentName: string): () => void {
    const renderCounts: Map<string, number> = new Map();
    const renderTimes: Map<string, number[]> = new Map();
    
    return () => {
      const count = (renderCounts.get(componentName) || 0) + 1;
      renderCounts.set(componentName, count);
      
      const times = renderTimes.get(componentName) || [];
      const now = Date.now();
      times.push(now);
      if (times.length > 10) times.shift(); // Garder seulement les 10 derniers rendus
      renderTimes.set(componentName, times);
      
      // Détecter les rendus trop fréquents (plus de 5 rendus en moins de 2 secondes)
      if (count > 5 && times.length > 1) {
        const timeSpan = times[times.length - 1] - times[0];
        if (timeSpan < 2000) {
          console.warn(
            `[Diagnostics] ${componentName}: ${times.length} rendus en ${timeSpan}ms. ` +
            `Total: ${count}. Cela pourrait indiquer un problème dans la gestion des états ou des effets.`
          );
        }
      }
      
      console.log(`[Diagnostics] ${componentName} rendu #${count}`);
    };
  }

  /**
   * Génère un log formaté avec horodatage
   * @param category Catégorie du log (Network, Dashboard, etc.)
   * @param message Message à logger
   * @param data Données optionnelles à inclure
   */
  static log(category: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString().slice(11, 23); // Format HH:MM:SS.mmm
    console.log(`[${timestamp}] [${category}] ${message}`, data ? data : '');
  }
}

// Étendre l'objet window avec une fonction de diagnostic globale
declare global {
  interface Window {
    moniteurRequetes?: (active: boolean) => void;
  }
}

// Fonction pour activer/désactiver la surveillance des requêtes
const originalFetch = window.fetch;

export function setupDiagnostics(): void {
  let isMonitoring = false;
  
  window.moniteurRequetes = (active: boolean) => {
    isMonitoring = active;
    console.log(`[Diagnostics] Surveillance des requêtes ${active ? 'activée' : 'désactivée'}`);
    
    if (active && window.fetch === originalFetch) {
      window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = typeof input === 'string' 
          ? input 
          : input instanceof Request 
            ? input.url 
            : input.toString();
        if (isMonitoring) {
          Diagnostics.monitorRequest(url);
        }
        return originalFetch(input, init);
      };
    } else if (!active && window.fetch !== originalFetch) {
      window.fetch = originalFetch;
    }
  };
  
  // Initiallement activé
  window.moniteurRequetes(true);
}
