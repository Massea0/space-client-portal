// src/components/forms/FactureForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, PlusCircle } from 'lucide-react';
import { Company } from '@/types';
import { companiesApi } from '@/services/api';
import { formatDateForInput, cn, formatCurrency } from '@/lib/utils';

// Import des styles et composants partagés
import { formStyles as styles } from './FormStyles';
import { FormCard, FormSection, DeleteItemButton, AddItemButton } from './SharedFormComponents';

// Schéma et types
const invoiceItemSchema = z.object({
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

export const factureFormSchema = z.object({
    companyId: z.string().min(1, "Le client est requis."),
    issueDate: z.date({
        required_error: "La date d'émission est requise.",
        invalid_type_error: "Format de date invalide.",
    }),
    dueDate: z.date({
        required_error: "La date d'échéance est requise.",
        invalid_type_error: "Format de date invalide.",
    }),
    notes: z.string().optional(),
    items: z.array(invoiceItemSchema)
        .min(1, "Au moins un article est requis dans la facture.")
        .max(50, "Le nombre maximum d'articles est de 50."),
});

export type FactureFormValues = z.infer<typeof factureFormSchema>;

export interface FactureFormSubmitData extends Omit<FactureFormValues, 'issueDate' | 'dueDate' | 'items'> {
    issueDate: string;
    dueDate: string;
    items: Array<Omit<z.infer<typeof invoiceItemSchema>, 'id'>>;
}

// --- NumberInputController défini comme un composant autonome ---
interface NumberInputControllerProps {
    name: `items.${number}.quantity` | `items.${number}.unitPrice`;
    control: Control<FactureFormValues>;
    placeholder: string;
    isUnitPrice?: boolean;
}

const NumberInputController: React.FC<NumberInputControllerProps> = ({
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
            render={({ field }) => (
                <Input
                    id={name}
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    value={isFocused && (field.value === 0 || (field.value === 1 && name.endsWith('quantity') && !isUnitPrice && placeholder === "1")) ? '' : (field.value ?? '').toString()}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => {
                        const valStr = e.target.value;
                        let numValue: number | undefined;
                        if (valStr === '' || valStr === '-') {
                            numValue = undefined;
                        } else {
                            const sanitizedValStr = valStr.replace(',', '.');
                            const parsed = parseFloat(sanitizedValStr);
                            if (!isNaN(parsed)) {
                                numValue = parsed;
                            } else {
                                numValue = undefined;
                            }
                        }
                        field.onChange(numValue);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        if (field.value === undefined || field.value === null || isNaN(Number(field.value))) {
                            const defaultValue = isUnitPrice ? 0 : 1;
                            field.onChange(defaultValue);
                        }
                    }}
                    min={isUnitPrice ? "0" : "0.01"}
                    step="any"
                />
            )}
        />
    );
};
// --- Fin de NumberInputController ---


interface FactureFormProps {
    onSubmit: (data: FactureFormSubmitData) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Partial<FactureFormValues>;
}

const FactureForm: React.FC<FactureFormProps> = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    const today = new Date();
    const defaultDueDate = new Date(today);
    defaultDueDate.setDate(today.getDate() + 30);

    const { control, handleSubmit, register, watch, setValue, formState: { errors } } = useForm<FactureFormValues>({
        resolver: zodResolver(factureFormSchema),
        defaultValues: initialData || {
            companyId: '',
            issueDate: today,
            dueDate: defaultDueDate,
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

    // Fonction pour calculer le total de la facture
    const calculateTotal = (items: typeof watchedItems) => {
        return items.reduce((sum, item) => sum + (item.total || 0), 0);
    };

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

    const processSubmit = (data: FactureFormValues) => {
        const submitData: FactureFormSubmitData = {
            ...data,
            issueDate: data.issueDate.toISOString().split('T')[0],
            dueDate: data.dueDate.toISOString().split('T')[0],
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
        <form onSubmit={handleSubmit(processSubmit)} className={styles.wrapper}>
            <FormCard
                title="Informations Générales de la Facture"
                description="Renseignez les informations de base de la facture"
            >
                <FormSection>
                    <div className={styles.inputGroup}>
                        <Label htmlFor="companyId" className={styles.label}>Client</Label>
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

                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <Label htmlFor="issueDate" className={styles.label}>Date d'émission</Label>
                            <Controller
                                name="issueDate"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        id="issueDate"
                                        value={field.value ? formatDateForInput(field.value) : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                )}
                            />
                            {errors.issueDate && <p className="text-sm text-red-600 mt-1">{errors.issueDate.message}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <Label htmlFor="dueDate" className={styles.label}>Date d'échéance</Label>
                            <Controller
                                name="dueDate"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        id="dueDate"
                                        value={field.value ? formatDateForInput(field.value) : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                )}
                            />
                            {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <Label htmlFor="notes" className={styles.label}>Notes (optionnel)</Label>
                        <Textarea id="notes" {...register("notes")} placeholder="Termes de paiement, informations bancaires..." rows={3} />
                    </div>
                </FormSection>
            </FormCard>

            <FormCard
                title="Articles de la Facture"
                description="Ajoutez les articles à inclure dans la facture"
            >
                <div className="flex justify-end mb-4">
                    <AddItemButton onClick={handleAddItem} />
                </div>

                <div className="space-y-4">
                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucun article ajouté.</p>
                    )}
                    {fields.map((fieldItem, index) => (
                        <div key={fieldItem.id} className={styles.item}>
                            <DeleteItemButton onClick={() => remove(index)} />
                            <div className="mb-2">
                                <Label htmlFor={`items.${index}.description`} className={styles.label}>Description de l'article #{index + 1}</Label>
                                <Input id={`items.${index}.description`} {...register(`items.${index}.description`)} placeholder="Description de l'article ou service" />
                                {errors.items?.[index]?.description && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.description?.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className={styles.inputGroup}>
                                    <Label htmlFor={`items.${index}.quantity`} className={styles.label}>Quantité</Label>
                                    <NumberInputController
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        placeholder="1"
                                    />
                                    {errors.items?.[index]?.quantity && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.quantity?.message}</p>}
                                </div>
                                <div className={styles.inputGroup}>
                                    <Label htmlFor={`items.${index}.unitPrice`} className={styles.label}>Prix Unitaire (FCFA)</Label>
                                    <NumberInputController
                                        name={`items.${index}.unitPrice`}
                                        control={control}
                                        placeholder="0.00"
                                        isUnitPrice={true}
                                    />
                                    {errors.items?.[index]?.unitPrice && <p className="text-sm text-red-600 mt-1">{errors.items?.[index]?.unitPrice?.message}</p>}
                                </div>
                                <div className="self-end">
                                    <Label className={styles.label}>Total Article (FCFA)</Label>
                                    <Input
                                        type="text"
                                        value={formatCurrency(watchedItems[index]?.total || 0)}
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
                </div>
            </FormCard>

            {/* Section Totaux */}
            <div className={styles.totalsSection}>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Total de la Facture</span>
                    <span className="text-xl font-semibold text-primary">
                        {formatCurrency(calculateTotal(watchedItems))}
                    </span>
                </div>
            </div>

            <div className={styles.buttonsWrapper}>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Enregistrer la Facture'}
                </Button>
            </div>
        </form>
    );
};

export default FactureForm;