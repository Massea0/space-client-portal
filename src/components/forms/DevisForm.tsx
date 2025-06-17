// src/components/forms/DevisForm.tsx
import React, { useState, useEffect } from 'react'; // Ajouter useEffect
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { MOCK_COMPANIES } from '@/data/mockData'; // Supprimer l'import des mocks
import { companiesApi } from '@/services/api'; // Importer companiesApi
import { DevisItem, Company } from '@/types'; // Importer Company
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast'; // Importer useToast

interface DevisFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DevisForm = ({ onSubmit, onCancel, isLoading }: DevisFormProps) => {
  const { toast } = useToast(); // Initialiser useToast
  const [formData, setFormData] = useState({
    companyId: '',
    object: '',
    validUntil: '',
    notes: ''
  });

  const [items, setItems] = useState<DevisItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [companies, setCompanies] = useState<Company[]>([]); // État pour les entreprises

  // Charger les entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const fetchedCompanies = await companiesApi.getAll();
        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Failed to fetch companies", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des entreprises.",
          variant: "error",
        });
      }
    };
    fetchCompanies();
  }, [toast]);

  const addItem = () => {
    const newItem: DevisItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Omit<DevisItem, 'id'>, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCompany = companies.find(c => c.id === formData.companyId); // Utiliser l'état 'companies'
    if (!selectedCompany) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner une entreprise cliente.",
        variant: "error",
      });
      return;
    }

    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30); // Default 30 days validity

    onSubmit({
      companyId: formData.companyId,
      // companyName: selectedCompany.name, // companyName sera géré par l'API via jointure
      object: formData.object,
      amount: totalAmount,
      status: 'draft', // Statut par défaut pour un nouveau devis
      validUntil: formData.validUntil ? new Date(formData.validUntil) : validDate,
      items: items.filter(item => item.description.trim() !== '').map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        // total est calculé, pas besoin de le passer ici si l'API le recalcule ou le prend de 'amount'
      })),
      notes: formData.notes
    });
  };

  return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Créer un nouveau devis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Entreprise cliente *</label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => ( // Utiliser l'état 'companies'
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valide jusqu'au</label>
                <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objet du devis *</label>
              <Input
                  placeholder="Ex: Développement site web e-commerce"
                  value={formData.object}
                  onChange={(e) => setFormData({...formData, object: e.target.value})}
                  required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Prestations</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                            placeholder="Description de la prestation"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                            type="number"
                            placeholder="Qté"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                            type="number"
                            placeholder="Prix unitaire"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                            value={item.total.toLocaleString() + ' FCFA'}
                            readOnly // Rendre le champ total en lecture seule
                            className="bg-slate-50"
                        />
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                    </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                <span className="text-lg font-bold">
                  Total: {totalAmount.toLocaleString()} FCFA
                </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
              <Textarea
                  placeholder="Notes additionnelles..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                  type="submit"
                  disabled={!formData.companyId || !formData.object || items.length === 0 || items.every(it => !it.description.trim()) || isLoading}
              >
                {isLoading ? 'Création...' : 'Créer le devis'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
};

export default DevisForm;