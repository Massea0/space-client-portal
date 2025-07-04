// src/components/diagnostics/ConnectionTroubleshooter.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { connectionDiagnostic } from '@/lib/connectionDiagnostic';
import { notificationManager } from '@/components/ui/notification-provider';
import { supabase } from '@/lib/supabaseClient';

interface ConnectionTroubleshooterProps {
  onReloadData: () => void;
  entityName: string; // "devis", "factures", "tickets", etc.
  className?: string;
}

export const ConnectionTroubleshooter: React.FC<ConnectionTroubleshooterProps> = ({ 
  onReloadData,
  entityName,
  className = ''
}) => {
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  
  const runConnectionDiagnostic = async () => {
    setDiagnosticRunning(true);
    try {
      // Exécuter le diagnostic
      const diagResult = await connectionDiagnostic.checkSupabaseConnection();
      
      // Essayer de corriger automatiquement
      const autoFixed = await connectionDiagnostic.attemptAutoFix();
      
      if (autoFixed) {
        notificationManager.success("Connexion rétablie", {
          message: `La connexion a été rétablie. Actualisation des ${entityName}...`
        });
        onReloadData(); // Recharger les données
      } else {
        // Afficher le rapport de diagnostic
        let message = "Problèmes détectés:\n";
        if (!diagResult.connected) message += "• Impossible de se connecter à la base de données\n";
        if (!diagResult.authenticated) message += "• Session non authentifiée\n";
        if (!diagResult.userProfile) message += "• Profil utilisateur introuvable\n";
        if (!diagResult.companyId) message += "• Aucune entreprise associée à votre profil\n";
        
        notificationManager.warning("Diagnostic de connexion", { message });
        
        // Si l'utilisateur n'est pas authentifié, proposer une reconnexion
        if (!diagResult.authenticated) {
          setTimeout(() => {
            if (window.confirm('Voulez-vous vous reconnecter pour résoudre ce problème?')) {
              supabase.auth.signOut().then(() => {
                window.location.href = '/login';
              });
            }
          }, 1000);
        }
      }
    } catch (e) {
      notificationManager.error("Erreur", {
        message: "Impossible de terminer le diagnostic. Veuillez contacter le support."
      });
    } finally {
      setDiagnosticRunning(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={runConnectionDiagnostic}
      disabled={diagnosticRunning}
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {diagnosticRunning ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          Diagnostic en cours...
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" />
          Diagnostiquer la connexion
        </>
      )}
    </Button>
  );
};
