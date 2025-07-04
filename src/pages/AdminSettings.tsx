// src/pages/AdminSettings.tsx - Page de paramètres administrateur
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Zap,
  Brain,
  Users,
  Building,
  CreditCard,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Search,
  Filter,
  BarChart3,
  Activity,
  Timer,
  Calendar,
  Palette,
  Smartphone,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn, formatCurrency } from '@/lib/utils';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  value: string | boolean;
  type: 'text' | 'password' | 'boolean' | 'select';
  options?: string[];
}

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Paramètres généraux
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Arcadis Enterprise OS',
    companyEmail: 'admin@arcadis-enterprise.com',
    companyPhone: '+33 1 23 45 67 89',
    companyAddress: '123 Avenue Innovation, 75001 Paris',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'fr',
    dateFormat: 'dd/MM/yyyy',
    theme: 'auto' // auto, light, dark
  });

  // Paramètres de notifications
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'invoice_created',
      title: 'Nouvelle facture créée',
      description: 'Notification lors de la création d\'une facture',
      enabled: true,
      channels: { email: true, push: true, sms: false }
    },
    {
      id: 'payment_received',
      title: 'Paiement reçu',
      description: 'Notification lors de la réception d\'un paiement',
      enabled: true,
      channels: { email: true, push: true, sms: true }
    },
    {
      id: 'invoice_overdue',
      title: 'Facture en retard',
      description: 'Alerte pour les factures impayées',
      enabled: true,
      channels: { email: true, push: true, sms: false }
    },
    {
      id: 'quote_approved',
      title: 'Devis approuvé',
      description: 'Notification d\'approbation de devis',
      enabled: true,
      channels: { email: true, push: false, sms: false }
    },
    {
      id: 'system_maintenance',
      title: 'Maintenance système',
      description: 'Alertes de maintenance programmée',
      enabled: true,
      channels: { email: true, push: true, sms: false }
    }
  ]);

  // Paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'password_policy',
      title: 'Politique de mot de passe',
      description: 'Exigences minimales pour les mots de passe',
      value: 'strong',
      type: 'select',
      options: ['basic', 'medium', 'strong', 'enterprise']
    },
    {
      id: 'session_timeout',
      title: 'Délai d\'expiration session',
      description: 'Temps d\'inactivité avant déconnexion (minutes)',
      value: '30',
      type: 'text'
    },
    {
      id: 'two_factor_required',
      title: 'Authentification 2FA obligatoire',
      description: 'Imposer l\'authentification à deux facteurs',
      value: true,
      type: 'boolean'
    },
    {
      id: 'ip_whitelist',
      title: 'Liste blanche IP',
      description: 'Restreindre l\'accès à certaines adresses IP',
      value: false,
      type: 'boolean'
    }
  ]);

  // Paramètres d'automatisation
  const [automationSettings, setAutomationSettings] = useState({
    autoInvoicing: true,
    autoReminders: true,
    autoBackup: true,
    autoReports: false,
    reminderDays: [7, 14, 30],
    backupFrequency: 'daily',
    reportFrequency: 'weekly',
    aiOptimization: true,
    smartRouting: true,
    predictiveAnalytics: true
  });

  // Paramètres d'intégration
  const [integrationSettings, setIntegrationSettings] = useState({
    stripeEnabled: true,
    stripePublicKey: 'pk_test_...',
    stripeSecretKey: '••••••••',
    paypalEnabled: false,
    paypalClientId: '',
    webhookUrl: 'https://api.arcadis-enterprise.com/webhooks',
    apiRateLimit: 1000,
    corsOrigins: 'https://app.arcadis-enterprise.com'
  });

  const settingSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'Général',
      description: 'Paramètres de base de l\'application',
      icon: Settings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Gestion des alertes et notifications',
      icon: Bell,
      badge: notifications.filter(n => n.enabled).length.toString()
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Paramètres de sécurité et authentification',
      icon: Shield
    },
    {
      id: 'automation',
      title: 'Automatisation',
      description: 'Processus automatisés et IA',
      icon: Zap,
      badge: 'IA'
    },
    {
      id: 'integrations',
      title: 'Intégrations',
      description: 'APIs et services externes',
      icon: Globe
    },
    {
      id: 'backup',
      title: 'Sauvegarde',
      description: 'Sauvegarde et restauration',
      icon: Database
    }
  ];

  // Fonction pour sauvegarder les paramètres
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Paramètres sauvegardés:', {
        general: generalSettings,
        notifications,
        security: securitySettings,
        automation: automationSettings,
        integrations: integrationSettings
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour une notification
  const updateNotification = (id: string, field: string, value: any) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, [field]: value }
        : notif
    ));
    setHasChanges(true);
  };

  // Fonction pour mettre à jour un canal de notification
  const updateNotificationChannel = (id: string, channel: string, value: boolean) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, channels: { ...notif.channels, [channel]: value } }
        : notif
    ));
    setHasChanges(true);
  };

  // Fonction pour exporter la configuration
  const exportConfig = () => {
    const config = {
      general: generalSettings,
      notifications,
      security: securitySettings,
      automation: automationSettings,
      integrations: integrationSettings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcadis-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Paramètres Administrateur</h1>
              <p className="text-muted-foreground">
                Configuration avancée du système Arcadis Enterprise OS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportConfig}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="gap-2"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Alerte changements non sauvegardés */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Modifications non sauvegardées
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Vous avez des changements en attente. N'oubliez pas de sauvegarder.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="ml-auto"
                    >
                      Sauvegarder maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {settingSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex items-center gap-2 text-xs lg:text-sm"
              >
                <section.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.title}</span>
                {section.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {section.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations de l'entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      value={generalSettings.companyName}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={generalSettings.companyEmail}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({ ...prev, companyEmail: e.target.value }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Téléphone</Label>
                    <Input
                      id="companyPhone"
                      value={generalSettings.companyPhone}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({ ...prev, companyPhone: e.target.value }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => {
                        setGeneralSettings(prev => ({ ...prev, timezone: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Textarea
                    id="companyAddress"
                    value={generalSettings.companyAddress}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, companyAddress: e.target.value }));
                      setHasChanges(true);
                    }}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Préférences d'affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select
                      value={generalSettings.currency}
                      onValueChange={(value) => {
                        setGeneralSettings(prev => ({ ...prev, currency: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollar ($)</SelectItem>
                        <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={generalSettings.language}
                      onValueChange={(value) => {
                        setGeneralSettings(prev => ({ ...prev, language: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="theme">Thème</Label>
                    <Select
                      value={generalSettings.theme}
                      onValueChange={(value) => {
                        setGeneralSettings(prev => ({ ...prev, theme: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Automatique
                          </div>
                        </SelectItem>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Clair
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Sombre
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            {notifications.map((notif) => (
              <Card key={notif.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Switch
                          checked={notif.enabled}
                          onCheckedChange={(checked) => updateNotification(notif.id, 'enabled', checked)}
                        />
                        <div>
                          <h3 className="font-semibold">{notif.title}</h3>
                          <p className="text-sm text-muted-foreground">{notif.description}</p>
                        </div>
                      </div>
                      
                      {notif.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-10 mt-4"
                        >
                          <p className="text-sm font-medium mb-3">Canaux de notification :</p>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={notif.channels.email}
                                onCheckedChange={(checked) => updateNotificationChannel(notif.id, 'email', checked)}
                              />
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">Email</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={notif.channels.push}
                                onCheckedChange={(checked) => updateNotificationChannel(notif.id, 'push', checked)}
                              />
                              <div className="flex items-center gap-1">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">Push</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={notif.channels.sms}
                                onCheckedChange={(checked) => updateNotificationChannel(notif.id, 'sms', checked)}
                              />
                              <div className="flex items-center gap-1">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">SMS</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Paramètres de sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{setting.title}</h3>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="min-w-[200px]">
                      {setting.type === 'boolean' ? (
                        <Switch
                          checked={setting.value as boolean}
                          onCheckedChange={(checked) => {
                            setSecuritySettings(prev => prev.map(s => 
                              s.id === setting.id ? { ...s, value: checked } : s
                            ));
                            setHasChanges(true);
                          }}
                        />
                      ) : setting.type === 'select' ? (
                        <Select
                          value={setting.value as string}
                          onValueChange={(value) => {
                            setSecuritySettings(prev => prev.map(s => 
                              s.id === setting.id ? { ...s, value } : s
                            ));
                            setHasChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type={setting.type === 'password' && !showPasswords ? 'password' : 'text'}
                            value={setting.value as string}
                            onChange={(e) => {
                              setSecuritySettings(prev => prev.map(s => 
                                s.id === setting.id ? { ...s, value: e.target.value } : s
                              ));
                              setHasChanges(true);
                            }}
                            className="w-full"
                          />
                          {setting.type === 'password' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPasswords(!showPasswords)}
                            >
                              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Automatisation */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Intelligence Artificielle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Optimisation IA</h3>
                      <p className="text-sm text-muted-foreground">
                        Active les recommandations et optimisations automatiques
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.aiOptimization}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, aiOptimization: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Routage intelligent</h3>
                      <p className="text-sm text-muted-foreground">
                        Routage automatique des tickets selon la priorité
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.smartRouting}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, smartRouting: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Analytics prédictives</h3>
                      <p className="text-sm text-muted-foreground">
                        Prédictions de revenus et analyses de tendances
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.predictiveAnalytics}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, predictiveAnalytics: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Processus automatisés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Facturation automatique</h3>
                      <p className="text-sm text-muted-foreground">
                        Génération automatique des factures récurrentes
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoInvoicing}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, autoInvoicing: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Relances automatiques</h3>
                      <p className="text-sm text-muted-foreground">
                        Envoi automatique des relances de paiement
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoReminders}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, autoReminders: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Sauvegarde automatique</h3>
                      <p className="text-sm text-muted-foreground">
                        Sauvegarde quotidienne des données
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoBackup}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, autoBackup: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Rapports automatiques</h3>
                      <p className="text-sm text-muted-foreground">
                        Génération et envoi automatique des rapports
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoReports}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => ({ ...prev, autoReports: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Intégrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Paiements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stripe */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Stripe</h3>
                          <p className="text-sm text-muted-foreground">Processeur de paiements</p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.stripeEnabled}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({ ...prev, stripeEnabled: checked }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    
                    {integrationSettings.stripeEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <div>
                          <Label>Clé publique</Label>
                          <Input
                            value={integrationSettings.stripePublicKey}
                            onChange={(e) => {
                              setIntegrationSettings(prev => ({ ...prev, stripePublicKey: e.target.value }));
                              setHasChanges(true);
                            }}
                            placeholder="pk_..."
                          />
                        </div>
                        <div>
                          <Label>Clé secrète</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type={showPasswords ? 'text' : 'password'}
                              value={integrationSettings.stripeSecretKey}
                              onChange={(e) => {
                                setIntegrationSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }));
                                setHasChanges(true);
                              }}
                              placeholder="sk_..."
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPasswords(!showPasswords)}
                            >
                              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* PayPal */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">PayPal</h3>
                          <p className="text-sm text-muted-foreground">Paiements PayPal</p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.paypalEnabled}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({ ...prev, paypalEnabled: checked }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    
                    {integrationSettings.paypalEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <div>
                          <Label>Client ID</Label>
                          <Input
                            value={integrationSettings.paypalClientId}
                            onChange={(e) => {
                              setIntegrationSettings(prev => ({ ...prev, paypalClientId: e.target.value }));
                              setHasChanges(true);
                            }}
                            placeholder="Client ID PayPal"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API et Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>URL des Webhooks</Label>
                    <Input
                      value={integrationSettings.webhookUrl}
                      onChange={(e) => {
                        setIntegrationSettings(prev => ({ ...prev, webhookUrl: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="https://api.example.com/webhooks"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Limite de requêtes/heure</Label>
                      <Input
                        type="number"
                        value={integrationSettings.apiRateLimit}
                        onChange={(e) => {
                          setIntegrationSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Origines CORS autorisées</Label>
                      <Input
                        value={integrationSettings.corsOrigins}
                        onChange={(e) => {
                          setIntegrationSettings(prev => ({ ...prev, corsOrigins: e.target.value }));
                          setHasChanges(true);
                        }}
                        placeholder="https://app.example.com"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sauvegarde */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sauvegarde et Restauration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Database className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-medium mb-2">Dernière sauvegarde</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aujourd'hui à 03:00
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Réussie
                    </Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-medium mb-2">Taille des données</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      2.3 GB
                    </p>
                    <Badge variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      Normal
                    </Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <h3 className="font-medium mb-2">Rétention</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      30 jours
                    </p>
                    <Badge variant="outline">
                      <Timer className="h-3 w-3 mr-1" />
                      Automatique
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger sauvegarde
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Upload className="h-4 w-4" />
                    Restaurer sauvegarde
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sauvegarde manuelle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
