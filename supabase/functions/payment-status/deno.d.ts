// deno.d.ts
// Déclarations minimales pour supporter l'édition TypeScript dans VS Code pour Supabase Edge Functions

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

// Déclarations pour support de React dans Deno
declare namespace React {
  interface SlotProps {
    asChild?: boolean;
  }
  
  // Note: Children est déjà défini dans le namespace React global
  // Ces déclarations sont uniquement pour référence
}

// Déclarations de fonctions React Children pour référence
// Ces fonctions sont déjà disponibles dans React.Children
interface ReactChildrenFunctions {
  only(children: React.ReactNode): React.ReactElement;
  map<T, C>(children: C | C[], fn: (child: C, index: number) => T): T[];
  count(children: unknown): number;
}

// Types pour les utilitaires Radix UI
declare namespace RadixUITypes {
  interface SlotProps {
    asChild?: boolean;
  }
  
  interface DialogTriggerProps extends React.SlotProps {
    asChild?: boolean;
  }
}

// Déclarations d'utilitaires pour les développeurs
/**
 * Fonction utilitaire pour vérifier si un enfant est un élément React unique.
 * Utilisez ceci avant de passer des enfants à une prop qui exige React.Children.only()
 * @param children Les enfants React à vérifier
 * @returns boolean Vrai si c'est un élément React unique
 */
declare function isSingleReactElement(children: unknown): boolean;

/**
 * Fonction utilitaire pour garantir la compatibilité avec les éléments React asChild
 * @param element L'élément React à vérifier
 * @returns L'élément React ou un élément div contenant les enfants
 */
declare function ensureSingleElement(element: unknown): JSX.Element;
