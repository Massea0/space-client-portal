// src/components/forms/DevisForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, PlusCircle } from 'lucide-react';
import { Company, Devis as DevisType } from '@/types';
import { companiesApi } from '@/services/api';
import { formatDateForInput, cn } from '@/lib/utils';

// Schéma pour un article de devis
const devisItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La description de l'article est requise."),
  quantity: z.preprocess(
      (val) => (val === "" || val === null || val === undefined || Number.isNaN(Number(val)) ? undefined : Number(val)),
      z.number({ invalid_type_error: "La quantité doit être un nombre." })
          .min(0.01, "La quantité doit être au moins 0.01.")
          .positive("La quantité doit être positive.")
  ),
  unitPrice: z.preprocess(
      (val) => (val === "" || val === null || val === undefined || Number.isNaN(Number(val)) ? undefined : Number(val)),
      z.number({ invalid_type_error: "Le prix unitaire doit être un nombre." })
          .min(0, "Le prix unitaire ne peut être négatif.")
  ),
  total: z.number(),
});

export const devisFormSchema = z.object({
  companyId: z.string().min(1, "Le client est requis."),
  object: z.string().min(3, "L'objet du devis est requis (min. 3 caractères).").max(200, "L'objet ne peut dépasser 200 caractères."),
  validUntil: z.date({
    required_error: "La date de validité est requise.",
    invalid_type_error: "Format de date invalide.",
  }),
  notes: z.string().optional(),
  items: z.array(devisItemSchema)
      .min(1, "Au moins un article est requis dans le devis.")
      .max(50, "Le nombre maximum d'articles est de 50."),
});

export type DevisFormValues = z.infer<typeof devisFormSchema>;

export interface DevisFormSubmitData extends Omit<DevisFormValues, 'validUntil' | 'items'> {
  validUntil: string;
  items: Array<Omit<z.infer<typeof devisItemSchema>, 'id'>>;
  // status?: DevisType['status']; // Retiré
}

// --- NumberInputController ---
interface NumberInputControllerProps {
  name: `items.${number}.quantity` | `items.${number}.unitPrice`;
  control: Control<DevisFormValues>;
  placeholder: string;
  isUnitPrice?: boolean;
}

const NumberInputController = React.memo<NumberInputControllerProps>(({
                                                                        name,
                                                                        control,
                                                                        placeholder,
                                                                        isUnitPrice = false,
                                                                      }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
      <Controller
          name={name}
          control={control}
          render={({ field }) => {
            let displayValue = (field.value ?? '').toString();
            if (isFocused) {
              if (isUnitPrice && field.value === 0 && placeholder === "0.00") {
                displayValue = '';
              } else if (!isUnitPrice && field.value === 1 && placeholder === "1") {
                displayValue = '';
              } else if (field.value === 0) {
                displayValue = '';
              }
            }

            return (
                <Input
                    id={name}
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    value={displayValue}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      let numValue: number | undefined;
                      if (valStr === '' || valStr === '-') {
                        numValue = undefined;
                      } else {
                        const sanitizedValStr = valStr.replace(',', '.');
                        const parsed = parseFloat(sanitizedValStr);
                        numValue = isNaN(parsed) ? undefined : parsed;
                      }
                      field.onChange(numValue);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                      let finalValue = field.value;
                      if (finalValue === undefined || finalValue === null || isNaN(Number(finalValue))) {
                        finalValue = isUnitPrice ? 0 : 1;
                      }
                      field.onChange(finalValue);
                    }}
                    min={isUnitPrice ? "0" : "0.01"}
                    step="any"
                />
            );
          }}
      />
  );
});
NumberInputController.displayName = 'NumberInputController';


// --- DevisForm ---
interface DevisFormProps {
  onSubmit: (data: DevisFormSubmitData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: Partial<Omit<DevisFormValues, 'number'>>;
}

const DevisForm: React.FC<DevisFormProps> = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const today = new Date();
  const defaultValidUntil = new Date(today);
  defaultValidUntil.setDate(today.getDate() + 30);

  const { control, handleSubmit, register, watch, setValue, formState: { errors } } = useForm<DevisFormValues>({
    resolver: zodResolver(devisFormSchema),
    defaultValues: initialData || {
      companyId: '',
      object: '',
      validUntil: defaultValidUntil,
      notes: '',
      items: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const data = await companiesApi.getAll();
        setCompanies(data);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const watchedItems = watch("items");

  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const newTotal = parseFloat((quantity * unitPrice).toFixed(2));
      if (item.total !== newTotal) {
        setValue(`items.${index}.total`, newTotal, { shouldValidate: false, shouldDirty: true });
      }
    });
  }, [watchedItems, setValue]);

  const handleAddItem = () => {
    append({ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 });
  };

  const processSubmit = (data: DevisFormValues) => {
    const submitData: DevisFormSubmitData = {
      companyId: data.companyId,
      object: data.object,
      notes: data.notes,
      validUntil: data.validUntil.toISOString().split('T')[0],
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };
    onSubmit(submitData);
  };

  return (
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 p-1">
        {/* Card Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales du Devis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyId">Client</Label>
              <Controller
                  name="companyId"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={loadingCompanies}>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCompanies ? "Chargement des clients..." : "Sélectionnez un client"} />
                        </SelectTrigger>
                        <SelectContent>
                          {!loadingCompanies && companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  )}
              />
              {errors.companyId && <p className="text-sm text-red-600 mt-1">{errors.companyId.message}</p>}
            </div>
            <div>
              <Label htmlFor="object">Objet du Devis</Label>
              <Input id="object" {...register("object")} placeholder="Ex: Création de site web, Maintenance applicative" />
              {errors.object && <p className="text-sm text-red-600 mt-1">{errors.object.message}</p>}
            </div>
            <div>
              <Label htmlFor="validUntil">Valide jusqu'au</Label>
              <Controller
                  name="validUntil"
                  control={control}
                  render={({ field }) => (
                      <Input
                          type="date"
                          id="validUntil"
                          value={field.value ? formatDateForInput(field.value) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                  )}
              />
              {errors.validUntil && <p className="text-sm text-red-600 mt-1">{errors.validUntil.message}</p>}
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Conditions particulières, informations additionnelles..." rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Card Articles du Devis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Articles du Devis</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Ajouter un article
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Aucun article ajouté.</p>
            )}
            {fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="p-4 border rounded-lg space-y-3 relative bg-card/50 dark:bg-muted/20">
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7"
                      onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="mb-2">
                    <Label htmlFor={`items.${index}.description`}>Description de l'article #{index + 1}</Label>
                    <Input id={`items.${index}.description`} {...register(`items.${index}.description`)} placeholder="Description de l'article ou service" />
                    {errors.items?.[index]?.description && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.description?.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`items.${index}.quantity`}>Quantité</Label>
                      <NumberInputController
                          name={`items.${index}.quantity`}
                          control={control}
                          placeholder="1"
                      />
                      {errors.items?.[index]?.quantity && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.quantity?.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`items.${index}.unitPrice`}>Prix Unitaire (€)</Label>
                      <NumberInputController
                          name={`items.${index}.unitPrice`}
                          control={control}
                          placeholder="0.00"
                          isUnitPrice={true}
                      />
                      {errors.items?.[index]?.unitPrice && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.unitPrice?.message}</p>}
                    </div>
                    <div className="self-end">
                      <Label>Total Article (€)</Label>
                      <Input
                          type="text"
                          value={watchedItems[index]?.total?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                          readOnly
                          disabled
                          className={cn(
                              "font-medium",
                              "bg-muted/50 text-muted-foreground border-border/50 cursor-not-allowed",
                              "dark:bg-muted/30 dark:text-muted-foreground/80 dark:border-border/30"
                          )}
                      />
                    </div>
                  </div>
                </div>
            ))}
            {errors.items && typeof errors.items.message === 'string' && (
                <p className="text-sm text-red-600 mt-1">{errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer le Devis'}
          </Button>
        </div>
      </form>
  );
};
export default DevisForm;