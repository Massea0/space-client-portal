import React from "react";
import { cn } from "@/lib/utils";
import { ensureSingleElement } from "@/lib/react-children-utils.tsx";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DialogTrigger } from "@/components/ui/dialog";
import { SelectTrigger } from "@/components/ui/select";
// Import d'autres Triggers au besoin

/**
 * Wrapper sécurisé pour n'importe quel composant Trigger de Radix UI
 * qui utilise asChild et qui peut souffrir de l'erreur React.Children.only()
 */
interface SafeTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  component: React.ComponentType<{ asChild?: boolean; className?: string; children: React.ReactNode }>; // Le composant Trigger à utiliser
}

export const SafeTrigger = ({
  children,
  asChild = true,
  className,
  component: TriggerComponent
}: SafeTriggerProps) => {
  const safeChild = React.useMemo(() => {
    return ensureSingleElement(children);
  }, [children]);
  
  return (
    <TriggerComponent asChild={asChild} className={className}>
      {safeChild}
    </TriggerComponent>
  );
};

/**
 * Version sécurisée de TooltipTrigger
 */
interface SafeTooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const SafeTooltipTrigger = ({
  children,
  asChild = true,
  className
}: SafeTooltipTriggerProps) => {
  const safeChild = React.useMemo(() => {
    return ensureSingleElement(children);
  }, [children]);
  
  return (
    <TooltipTrigger asChild={asChild} className={className}>
      {safeChild}
    </TooltipTrigger>
  );
};

/**
 * Version sécurisée de DropdownMenuTrigger
 */
interface SafeDropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const SafeDropdownMenuTrigger = ({
  children,
  asChild = true,
  className
}: SafeDropdownMenuTriggerProps) => {
  const safeChild = React.useMemo(() => {
    return ensureSingleElement(children);
  }, [children]);
  
  return (
    <DropdownMenuTrigger asChild={asChild} className={className}>
      {safeChild}
    </DropdownMenuTrigger>
  );
};

/**
 * Version sécurisée de SelectTrigger
 */
interface SafeSelectTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export const SafeSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SafeSelectTriggerProps
>(
  ({ children, asChild = true, className, ...props }, ref) => {
    const safeChild = React.useMemo(() => {
      return ensureSingleElement(children);
    }, [children]);
    
    return (
      <SelectTrigger ref={ref} className={className} {...props}>
        {safeChild}
      </SelectTrigger>
    );
  }
);

SafeSelectTrigger.displayName = "SafeSelectTrigger";

/**
 * Version sécurisée générique pour tout composant qui utilise asChild
 */
export function withSafeTrigger<P extends { children: React.ReactNode; asChild?: boolean }>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const SafeComponent = (props: P) => {
    const { children, ...rest } = props;
    const safeChildren = React.useMemo(() => {
      return ensureSingleElement(children);
    }, [children]);
    
    return <Component {...rest as unknown as P} children={safeChildren} />;
  };
  
  SafeComponent.displayName = `SafeTrigger(${Component.displayName || Component.name || 'Component'})`;
  return SafeComponent;
}

// Export pre-configured safe components
export const SafeDialogTrigger = withSafeTrigger(DialogTrigger);

export default SafeTrigger;
