// src/pages/DevisNew.tsx - Création de nouveaux devis avec IA
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Send,
  Calculator,
  Brain,
  Plus,
  Trash2,
  Search,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Copy,
  Download,
  Target,
  TrendingUp
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
import { Slider } from '@/components/ui/slider';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
  margin: number;
}

interface QuoteData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  quoteNumber: string;
  date: Date;
  validityDate: Date;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
  terms: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  aiOptimization: boolean;
}

const DevisNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [globalMargin, setGlobalMargin] = useState([20]);

  // Données du devis
  const [quoteData, setQuoteData] = useState<QuoteData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    quoteNumber: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    date: new Date(),
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        category: 'consulting',
        margin: 20
      }
    ],
    subtotal: 0,
    discount: 0,
    total: 0,
    notes: '',
    terms: 'Devis valable 30 jours',
    status: 'draft',
    aiOptimization: true
  });

  // Mock data pour les clients
  const [clients] = useState([
    { id: '1', name: 'TechCorp Solutions', email: 'contact@techcorp.com', address: '123 Rue de la Tech, 75001 Paris', segment: 'enterprise' },
    { id: '2', name: 'Innovation Ltd', email: 'hello@innovation.com', address: '456 Avenue Innovation, 69000 Lyon', segment: 'startup' },
    { id: '3', name: 'Digital Partners', email: 'info@digitalpartners.fr', address: '789 Boulevard Digital, 13000 Marseille', segment: 'sme' }
  ]);

  // Suggestions IA pour les services
  const [aiSuggestedServices] = useState([
    { description: 'Audit stratégique complet', unitPrice: 2500, category: 'consulting', margin: 25, popularity: 95 },
    { description: 'Développement MVP', unitPrice: 8500, category: 'development', margin: 30, popularity: 88 },
    { description: 'Formation équipe agile', unitPrice: 1800, category: 'training', margin: 35, popularity: 72 },
    { description: 'Accompagnement transformation digitale', unitPrice: 5200, category: 'consulting', margin: 22, popularity: 85 },
    { description: 'Maintenance évolutive 6 mois', unitPrice: 1200, category: 'maintenance', margin: 40, popularity: 67 }
  ]);

  // Insights IA basés sur le client
  const getClientInsights = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return [];

    const insights = {
      enterprise: [
        { type: 'success', message: 'Budget confortable, privilégier la qualité', icon: CheckCircle },
        { type: 'info', message: 'Processus de validation long (45j)', icon: Clock },
        { type: 'opportunity', message: 'Potentiel contrat annuel (+200%)', icon: TrendingUp }
      ],
      startup: [
        { type: 'warning', message: 'Budget serré, optimiser les coûts', icon: AlertTriangle },
        { type: 'success', message: 'Décision rapide (7j)', icon: Zap },
        { type: 'opportunity', message: 'Croissance rapide prévue', icon: Target }
      ],
      sme: [
        { type: 'info', message: 'Équilibre coût/qualité recherché', icon: CheckCircle },
        { type: 'success', message: 'Partenariat long terme possible', icon: TrendingUp },
        { type: 'warning', message: 'Négociation sur les délais', icon: Clock }
      ]
    };

    return insights[client.segment as keyof typeof insights] || [];
  };

  // Calcul automatique des totaux
  useEffect(() => {
    const subtotal = quoteData.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - (subtotal * quoteData.discount / 100);

    setQuoteData(prev => ({
      ...prev,
      subtotal,
      total
    }));
  }, [quoteData.items, quoteData.discount]);

  // Initialisation avec paramètres URL
  useEffect(() => {
    const clientParam = searchParams.get('client');
    const aiParam = searchParams.get('ai');
    const prospectsParam = searchParams.get('prospects');

    if (clientParam) {
      const client = clients.find(c => c.name.toLowerCase().includes(clientParam.toLowerCase()));
      if (client) {
        setQuoteData(prev => ({
          ...prev,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientAddress: client.address
        }));
      }
    }

    if (aiParam === 'true') {
      setAiEnabled(true);
      // Auto-ajouter des suggestions IA
      setTimeout(() => {
        aiSuggestedServices.slice(0, 2).forEach(suggestion => {
          applySuggestion(suggestion);
        });
      }, 1000);
    }

    if (prospectsParam === 'hot') {
      // Pré-remplir avec les services les plus populaires
      const hotServices = aiSuggestedServices
        .filter(s => s.popularity > 80)
        .slice(0, 2);
      
      setTimeout(() => {
        hotServices.forEach(service => applySuggestion(service));
      }, 500);
    }
  }, [searchParams, clients, aiSuggestedServices]);

  // Fonction pour ajouter un service
  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      category: 'consulting',
      margin: globalMargin[0]
    };
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Fonction pour supprimer un service
  const removeItem = (itemId: string) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Fonction pour mettre à jour un service
  const updateItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalcul du total pour cet article
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Fonction pour sélectionner un client
  const selectClient = (client: any) => {
    setQuoteData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address
    }));
  };

  // Fonction pour appliquer une suggestion IA
  const applySuggestion = (suggestion: any) => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: suggestion.description,
      quantity: 1,
      unitPrice: suggestion.unitPrice,
      total: suggestion.unitPrice,
      category: suggestion.category,
      margin: suggestion.margin
    };
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Optimisation IA des prix
  const optimizePricing = () => {
    if (!quoteData.clientId) return;

    const client = clients.find(c => c.id === quoteData.clientId);
    if (!client) return;

    // Simulation d'optimisation basée sur le segment client
    const optimizationFactors = {
      enterprise: 1.15, // Prix plus élevés pour les grandes entreprises
      startup: 0.85,   // Prix réduits pour les startups
      sme: 1.0         // Prix standards pour les PME
    };

    const factor = optimizationFactors[client.segment as keyof typeof optimizationFactors] || 1.0;

    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * factor),
        total: Math.round(item.quantity * item.unitPrice * factor)
      }))
    }));
  };

  // Fonction pour sauvegarder
  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Devis sauvegardé:', quoteData);
      navigate('/devis');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour envoyer
  const handleSend = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Devis envoyé:', quoteData);
      navigate('/devis');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientInsights = quoteData.clientId ? getClientInsights(quoteData.clientId) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/devis')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Nouveau Devis</h1>
              <p className="text-muted-foreground">
                Créez un devis personnalisé avec l'intelligence artificielle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Aperçu
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !quoteData.clientId}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Envoyer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientSelect">Client</Label>
                    <Select
                      value={quoteData.clientId}
                      onValueChange={(value) => {
                        const client = clients.find(c => c.id === value);
                        if (client) selectClient(client);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {client.segment}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      value={quoteData.clientEmail}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="email@client.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientAddress">Adresse</Label>
                  <Textarea
                    id="clientAddress"
                    value={quoteData.clientAddress}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Adresse complète du client"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Détails devis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détails du Devis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quoteNumber">N° de Devis</Label>
                    <Input
                      id="quoteNumber"
                      value={quoteData.quoteNumber}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={quoteData.date.toISOString().split('T')[0]}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityDate">Validité</Label>
                    <Input
                      id="validityDate"
                      type="date"
                      value={quoteData.validityDate.toISOString().split('T')[0]}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, validityDate: new Date(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Services
                  </div>
                  <div className="flex items-center gap-2">
                    {aiEnabled && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={optimizePricing}
                        className="gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Optimiser IA
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={addItem}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contrôle de marge globale */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Marge globale</Label>
                    <span className="text-sm font-medium">{globalMargin[0]}%</span>
                  </div>
                  <Slider
                    value={globalMargin}
                    onValueChange={(value) => {
                      setGlobalMargin(value);
                      // Appliquer à tous les nouveaux items
                      setQuoteData(prev => ({
                        ...prev,
                        items: prev.items.map(item => ({ ...item, margin: value[0] }))
                      }));
                    }}
                    min={5}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {quoteData.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service {index + 1}</span>
                      {quoteData.items.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description du service"
                        />
                      </div>
                      <div>
                        <Label>Catégorie</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateItem(item.id, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consulting">Conseil</SelectItem>
                            <SelectItem value="development">Développement</SelectItem>
                            <SelectItem value="training">Formation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Prix unitaire</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <Input
                          value={formatCurrency(item.total)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Remise et Totaux */}
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="discount" className="min-w-0">Remise (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={quoteData.discount}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total:</span>
                      <span>{formatCurrency(quoteData.subtotal)}</span>
                    </div>
                    {quoteData.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Remise ({quoteData.discount}%):</span>
                        <span>-{formatCurrency(quoteData.subtotal * quoteData.discount / 100)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(quoteData.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes et Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes supplémentaires pour le client"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Conditions</Label>
                  <Textarea
                    id="terms"
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Conditions générales du devis"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Assistance IA */}
          <div className="space-y-6">
            {/* Assistant IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Assistant IA
                  <Switch
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                  />
                </CardTitle>
              </CardHeader>
              {aiEnabled && (
                <CardContent className="space-y-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Services populaires</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Basé sur votre historique et ce type de client:
                    </p>
                    <div className="space-y-2">
                      {aiSuggestedServices.slice(0, 3).map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{suggestion.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(suggestion.unitPrice)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.popularity}% succès
                              </Badge>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights client */}
                  {clientInsights.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Insights Client</p>
                      {clientInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg",
                            insight.type === 'success' && "bg-green-50 dark:bg-green-900/20",
                            insight.type === 'warning' && "bg-yellow-50 dark:bg-yellow-900/20",
                            insight.type === 'info' && "bg-blue-50 dark:bg-blue-900/20",
                            insight.type === 'opportunity' && "bg-purple-50 dark:bg-purple-900/20"
                          )}
                        >
                          <insight.icon className={cn(
                            "h-4 w-4",
                            insight.type === 'success' && "text-green-600 dark:text-green-400",
                            insight.type === 'warning' && "text-yellow-600 dark:text-yellow-400",
                            insight.type === 'info' && "text-blue-600 dark:text-blue-400",
                            insight.type === 'opportunity' && "text-purple-600 dark:text-purple-400"
                          )} />
                          <p className="text-sm">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Devis ce mois:</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taux conversion:</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Valeur moyenne:</span>
                  <span className="text-sm font-medium">{formatCurrency(12450)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Délai validation:</span>
                  <span className="text-sm font-medium">18 jours</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Copy className="h-4 w-4" />
                  Dupliquer devis précédent
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Charger modèle
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculateur ROI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Aperçu modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Aperçu du Devis</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                      ×
                    </Button>
                  </div>
                  
                  {/* Contenu de l'aperçu */}
                  <div className="space-y-6 p-6 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">DEVIS</h1>
                      <p className="text-muted-foreground">{quoteData.quoteNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">De:</h3>
                        <p>{user?.companyName || 'Votre Entreprise'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">À:</h3>
                        <p>{quoteData.clientName}</p>
                        <p className="text-sm text-muted-foreground">{quoteData.clientAddress}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p><span className="font-medium">Date:</span> {formatDate(quoteData.date)}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Validité:</span> {formatDate(quoteData.validityDate)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Service</th>
                            <th className="border p-2 text-right">Qté</th>
                            <th className="border p-2 text-right">Prix</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteData.items.map((item) => (
                            <tr key={item.id}>
                              <td className="border p-2">{item.description}</td>
                              <td className="border p-2 text-right">{item.quantity}</td>
                              <td className="border p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="border p-2 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p>Sous-total: {formatCurrency(quoteData.subtotal)}</p>
                      {quoteData.discount > 0 && (
                        <p className="text-green-600">Remise ({quoteData.discount}%): -{formatCurrency(quoteData.subtotal * quoteData.discount / 100)}</p>
                      )}
                      <p className="text-lg font-bold">Total: {formatCurrency(quoteData.total)}</p>
                    </div>
                    
                    {quoteData.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">Notes:</h3>
                        <p className="text-sm">{quoteData.notes}</p>
                      </div>
                    )}
                    
                    {quoteData.terms && (
                      <div>
                        <h3 className="font-semibold mb-2">Conditions:</h3>
                        <p className="text-sm">{quoteData.terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DevisNew;
