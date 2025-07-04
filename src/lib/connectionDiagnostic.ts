// src/lib/connectionDiagnostic.ts

import { supabase } from './supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';

/**
 * Utilitaire pour diagnostiquer les problèmes de connexion à Supabase 
 * et autres services externes
 */
export const connectionDiagnostic = {
  /**
   * Teste la connexion à Supabase et l'authenticité de l'utilisateur
   * @returns Un rapport d'état de la connexion Supabase
   */
  async checkSupabaseConnection(): Promise<{
    connected: boolean;
    authenticated: boolean;
    sessionValid: boolean;
    userProfile: boolean;
    companyId: string | null;
    error?: string;
  }> {
    try {
      // Vérifier si on peut joindre Supabase
      const { data: pingData, error: pingError } = await supabase.from('_diagnose_connection').select('*').limit(1);
      
      if (pingError) {
        return {
          connected: false,
          authenticated: false,
          sessionValid: false,
          userProfile: false,
          companyId: null,
          error: `Erreur de connexion à Supabase: ${pingError.message}`
        };
      }

      // Vérifier la session authentifiée
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return {
          connected: true,
          authenticated: false,
          sessionValid: false,
          userProfile: false,
          companyId: null,
          error: sessionError ? `Erreur de session: ${sessionError.message}` : 'Aucune session active'
        };
      }

      // Vérifier les informations de profil
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*, companies(name)')
        .eq('id', session.user.id)
        .single();

      if (profileError || !userProfile) {
        return {
          connected: true,
          authenticated: true,
          sessionValid: true,
          userProfile: false,
          companyId: null,
          error: profileError ? `Erreur de profil: ${profileError.message}` : 'Profil utilisateur non trouvé'
        };
      }

      return {
        connected: true,
        authenticated: true,
        sessionValid: true,
        userProfile: true,
        companyId: userProfile.company_id || null,
        error: !userProfile.company_id ? 'Aucun ID de compagnie associé au profil' : undefined
      };
    } catch (error) {
      return {
        connected: false,
        authenticated: false,
        sessionValid: false,
        userProfile: false,
        companyId: null,
        error: `Exception: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  
  /**
   * Tenter de résoudre automatiquement les problèmes courants de connexion
   */
  async attemptAutoFix(): Promise<boolean> {
    try {
      // Vérifier d'abord l'état actuel
      const diagResult = await this.checkSupabaseConnection();
      
      // Si tout fonctionne, rien à faire
      if (diagResult.connected && diagResult.authenticated && diagResult.userProfile && diagResult.companyId) {
        return true;
      }
      
      // Si connecté mais pas authentifié, essayer de rafraîchir la session
      if (diagResult.connected && !diagResult.authenticated) {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data.session) {
          return true; // Rafraîchissement réussi
        }
      }
      
      return false; // Pas de solution automatique possible
    } catch (error) {
      console.error("Erreur lors de la tentative de réparation:", error);
      return false;
    }
  },
  
  /**
   * Afficher un rapport de diagnostic pour l'utilisateur
   */
  async showDiagnosticReport(): Promise<void> {
    const diagResult = await this.checkSupabaseConnection();
    
    if (!diagResult.connected || !diagResult.authenticated || !diagResult.userProfile) {
      notificationManager.error("Problème de connexion", {
        message: `Diagnostic: ${diagResult.error}. Essayez de vous reconnecter.`
      });
    } else if (!diagResult.companyId) {
      notificationManager.warning("Profil incomplet", {
        message: "Votre profil n'est associé à aucune entreprise, ce qui limite l'accès aux données."
      });
    }
  }
};
