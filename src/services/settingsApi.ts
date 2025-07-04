// src/services/settingsApi.ts
import { supabase } from '@/lib/supabaseClient';
import { AppSetting, CurrencySettings, BusinessContext, CompanySettings } from '@/types';

// Interface pour les données brutes de la base
interface DbAppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  data_type: string;
  created_at: string;
  updated_at: string;
}

// Fonctions de transformation
const transformDbToAppSetting = (dbSetting: DbAppSetting): AppSetting => ({
  id: dbSetting.id,
  key: dbSetting.key,
  value: dbSetting.value,
  category: dbSetting.category as AppSetting['category'],
  description: dbSetting.description || undefined,
  dataType: dbSetting.data_type as AppSetting['dataType'],
  createdAt: new Date(dbSetting.created_at),
  updatedAt: new Date(dbSetting.updated_at),
});

export const settingsApi = {
  // Récupérer tous les paramètres
  async getAll(): Promise<AppSetting[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }

    return data.map(transformDbToAppSetting);
  },

  // Récupérer les paramètres par catégorie
  async getByCategory(category: string): Promise<AppSetting[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true });

    if (error) {
      console.error(`Erreur lors de la récupération des paramètres de catégorie ${category}:`, error);
      throw error;
    }

    return data.map(transformDbToAppSetting);
  },

  // Récupérer un paramètre par clé
  async getByKey(key: string): Promise<AppSetting | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Paramètre non trouvé
      }
      console.error(`Erreur lors de la récupération du paramètre ${key}:`, error);
      throw error;
    }

    return transformDbToAppSetting(data);
  },

  // Mettre à jour un paramètre
  async update(key: string, value: string): Promise<AppSetting> {
    const { data, error } = await supabase
      .from('app_settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du paramètre ${key}:`, error);
      throw error;
    }

    return transformDbToAppSetting(data);
  },

  // Mettre à jour plusieurs paramètres
  async updateMultiple(updates: { key: string; value: string }[]): Promise<AppSetting[]> {
    const promises = updates.map(({ key, value }) => this.update(key, value));
    return Promise.all(promises);
  },

  // Fonctions utilitaires pour récupérer des configurations spécifiques
  async getCurrencySettings(): Promise<CurrencySettings> {
    const settings = await this.getByCategory('localization');
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      symbol: settingsMap['currency_symbol'] || 'FCFA',
      code: settingsMap['currency_code'] || 'XOF',
      position: (settingsMap['currency_position'] as 'before' | 'after') || 'after',
      decimalPlaces: parseInt(settingsMap['currency_decimal_places'] || '0'),
      thousandSeparator: settingsMap['currency_thousand_separator'] || ' ',
      decimalSeparator: settingsMap['currency_decimal_separator'] || ',',
      locale: settingsMap['locale'] || 'fr-FR',
    };
  },

  async getBusinessContext(): Promise<BusinessContext> {
    const settings = await this.getByCategory('ai');
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      context: (settingsMap['business_context'] as BusinessContext['context']) || 'general',
      description: settingsMap['business_description'] || 'Entreprise de services généraux',
      aiProjectContext: settingsMap['ai_project_context'] || 'Vous êtes un assistant IA spécialisé dans la gestion de projets.',
    };
  },

  async getCompanySettings(): Promise<CompanySettings> {
    const settings = await this.getByCategory('company');
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      name: settingsMap['company_name'] || 'Mon Entreprise',
      address: settingsMap['company_address'] || '',
      ninea: settingsMap['company_ninea'] || '',
      rc: settingsMap['company_rc'] || '',
    };
  },

  // Mise à jour des paramètres de devise
  async updateCurrencySettings(settings: Partial<CurrencySettings>): Promise<void> {
    const updates: { key: string; value: string }[] = [];

    if (settings.symbol !== undefined) updates.push({ key: 'currency_symbol', value: settings.symbol });
    if (settings.code !== undefined) updates.push({ key: 'currency_code', value: settings.code });
    if (settings.position !== undefined) updates.push({ key: 'currency_position', value: settings.position });
    if (settings.decimalPlaces !== undefined) updates.push({ key: 'currency_decimal_places', value: settings.decimalPlaces.toString() });
    if (settings.thousandSeparator !== undefined) updates.push({ key: 'currency_thousand_separator', value: settings.thousandSeparator });
    if (settings.decimalSeparator !== undefined) updates.push({ key: 'currency_decimal_separator', value: settings.decimalSeparator });
    if (settings.locale !== undefined) updates.push({ key: 'locale', value: settings.locale });

    if (updates.length > 0) {
      await this.updateMultiple(updates);
    }
  },

  // Mise à jour du contexte métier
  async updateBusinessContext(context: Partial<BusinessContext>): Promise<void> {
    const updates: { key: string; value: string }[] = [];

    if (context.context !== undefined) updates.push({ key: 'business_context', value: context.context });
    if (context.description !== undefined) updates.push({ key: 'business_description', value: context.description });
    if (context.aiProjectContext !== undefined) updates.push({ key: 'ai_project_context', value: context.aiProjectContext });

    if (updates.length > 0) {
      await this.updateMultiple(updates);
    }
  },

  // Mise à jour des paramètres de l'entreprise
  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<void> {
    const updates: { key: string; value: string }[] = [];

    if (settings.name !== undefined) updates.push({ key: 'company_name', value: settings.name });
    if (settings.address !== undefined) updates.push({ key: 'company_address', value: settings.address });
    if (settings.ninea !== undefined) updates.push({ key: 'company_ninea', value: settings.ninea });
    if (settings.rc !== undefined) updates.push({ key: 'company_rc', value: settings.rc });

    if (updates.length > 0) {
      await this.updateMultiple(updates);
    }
  },
};
