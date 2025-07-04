// src/pages/admin/AdminSettings.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/context/SettingsContext';
import { BusinessContext } from '@/types';
import { notificationManager } from '@/components/ui/notification-provider';
import { 
  Settings, 
  DollarSign, 
  Building, 
  Brain, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';

const AdminSettings = () => {
  const {
    currencySettings,
    businessContext,
    companySettings,
    loading,
    formatCurrency,
    updateCurrencySettings,
    updateBusinessContext,
    updateCompanySettings,
    refreshSettings,
  } = useSettings();

  const [saving, setSaving] = useState<string | null>(null);

  // États locaux pour les formulaires
  const [localCurrency, setLocalCurrency] = useState(currencySettings);
  const [localBusiness, setLocalBusiness] = useState(businessContext);
  const [localCompany, setLocalCompany] = useState(companySettings);

  // Mettre à jour les états locaux quand les paramètres changent
  React.useEffect(() => {
    setLocalCurrency(currencySettings);
    setLocalBusiness(businessContext);
    setLocalCompany(companySettings);
  }, [currencySettings, businessContext, companySettings]);

  // Sauvegarder les paramètres de devise
  const handleSaveCurrency = async () => {
    setSaving('currency');
    try {
      await updateCurrencySettings(localCurrency);
      notificationManager.success('Succès', {
        message: 'Paramètres de devise mis à jour avec succès',
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Erreur lors de la mise à jour des paramètres de devise',
      });
    } finally {
      setSaving(null);
    }
  };

  // Sauvegarder le contexte métier
  const handleSaveBusiness = async () => {
    setSaving('business');
    try {
      await updateBusinessContext(localBusiness);
      notificationManager.success('Succès', {
        message: 'Contexte métier mis à jour avec succès',
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Erreur lors de la mise à jour du contexte métier',
      });
    } finally {
      setSaving(null);
    }
  };

  // Sauvegarder les paramètres de l'entreprise
  const handleSaveCompany = async () => {
    setSaving('company');
    try {
      await updateCompanySettings(localCompany);
      notificationManager.success('Succès', {
        message: 'Paramètres de l\'entreprise mis à jour avec succès',
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Erreur lors de la mise à jour des paramètres de l\'entreprise',
      });
    } finally {
      setSaving(null);
    }
  };

  // Actualiser tous les paramètres
  const handleRefresh = async () => {
    setSaving('refresh');
    try {
      await refreshSettings();
      notificationManager.success('Succès', {
        message: 'Paramètres actualisés avec succès',
      });
    } catch (error) {
      notificationManager.error('Erreur', {
        message: 'Erreur lors de l\'actualisation des paramètres',
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres Système</h1>
          <p className="text-muted-foreground mt-1">
            Configuration globale de l'application et paramètres régionaux
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={saving === 'refresh'}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${saving === 'refresh' ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="currency" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Devise
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Contexte IA
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Onglet Devise */}
        <TabsContent value="currency">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configuration de la devise
                </CardTitle>
                <CardDescription>
                  Paramètres d'affichage des montants et devise utilisée
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency-symbol">Symbole de devise</Label>
                    <Input
                      id="currency-symbol"
                      value={localCurrency.symbol}
                      onChange={(e) => setLocalCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="FCFA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency-code">Code ISO de devise</Label>
                    <Input
                      id="currency-code"
                      value={localCurrency.code}
                      onChange={(e) => setLocalCurrency(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="XOF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency-position">Position du symbole</Label>
                    <Select
                      value={localCurrency.position}
                      onValueChange={(value: 'before' | 'after') => 
                        setLocalCurrency(prev => ({ ...prev, position: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Avant le montant ($ 100)</SelectItem>
                        <SelectItem value="after">Après le montant (100 FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimal-places">Nombre de décimales</Label>
                    <Select
                      value={localCurrency.decimalPlaces.toString()}
                      onValueChange={(value) => 
                        setLocalCurrency(prev => ({ ...prev, decimalPlaces: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 décimale (1000 FCFA)</SelectItem>
                        <SelectItem value="2">2 décimales (1000,00 FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thousand-separator">Séparateur de milliers</Label>
                    <Input
                      id="thousand-separator"
                      value={localCurrency.thousandSeparator}
                      onChange={(e) => setLocalCurrency(prev => ({ ...prev, thousandSeparator: e.target.value }))}
                      placeholder=" "
                      maxLength={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimal-separator">Séparateur décimal</Label>
                    <Input
                      id="decimal-separator"
                      value={localCurrency.decimalSeparator}
                      onChange={(e) => setLocalCurrency(prev => ({ ...prev, decimalSeparator: e.target.value }))}
                      placeholder=","
                      maxLength={1}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveCurrency}
                    disabled={saving === 'currency'}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving === 'currency' ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Onglet Contexte Métier */}
        <TabsContent value="business">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Contexte métier et IA
                </CardTitle>
                <CardDescription>
                  Configuration du secteur d'activité pour adapter les réponses IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="business-context">Secteur d'activité</Label>
                  <Select
                    value={localBusiness.context}
                    onValueChange={(value: BusinessContext['context']) => 
                      setLocalBusiness(prev => ({ ...prev, context: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="btp">BTP / Construction</SelectItem>
                      <SelectItem value="saas">SaaS / Logiciel</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="consulting">Conseil</SelectItem>
                      <SelectItem value="manufacturing">Industrie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-description">Description de l'activité</Label>
                  <Textarea
                    id="business-description"
                    value={localBusiness.description}
                    onChange={(e) => setLocalBusiness(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre secteur d'activité..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-context">Contexte IA pour les projets</Label>
                  <Textarea
                    id="ai-context"
                    value={localBusiness.aiProjectContext}
                    onChange={(e) => setLocalBusiness(prev => ({ ...prev, aiProjectContext: e.target.value }))}
                    placeholder="Instructions pour l'IA lors de la génération de plans de projets..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Ce texte sera injecté dans le prompt IA pour adapter les suggestions de projets à votre secteur.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveBusiness}
                    disabled={saving === 'business'}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving === 'business' ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Onglet Entreprise */}
        <TabsContent value="company">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>
                  Paramètres utilisés dans les documents et factures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input
                      id="company-name"
                      value={localCompany.name}
                      onChange={(e) => setLocalCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Adresse</Label>
                    <Input
                      id="company-address"
                      value={localCompany.address}
                      onChange={(e) => setLocalCompany(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse complète"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-ninea">NINEA</Label>
                    <Input
                      id="company-ninea"
                      value={localCompany.ninea}
                      onChange={(e) => setLocalCompany(prev => ({ ...prev, ninea: e.target.value }))}
                      placeholder="Numéro NINEA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-rc">Registre du Commerce</Label>
                    <Input
                      id="company-rc"
                      value={localCompany.rc}
                      onChange={(e) => setLocalCompany(prev => ({ ...prev, rc: e.target.value }))}
                      placeholder="Numéro RC"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveCompany}
                    disabled={saving === 'company'}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving === 'company' ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Onglet Aperçu */}
        <TabsContent value="preview">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Aperçu des paramètres
                </CardTitle>
                <CardDescription>
                  Visualisation des paramètres actuels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Formatage des montants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">1000 →</span>
                        <span className="ml-2 font-mono">{formatCurrency(1000)}</span>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">123456.78 →</span>
                        <span className="ml-2 font-mono">{formatCurrency(123456.78)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Contexte métier</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <Badge variant="secondary" className="mb-2">
                        {businessContext.context.toUpperCase()}
                      </Badge>
                      <p className="text-sm">{businessContext.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Informations entreprise</h3>
                    <div className="p-3 bg-muted rounded-lg space-y-1">
                      <div><strong>{companySettings.name}</strong></div>
                      <div className="text-sm text-muted-foreground">{companySettings.address}</div>
                      <div className="text-xs text-muted-foreground">
                        NINEA: {companySettings.ninea} | RC: {companySettings.rc}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
