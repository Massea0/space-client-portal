// src/pages/admin/AdminReferenceQuotes.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/services/notificationManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ReferenceQuote {
  id: string;
  title: string;
  description: string;
  price_min: number;
  price_max: number;
  price_optimal: number;
  variation_min: number;
  variation_max: number;
  target_sector: string;
  complexity_level: string;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  recommended_terms: any;
  category?: {
    id: string;
    name: string;
  };
}

interface QuoteCategory {
  id: string;
  name: string;
  description: string;
}

const AdminReferenceQuotes: React.FC = () => {
  const [referenceQuotes, setReferenceQuotes] = useState<ReferenceQuote[]>([]);
  const [categories, setCategories] = useState<QuoteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<ReferenceQuote | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price_min: '',
    price_max: '',
    price_optimal: '',
    variation_min: '-15',
    variation_max: '10',
    target_sector: '',
    complexity_level: 'medium',
    recommended_terms: {
      paiement: '',
      garantie: '',
      delai: ''
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les catégories (avec gestion d'erreur si la table n'existe pas)
      let categoriesData = [];
      try {
        const { data, error: categoriesError } = await supabase
          .from('quote_categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.warn('Table quote_categories non trouvée, utilisation des catégories par défaut');
          // Catégories par défaut si la table n'existe pas
          categoriesData = [
            { id: '1', name: 'Services', description: 'Prestations de services générales' },
            { id: '2', name: 'Maintenance', description: 'Contrats de maintenance et support' },
            { id: '3', name: 'Consulting', description: 'Missions de conseil et expertise' },
            { id: '4', name: 'Development', description: 'Développement logiciel et applications' },
            { id: '5', name: 'Infrastructure', description: 'Infrastructure et hébergement' },
            { id: '6', name: 'Formation', description: 'Sessions de formation et accompagnement' }
          ];
        } else {
          categoriesData = data || [];
        }
      } catch (err) {
        console.warn('Erreur catégories, utilisation des valeurs par défaut:', err);
        categoriesData = [
          { id: '1', name: 'Services', description: 'Prestations de services générales' },
          { id: '2', name: 'Maintenance', description: 'Contrats de maintenance et support' },
          { id: '3', name: 'Consulting', description: 'Missions de conseil et expertise' }
        ];
      }
      
      setCategories(categoriesData);

      // Charger les modèles de référence (sans jointure pour éviter les erreurs)
      const { data: quotesData, error: quotesError } = await supabase
        .from('reference_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      setReferenceQuotes(quotesData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      notificationManager.error('Erreur', 'Impossible de charger les modèles de référence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      price_min: '',
      price_max: '',
      price_optimal: '',
      variation_min: '-15',
      variation_max: '10',
      target_sector: '',
      complexity_level: 'medium',
      recommended_terms: {
        paiement: '',
        garantie: '',
        delai: ''
      }
    });
    setEditingQuote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        price_min: parseFloat(formData.price_min),
        price_max: parseFloat(formData.price_max),
        price_optimal: parseFloat(formData.price_optimal),
        variation_min: parseFloat(formData.variation_min),
        variation_max: parseFloat(formData.variation_max),
        target_sector: formData.target_sector,
        complexity_level: formData.complexity_level,
        recommended_terms: formData.recommended_terms,
        is_active: true
      };

      // Validation
      if (dataToSubmit.price_optimal < dataToSubmit.price_min || 
          dataToSubmit.price_optimal > dataToSubmit.price_max) {
        notificationManager.error('Erreur', 'Le prix optimal doit être entre le prix min et max');
        return;
      }

      if (editingQuote) {
        // Mise à jour
        const { error } = await supabase
          .from('reference_quotes')
          .update(dataToSubmit)
          .eq('id', editingQuote.id);

        if (error) throw error;
        notificationManager.success('Succès', 'Modèle mis à jour avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('reference_quotes')
          .insert(dataToSubmit);

        if (error) throw error;
        notificationManager.success('Succès', 'Modèle créé avec succès');
      }

      setIsCreateModalOpen(false);
      resetForm();
      loadData();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notificationManager.error('Erreur', 'Erreur lors de la sauvegarde du modèle');
    }
  };

  const handleEdit = (quote: ReferenceQuote) => {
    setEditingQuote(quote);
    setFormData({
      title: quote.title,
      description: quote.description,
      category_id: quote.category?.id || '',
      price_min: quote.price_min.toString(),
      price_max: quote.price_max.toString(),
      price_optimal: quote.price_optimal.toString(),
      variation_min: quote.variation_min.toString(),
      variation_max: quote.variation_max.toString(),
      target_sector: quote.target_sector,
      complexity_level: quote.complexity_level,
      recommended_terms: quote.recommended_terms || {
        paiement: '',
        garantie: '',
        delai: ''
      }
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle de référence ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reference_quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      notificationManager.success('Succès', 'Modèle supprimé avec succès');
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notificationManager.error('Erreur', 'Erreur lors de la suppression du modèle');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('reference_quotes')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      notificationManager.success('Succès', `Modèle ${!isActive ? 'activé' : 'désactivé'} avec succès`);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      notificationManager.error('Erreur', 'Erreur lors de la mise à jour du statut');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modèles de Référence</h1>
          <p className="text-gray-600">Gérez les modèles de prix pour éviter la dérive tarifaire IA</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Modèle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuote ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
              </DialogTitle>
              <DialogDescription>
                {editingQuote ? 'Modifiez les informations du modèle de devis.' : 'Créez un nouveau modèle de devis réutilisable avec des items prédéfinis.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du modèle *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ex: Site Web Vitrine (5-10 pages)"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Description détaillée du type de prestation..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_min">Prix Minimum (FCFA) *</Label>
                  <Input
                    id="price_min"
                    type="number"
                    value={formData.price_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_min: e.target.value }))}
                    required
                    placeholder="800000"
                  />
                </div>

                <div>
                  <Label htmlFor="price_optimal">Prix Optimal (FCFA) *</Label>
                  <Input
                    id="price_optimal"
                    type="number"
                    value={formData.price_optimal}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_optimal: e.target.value }))}
                    required
                    placeholder="1200000"
                  />
                </div>

                <div>
                  <Label htmlFor="price_max">Prix Maximum (FCFA) *</Label>
                  <Input
                    id="price_max"
                    type="number"
                    value={formData.price_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_max: e.target.value }))}
                    required
                    placeholder="1500000"
                  />
                </div>
              </div>

              {/* Variations autorisées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variation_min">Variation Min (%) *</Label>
                  <Input
                    id="variation_min"
                    type="number"
                    step="0.1"
                    value={formData.variation_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, variation_min: e.target.value }))}
                    required
                    placeholder="-15"
                  />
                  <p className="text-xs text-gray-500 mt-1">Réduction maximale autorisée (ex: -15%)</p>
                </div>

                <div>
                  <Label htmlFor="variation_max">Variation Max (%) *</Label>
                  <Input
                    id="variation_max"
                    type="number"
                    step="0.1"
                    value={formData.variation_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, variation_max: e.target.value }))}
                    required
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Augmentation maximale autorisée (ex: +10%)</p>
                </div>
              </div>

              <Separator />

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_sector">Secteur Cible</Label>
                  <Input
                    id="target_sector"
                    value={formData.target_sector}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_sector: e.target.value }))}
                    placeholder="services, commerce, industrie..."
                  />
                </div>

                <div>
                  <Label htmlFor="complexity">Niveau de Complexité</Label>
                  <Select 
                    value={formData.complexity_level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, complexity_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="complex">Complexe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditions recommandées */}
              <div>
                <Label>Conditions Recommandées</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="paiement" className="text-sm">Paiement</Label>
                    <Input
                      id="paiement"
                      value={formData.recommended_terms.paiement}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recommended_terms: {
                          ...prev.recommended_terms,
                          paiement: e.target.value
                        }
                      }))}
                      placeholder="30% à la commande, 70% livraison"
                    />
                  </div>

                  <div>
                    <Label htmlFor="garantie" className="text-sm">Garantie</Label>
                    <Input
                      id="garantie"
                      value={formData.recommended_terms.garantie}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recommended_terms: {
                          ...prev.recommended_terms,
                          garantie: e.target.value
                        }
                      }))}
                      placeholder="6 mois maintenance incluse"
                    />
                  </div>

                  <div>
                    <Label htmlFor="delai" className="text-sm">Délai</Label>
                    <Input
                      id="delai"
                      value={formData.recommended_terms.delai}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recommended_terms: {
                          ...prev.recommended_terms,
                          delai: e.target.value
                        }
                      }))}
                      placeholder="30 jours ouvrés"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingQuote ? 'Mettre à jour' : 'Créer le modèle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modèles</p>
                <p className="text-2xl font-bold">{referenceQuotes.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modèles Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {referenceQuotes.filter(q => q.is_active).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisation Totale</p>
                <p className="text-2xl font-bold text-purple-600">
                  {referenceQuotes.reduce((sum, q) => sum + (q.usage_count || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux Succès Moyen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(referenceQuotes.reduce((sum, q) => sum + (q.success_rate || 0), 0) / (referenceQuotes.length || 1))}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des modèles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {referenceQuotes.map((quote) => (
          <Card key={quote.id} className={`${quote.is_active ? '' : 'opacity-60'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{quote.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {quote.category?.name || 'Sans catégorie'}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(quote)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(quote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Prix */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Fourchette de prix</div>
                  <div className="font-medium text-sm">
                    {formatCurrency(quote.price_min)} - {formatCurrency(quote.price_max)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Optimal: {formatCurrency(quote.price_optimal)}
                  </div>
                </div>

                {/* Variations */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Variation:</span>
                  <span className="font-medium">
                    {quote.variation_min}% / +{quote.variation_max}%
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getComplexityColor(quote.complexity_level)}>
                    {quote.complexity_level}
                  </Badge>
                  <Badge variant={quote.is_active ? "default" : "secondary"}>
                    {quote.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <div>Utilisations: {quote.usage_count || 0}</div>
                  </div>
                  <div>
                    <div className={getSuccessRateColor(quote.success_rate || 0)}>
                      Succès: {quote.success_rate || 0}%
                    </div>
                  </div>
                </div>

                {/* Secteur cible */}
                {quote.target_sector && (
                  <div className="text-xs text-gray-600">
                    Secteur: {quote.target_sector}
                  </div>
                )}

                {/* Action de basculement actif/inactif */}
                <Button
                  size="sm"
                  variant={quote.is_active ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => toggleActive(quote.id, quote.is_active)}
                >
                  {quote.is_active ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {referenceQuotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun modèle de référence
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier modèle pour contrôler les optimisations IA
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un modèle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReferenceQuotes;
