// src/components/admin/companies/CompanyForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Assurez-vous que Label est importé
import { Company } from '@/types';

// NOUVEAU: Import des styles et composants partagés
import { formStyles as styles } from '@/components/forms/FormStyles';
import { FormCard, FormSection } from '@/components/forms/SharedFormComponents';

interface CompanyFormProps {
    company?: Company | null;
    onSave: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
            });
        } else {
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
    }, [company]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const isFormValid = formData.name.trim() && formData.email.trim();

    return (
        <FormCard
            title={company ? "Modifier l'entreprise" : "Ajouter une nouvelle entreprise"}
            description="Renseignez les informations de l'entreprise."
        >
            <FormSection>
                <div className={styles.inputGroup}>
                    <Label htmlFor="name" className={styles.label}>
                        Nom de l'entreprise *
                    </Label>
                    <Input
                        id="name"
                        placeholder="Ex: ACME Corporation"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Label htmlFor="email" className={styles.label}>
                        Email de contact *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="contact@entreprise.com"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Label htmlFor="phone" className={styles.label}>
                        Téléphone
                    </Label>
                    <Input
                        id="phone"
                        placeholder="+221 XX XXX XX XX"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Label htmlFor="address" className={styles.label}>
                        Adresse
                    </Label>
                    <Input
                        id="address"
                        placeholder="Adresse complète"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>
            </FormSection>
            <div className={styles.buttonsWrapper}>
                <Button variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
            </div>
        </FormCard>
    );
};

export default CompanyForm;