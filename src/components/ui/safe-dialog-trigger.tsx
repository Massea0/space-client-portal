import React from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Version améliorée et sécurisée de DialogTrigger qui évite les erreurs React.Children.only()
 * 
 * Utilisation:
 * <SafeDialogTrigger>
 *   <Button>Ouvrir</Button> // Fonctionne même si Button renvoie un fragment ou a un problème
 * </SafeDialogTrigger>
 */
interface SafeDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const SafeDialogTrigger = ({
  children,
  asChild = true,
  className
}: SafeDialogTriggerProps) => {
  // S'assurer que l'enfant est un seul élément React valide
  const safeChild = React.useMemo(() => {
    if (React.isValidElement(children)) {
      // Si c'est déjà un élément React valide, le retourner tel quel
      return children;
    }
    
    // Sinon, l'envelopper dans un div
    return <div className={cn("inline-flex", className)}>{children}</div>;
  }, [children, className]);
  
  return (
    <DialogTrigger asChild={asChild}>
      {safeChild}
    </DialogTrigger>
  );
};

/**
 * Version améliorée et sécurisée de toute propriété qui utilise asChild ou forward ref
 */
interface AsChildSafeProps {
  children: React.ReactNode;
  className?: string;
}

export const AsChildSafe = React.forwardRef<HTMLDivElement, AsChildSafeProps>(
  ({ children, className }, ref) => {
    // S'assurer que l'enfant est un élément React valide
    if (React.isValidElement(children)) {
      return children;
    }
    
    if (children === null || children === undefined) {
      return <div ref={ref} className={className} />;
    }
    
    return (
      <div ref={ref} className={cn("contents", className)}>
        {children}
      </div>
    );
  }
);

AsChildSafe.displayName = "AsChildSafe";

export default SafeDialogTrigger;
