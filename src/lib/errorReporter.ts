// src/lib/errorReporter.ts
/**
 * Service centralisé pour le reporting et la gestion des erreurs
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Reporter d'erreur centralisé pour l'application
 * Peut être facilement étendu pour intégrer des services comme Sentry
 */
class ErrorReporter {
  /**
   * Capture une exception et l'enregistre avec son contexte
   */
  captureException(error: unknown, context?: ErrorContext): void {
    const normalizedError = this.normalizeError(error);
    const normalizedContext = this.normalizeContext(context);

    console.error('[ErrorReporter]', {
      ...normalizedError,
      context: normalizedContext,
      timestamp: new Date().toISOString()
    });

    // Ici, on pourrait ajouter une intégration Sentry
    // Sentry.captureException(error, { extra: context });
  }

  /**
   * Enregistre un message d'erreur sans exception
   */
  captureMessage(message: string, context?: ErrorContext): void {
    const normalizedContext = this.normalizeContext(context);

    console.error('[ErrorReporter]', {
      message,
      context: normalizedContext,
      timestamp: new Date().toISOString()
    });
    
    // Sentry.captureMessage(message, { extra: context });
  }

  /**
   * Normalise une erreur pour éviter les problèmes de sérialisation
   */
  private normalizeError(error: unknown): { message: string, stack?: string, originalError?: unknown } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        originalError: { 
          name: error.name, 
          ...Object.getOwnPropertyNames(error).reduce((acc, prop) => {
            try {
              acc[prop] = ((error as unknown) as Record<string, unknown>)[prop];
            } catch (e) {
              acc[prop] = '[Sérialisation impossible]';
            }
            return acc;
          }, {} as Record<string, unknown>)
        }
      };
    }
    
    if (typeof error === 'object' && error !== null) {
      try {
        return {
          message: JSON.stringify(error),
          originalError: error
        };
      } catch (e) {
        return {
          message: '[Erreur non sérialisable]',
          stack: 'Objet complexe non sérialisable'
        };
      }
    }
    
    return {
      message: String(error)
    };
  }
  
  /**
   * Normalise le contexte pour éviter les problèmes de sérialisation
   */
  private normalizeContext(context?: ErrorContext): Record<string, unknown> {
    if (!context) return {};
    const safeContext: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(context)) {
      try {
        // Pour les objets complexes, essayer de les convertir en JSON
        if (typeof value === 'object' && value !== null) {
          safeContext[key] = JSON.stringify(value);
        } else {
          safeContext[key] = value;
        }
      } catch (e) {
        safeContext[key] = '[Non sérialisable]';
      }
    }
    
    return safeContext;
  }
}

export const errorReporter = new ErrorReporter();
