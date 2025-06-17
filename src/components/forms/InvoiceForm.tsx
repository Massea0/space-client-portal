// src/components/forms/InvoiceForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Bien que non utilisé pour les factures, gardons-le pour la similarité
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companiesApi } from '@/services/api';
import { InvoiceItem, Company } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface InvoiceFormProps {
    onSubmit: (data: any) => void; // Le type 'any' sera affiné
    onCancel: () => void;
    isLoading?: boolean;
}

const InvoiceForm = ({ onSubmit, onCancel, isLoading }: InvoiceFormProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        companyId: '',
        dueDate: '',
        // notes: '' // Les factures n'ont pas de champ 'notes' dans le schéma actuel
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const fetchedCompanies = await companiesApi.getAll();
                setCompanies(fetchedCompanies);
            } catch (error) {
                console.error("Failed to fetch companies for InvoiceForm", error);
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
        const newItem: InvoiceItem = {
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

    const updateItem = (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
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

        if (!formData.companyId) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez sélectionner une entreprise cliente.",
                variant: "error",
            });
            return;
        }
        if (!formData.dueDate) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez sélectionner une date d'échéance.",
                variant: "error",
            });
            return;
        }
        if (items.length === 0 || items.every(it => !it.description.trim())) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez ajouter au moins une prestation avec une description.",
                variant: "error",
            });
            return;
        }


        onSubmit({
            companyId: formData.companyId,
            amount: totalAmount,
            status: 'pending', // Statut par défaut pour une nouvelle facture
            dueDate: new Date(formData.dueDate),
            items: items.filter(item => item.description.trim() !== '').map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
            })),
            // notes: formData.notes // Pas de notes pour les factures
        });
    };

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Créer une nouvelle facture</CardTitle>
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
                                    {companies.map(company => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Date d'échéance *</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Éléments de la facture</h3>
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
                                            placeholder="Description de l'élément"
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
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            value={item.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }).replace('XOF', 'FCFA')}
                                            readOnly
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
                  Total: {totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }).replace('XOF', 'FCFA')}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pas de champ notes pour les factures dans le schéma actuel
          <div>
            <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
            <Textarea
              placeholder="Notes additionnelles..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>
          */}

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formData.companyId || !formData.dueDate || items.length === 0 || items.every(it => !it.description.trim()) || isLoading}
                        >
                            {isLoading ? 'Création...' : 'Créer la facture'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default InvoiceForm;