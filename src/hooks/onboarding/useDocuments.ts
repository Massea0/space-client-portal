// src/hooks/onboarding/useDocuments.ts
// Hook simplifié pour la gestion des documents d'onboarding
// Version temporaire pendant le développement

import { DocumentTemplate, DocumentToSign } from '@/types/onboarding';

// ============================================================================
// INTERFACES SIMPLIFIÉES
// ============================================================================

interface DocumentTemplatesHook {
  templates: DocumentTemplate[];
  isLoading: boolean;
  error: string | null;
  // Méthodes simplifiées pour le moment
  refetch: () => void;
}

interface DocumentSignatureHook {
  signatures: DocumentToSign[];
  isLoading: boolean;
  error: string | null;
  // Méthodes simplifiées pour le moment
  refetch: () => void;
}

// ============================================================================
// HOOKS SIMPLIFIÉS
// ============================================================================

export function useDocumentTemplates(): DocumentTemplatesHook {
  return {
    templates: [],
    isLoading: false,
    error: null,
    refetch: () => {
      console.log('Refetch templates - fonctionnalité en développement');
    }
  };
}

export function useDocumentSignature(): DocumentSignatureHook {
  return {
    signatures: [],
    isLoading: false,
    error: null,
    refetch: () => {
      console.log('Refetch signatures - fonctionnalité en développement');
    }
  };
}

// ============================================================================
// NOTES DE DÉVELOPPEMENT
// ============================================================================

/*
PROCHAINES ÉTAPES :
1. Finaliser les services API (documentApi)
2. Implémenter les vrais hooks avec React Query
3. Ajouter la gestion des templates IA
4. Intégrer la signature électronique
5. Tester l'ensemble du workflow

HOOKS À RÉIMPLÉMENTER :
- useDocumentTemplates (complet avec CRUD)
- useContractTemplates (templates de contrats)
- useAIGeneration (génération IA de documents)
- useDocumentSignature (workflow de signature)
- useDocumentPreview (prévisualisation documents)

SERVICES À COMPLÉTER :
- documentApi.getTemplates()
- documentApi.createTemplate()
- documentApi.generateWithAI()
- documentApi.initializeSignature()
- etc.
*/
