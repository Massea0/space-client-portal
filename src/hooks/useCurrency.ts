// src/hooks/useCurrency.ts
import { useSettings } from '@/context/SettingsContext';

export const useCurrency = () => {
  const { formatCurrency, currencySettings } = useSettings();
  
  return {
    formatCurrency,
    currencySettings,
    formatAmount: formatCurrency, // alias pour la rétrocompatibilité
  };
};
