/**
 * Utils de validation React pour prévenir les erreurs subtiles
 * Particulièrement utile pour les problèmes liés à React.Children.only
 * et aux composants qui utilisent asChild
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Convertit les enfants en un élément React unique et valide pour `asChild`.
 * Si c'est déjà un élément unique et non un fragment, le renvoie tel quel.
 * Sinon, enveloppe les enfants dans un `div` avec `className="contents"` pour ne pas affecter le layout.
 * Utile pour les composants qui utilisent `asChild` ou `React.Children.only()`.
 */
export function ensureSingleElement(children: React.ReactNode): React.ReactElement {
  // Cas 1: Si c'est un élément React valide et non un fragment
  if (React.isValidElement(children) && children.type !== React.Fragment) {
    return children;
  }
  
  // Cas 2: Si c'est null/undefined, retourne un div vide pour éviter les erreurs
  if (children === null || children === undefined) {
    return <div className="hidden"></div>;
  }
  
  // Cas 3: Si c'est un fragment React explicite (<></>)
  if (React.isValidElement(children) && children.type === React.Fragment) {
    return <div className="contents">{(children as React.ReactElement<{ children: React.ReactNode }>).props.children}</div>;
  }
  
  // Cas 4: Si c'est un tableau d'éléments, envelopper dans un div.contents
  if (Array.isArray(children)) {
    return <div className="contents">{children}</div>;
  }
  
  // Cas 5: Pour tous les autres cas (primitives, etc.), envelopper simplement
  return <div className="contents">{children}</div>;
}

/**
 * Wrapper sécurisé pour footer, boutons etc. qui doivent être des éléments uniques
 */
export function SafeWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Wrapper pour les enfants des composants utilisant asChild
 * Évite les erreurs React.Children.only avec les fragments <>...</>
 */
export function AsChildSafeWrapper({ children }: { children: React.ReactNode }) {
  // Si c'est un fragment React, on le convertit en div
  if (React.isValidElement(children) && children.type === React.Fragment) {
    return <div className="flex gap-2">{children.props.children}</div>;
  }
  
  // Si c'est null ou undefined, retournez un div vide plutôt que null
  if (children === null || children === undefined) {
    return <div />;
  }
  
  // Si c'est un array de plus d'un élément, envelopper dans un div
  if (Array.isArray(children) && children.length > 1) {
    return <div className="flex gap-2">{children}</div>;
  }
  
  // Si c'est un string, number ou autre primitive, l'envelopper
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    return <div>{children}</div>;
  }
  
  return <>{children}</>;
}

/**
 * HoC (Higher-order Component) pour sécuriser les composants qui utilisent Slot ou DialogTrigger
 * Utilisez cette fonction pour envelopper vos composants ou fonctions de rendu qui pourraient
 * avoir des problèmes avec React.Children.only()
 * @example
 * const SafeButton = withSafeChildren(Button);
 * // Puis utilisez SafeButton dans les DialogTrigger avec asChild
 */
export function withSafeChildren<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  const SafeComponent = (props: P) => {
    let safeProps = { ...props };
    
    // Si le composant a des enfants, assurez-vous qu'ils sont sûrs
    if ('children' in props) {
      const children = props.children as React.ReactNode;
      safeProps = {
        ...props,
        children: React.isValidElement(children) ? 
          children : 
          <div className="contents">{children}</div>
      };
    }
    
    return <Component {...safeProps} />;
  };
  
  SafeComponent.displayName = `SafeChildren(${Component.displayName || Component.name || 'Component'})`;
  return SafeComponent;
}

/**
 * Composant pour remplacer le DialogTrigger standard avec une version plus sûre
 * qui assure que les enfants sont toujours un élément React valide
 */
export function SafeDialogTrigger({ children, asChild = false }: { children: React.ReactNode, asChild?: boolean }) {
  const safeChildren = React.isValidElement(children) ? 
    children : 
    <div className="inline-block">{children}</div>;
    
  // Import du DialogTrigger (dans un composant utilisé directement ou via dynamic import en fonction du besoin)
  const DialogTrigger = React.lazy(() => import('@/components/ui/dialog').then(module => ({ 
    default: module.DialogTrigger 
  })));
  
  return (
    <React.Suspense fallback={<div className="inline-block">Loading...</div>}>
      <DialogTrigger asChild={asChild}>
        {safeChildren}
      </DialogTrigger>
    </React.Suspense>
  );
}

/**
 * Wrapper spécifique pour les modaux imbriqués qui sont particulièrement sensibles
 * aux erreurs React.Children.only
 * @returns Un élément React toujours valide et sécurisé pour l'utilisation dans les modaux
 */
export function createNestedModalWrapper() {
  return React.memo(function ModalContentWrapper({ children }: { children: React.ReactNode }) {
    // Si nous avons un seul élément valide, le renvoyer tel quel
    if (React.isValidElement(children)) {
      return children;
    }
    
    // Sinon, l'envelopper dans un div pour garantir un élément unique
    return <div className="modal-content-wrapper">{children}</div>;
  });
}

/**
 * Vérifie si l'élément React passé est un fragment, et retourne true si c'est le cas
 */
export function isFragment(child: React.ReactNode): boolean {
  return React.isValidElement(child) && child.type === React.Fragment;
}
