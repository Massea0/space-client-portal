// src/pages/FacturesNew.tsx - Création de nouvelles factures avec IA
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
  Download
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
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vatRate: number;
}

interface InvoiceData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const FacturesNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Données de la facture
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        vatRate: 20
      }
    ],
    subtotal: 0,
    vatAmount: 0,
    total: 0,
    notes: '',
    paymentTerms: '30 jours',
    status: 'draft'
  });

  // Mock data pour les clients
  const [clients] = useState([
    { id: '1', name: 'TechCorp Solutions', email: 'contact@techcorp.com', address: '123 Rue de la Tech, 75001 Paris' },
    { id: '2', name: 'Innovation Ltd', email: 'hello@innovation.com', address: '456 Avenue Innovation, 69000 Lyon' },
    { id: '3', name: 'Digital Partners', email: 'info@digitalpartners.fr', address: '789 Boulevard Digital, 13000 Marseille' }
  ]);

  // Suggestions IA pour les articles
  const [aiSuggestedItems] = useState([
    { description: 'Consultation stratégique', unitPrice: 850, vatRate: 20 },
    { description: 'Développement application web', unitPrice: 1200, vatRate: 20 },
    { description: 'Formation équipe', unitPrice: 450, vatRate: 20 },
    { description: 'Maintenance mensuelle', unitPrice: 300, vatRate: 20 },
    { description: 'Audit sécurité', unitPrice: 950, vatRate: 20 }
  ]);

  // Calcul automatique des totaux
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = invoiceData.items.reduce((sum, item) => sum + (item.total * item.vatRate / 100), 0);
    const total = subtotal + vatAmount;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      vatAmount,
      total
    }));
  }, [invoiceData.items]);

  // Initialisation avec paramètres URL
  useEffect(() => {
    const clientParam = searchParams.get('client');
    if (clientParam) {
      const client = clients.find(c => c.name.toLowerCase().includes(clientParam.toLowerCase()));
      if (client) {
        setInvoiceData(prev => ({
          ...prev,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientAddress: client.address
        }));
      }
    }
  }, [searchParams, clients]);

  // Fonction pour ajouter un article
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      vatRate: 20
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Fonction pour supprimer un article
  const removeItem = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Fonction pour mettre à jour un article
  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData(prev => ({
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
    setInvoiceData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address
    }));
  };

  // Fonction pour appliquer une suggestion IA
  const applySuggestion = (suggestion: any) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: suggestion.description,
      quantity: 1,
      unitPrice: suggestion.unitPrice,
      total: suggestion.unitPrice,
      vatRate: suggestion.vatRate
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Fonction pour sauvegarder
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Facture sauvegardée:', invoiceData);
      navigate('/factures');
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
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Facture envoyée:', invoiceData);
      navigate('/factures');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
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
              onClick={() => navigate('/factures')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Nouvelle Facture</h1>
              <p className="text-muted-foreground">
                Créez une facture professionnelle avec l'assistance IA
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
              disabled={loading || !invoiceData.clientId}
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
                      value={invoiceData.clientId}
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="email@client.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientAddress">Adresse</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Adresse complète du client"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Détails facture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détails de la Facture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">N° de Facture</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceData.date.toISOString().split('T')[0]}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Date d'échéance</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Articles
                  </div>
                  <Button
                    size="sm"
                    onClick={addItem}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Article {index + 1}</span>
                      {invoiceData.items.length > 1 && (
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description de l'article"
                        />
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

                {/* Totaux */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total:</span>
                    <span>{formatCurrency(invoiceData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA:</span>
                    <span>{formatCurrency(invoiceData.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoiceData.total)}</span>
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
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes supplémentaires pour le client"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                  <Select
                    value={invoiceData.paymentTerms}
                    onValueChange={(value) => setInvoiceData(prev => ({ ...prev, paymentTerms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immédiat">Paiement immédiat</SelectItem>
                      <SelectItem value="15 jours">15 jours</SelectItem>
                      <SelectItem value="30 jours">30 jours</SelectItem>
                      <SelectItem value="45 jours">45 jours</SelectItem>
                      <SelectItem value="60 jours">60 jours</SelectItem>
                    </SelectContent>
                  </Select>
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
                    checked={aiSuggestions}
                    onCheckedChange={setAiSuggestions}
                  />
                </CardTitle>
              </CardHeader>
              {aiSuggestions && (
                <CardContent className="space-y-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Suggestions</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Voici des articles populaires pour ce type de client:
                    </p>
                    <div className="space-y-2">
                      {aiSuggestedItems.slice(0, 3).map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div>
                            <p className="text-sm font-medium">{suggestion.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(suggestion.unitPrice)}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights IA */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Bon timing</p>
                        <p className="text-xs text-muted-foreground">
                          Ce client paie généralement en avance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Délai recommandé</p>
                        <p className="text-xs text-muted-foreground">
                          30 jours pour ce client
                        </p>
                      </div>
                    </div>
                  </div>
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
                  <span className="text-sm">Factures ce mois:</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">CA du mois:</span>
                  <span className="text-sm font-medium">{formatCurrency(45280)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Délai moyen:</span>
                  <span className="text-sm font-medium">24 jours</span>
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
                  Dupliquer facture précédente
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Importer depuis devis
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Zap className="h-4 w-4" />
                  Modèle rapide
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
                    <h2 className="text-xl font-bold">Aperçu de la Facture</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                      ×
                    </Button>
                  </div>
                  
                  {/* Contenu de l'aperçu */}
                  <div className="space-y-6 p-6 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">FACTURE</h1>
                      <p className="text-muted-foreground">{invoiceData.invoiceNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">De:</h3>
                        <p>{user?.companyName || 'Votre Entreprise'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">À:</h3>
                        <p>{invoiceData.clientName}</p>
                        <p className="text-sm text-muted-foreground">{invoiceData.clientAddress}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p><span className="font-medium">Date:</span> {formatDate(invoiceData.date)}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Échéance:</span> {formatDate(invoiceData.dueDate)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-right">Qté</th>
                            <th className="border p-2 text-right">Prix</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items.map((item) => (
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
                      <p>Sous-total: {formatCurrency(invoiceData.subtotal)}</p>
                      <p>TVA: {formatCurrency(invoiceData.vatAmount)}</p>
                      <p className="text-lg font-bold">Total: {formatCurrency(invoiceData.total)}</p>
                    </div>
                    
                    {invoiceData.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">Notes:</h3>
                        <p className="text-sm">{invoiceData.notes}</p>
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

export default FacturesNew;
