// src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencySettings, BusinessContext, CompanySettings } from '@/types';
import { settingsApi } from '@/services/settingsApi';

interface SettingsContextType {
  currencySettings: CurrencySettings;
  businessContext: BusinessContext;
  companySettings: CompanySettings;
  loading: boolean;
  error: string | null;
  updateCurrencySettings: (settings: Partial<CurrencySettings>) => Promise<void>;
  updateBusinessContext: (context: Partial<BusinessContext>) => Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number, includeCurrencySymbol?: boolean) => string;
}

const defaultCurrencySettings: CurrencySettings = {
  symbol: 'FCFA',
  code: 'XOF',
  position: 'after',
  decimalPlaces: 0,
  thousandSeparator: ' ',
  decimalSeparator: ',',
  locale: 'fr-FR',
};

const defaultBusinessContext: BusinessContext = {
  context: 'general',
  description: 'Entreprise de services généraux',
  aiProjectContext: 'Vous êtes un assistant IA spécialisé dans la gestion de projets.',
};

const defaultCompanySettings: CompanySettings = {
  name: 'Mon Entreprise',
  address: '',
  ninea: '',
  rc: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(defaultCurrencySettings);
  const [businessContext, setBusinessContext] = useState<BusinessContext>(defaultBusinessContext);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour formater les montants selon les paramètres de devise
  const formatCurrency = (amount: number, includeCurrencySymbol: boolean = true): string => {
    try {
      // Utiliser la locale configurée pour le formatage
      const formatter = new Intl.NumberFormat(currencySettings.locale, {
        minimumFractionDigits: currencySettings.decimalPlaces,
        maximumFractionDigits: currencySettings.decimalPlaces,
        useGrouping: true,
      });

      let formatted = formatter.format(amount);

      // Remplacer les séparateurs si nécessaire
      if (currencySettings.thousandSeparator !== ' ') {
        formatted = formatted.replace(/\s/g, currencySettings.thousandSeparator);
      }
      if (currencySettings.decimalSeparator !== ',') {
        formatted = formatted.replace(/,/g, currencySettings.decimalSeparator);
      }

      // Ajouter le symbole de devise selon la position configurée
      if (includeCurrencySymbol) {
        return currencySettings.position === 'before' 
          ? `${currencySettings.symbol} ${formatted}`
          : `${formatted} ${currencySettings.symbol}`;
      }

      return formatted;
    } catch (error) {
      console.error('Erreur lors du formatage de la devise:', error);
      // Fallback au formatage par défaut
      return `${amount} ${currencySettings.symbol}`;
    }
  };

  // Charger les paramètres depuis l'API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currency, business, company] = await Promise.all([
        settingsApi.getCurrencySettings(),
        settingsApi.getBusinessContext(),
        settingsApi.getCompanySettings(),
      ]);

      setCurrencySettings(currency);
      setBusinessContext(business);
      setCompanySettings(company);
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les paramètres de devise
  const updateCurrencySettings = async (settings: Partial<CurrencySettings>) => {
    try {
      await settingsApi.updateCurrencySettings(settings);
      setCurrencySettings(prev => ({ ...prev, ...settings }));
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres de devise:', err);
      throw err;
    }
  };

  // Mettre à jour le contexte métier
  const updateBusinessContext = async (context: Partial<BusinessContext>) => {
    try {
      await settingsApi.updateBusinessContext(context);
      setBusinessContext(prev => ({ ...prev, ...context }));
    } catch (err) {
      console.error('Erreur lors de la mise à jour du contexte métier:', err);
      throw err;
    }
  };

  // Mettre à jour les paramètres de l'entreprise
  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    try {
      await settingsApi.updateCompanySettings(settings);
      setCompanySettings(prev => ({ ...prev, ...settings }));
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres de l\'entreprise:', err);
      throw err;
    }
  };

  // Actualiser tous les paramètres
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, []);

  const contextValue: SettingsContextType = {
    currencySettings,
    businessContext,
    companySettings,
    loading,
    error,
    updateCurrencySettings,
    updateBusinessContext,
    updateCompanySettings,
    refreshSettings,
    formatCurrency,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook pour utiliser le contexte des paramètres
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
