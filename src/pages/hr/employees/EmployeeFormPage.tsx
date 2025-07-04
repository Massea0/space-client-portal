// src/pages/hr/employees/EmployeeFormPage.tsx
// Page de formulaire pour créer ou éditer un employé

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployee, useCreateEmployee } from '@/hooks/hr/useEmployee';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X, User, Building, CreditCard, Settings, Mail } from 'lucide-react';
import type { EmployeeCreateInput, EmployeeUpdateInput, Employee } from '@/types/hr';

export const EmployeeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  const { employee, loading, error, updateEmployee } = useEmployee({ id });
  const { createEmployee, isCreating, error: createError } = useCreateEmployee();
  
  const [formData, setFormData] = useState<EmployeeCreateInput & {
    // Informations personnelles étendues
    personal_email: string;
    personal_phone: string;
    date_of_birth: string;
    nationality: string;
    gender: 'M' | 'F' | 'Other' | 'Prefer_not_to_say' | '';
    
    // Contact d'urgence
    emergency_contact: {
      name: string;
      relationship: string;
      phone: string;
      email: string;
    };
    
    // Adresse
    address: {
      street: string;
      city: string;
      postal_code: string;
      country: string;
    };
    
    // Paramètres d'onboarding
    enable_onboarding: boolean;
    auto_send_credentials: boolean;
    onboarding_template: string;
  }>({
    // Champs de base
    first_name: '',
    last_name: '',
    work_email: '',
    branch_id: '',
    department_id: '',
    position_id: '',
    hire_date: '',
    employment_type: 'full_time',
    manager_id: '',
    current_salary: 0,
    
    // Informations personnelles étendues
    personal_email: '',
    personal_phone: '',
    date_of_birth: '',
    nationality: '',
    gender: '',
    
    // Contact d'urgence
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    
    // Adresse
    address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'France'
    },
    
    // Paramètres d'onboarding
    enable_onboarding: true,
    auto_send_credentials: true,
    onboarding_template: 'standard'
  });

  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les données de l'employé pour l'édition
  useEffect(() => {
    if (isEdit && employee) {
      setFormData({
        // Champs de base
        first_name: employee.first_name,
        last_name: employee.last_name,
        work_email: employee.work_email || '',
        branch_id: employee.branch_id,
        department_id: employee.department_id,
        position_id: employee.position_id,
        hire_date: employee.hire_date,
        employment_type: employee.employment_type,
        manager_id: employee.manager_id || '',
        current_salary: employee.current_salary || 0,
        
        // Informations personnelles étendues
        personal_email: employee.personal_email || '',
        personal_phone: employee.personal_phone || '',
        date_of_birth: employee.date_of_birth || '',
        nationality: employee.nationality || '',
        gender: employee.gender || '',
        
        // Contact d'urgence
        emergency_contact: {
          name: employee.emergency_contact?.name || '',
          relationship: employee.emergency_contact?.relationship || '',
          phone: employee.emergency_contact?.phone || '',
          email: employee.emergency_contact?.email || ''
        },
        
        // Adresse
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          postal_code: employee.address?.postal_code || '',
          country: employee.address?.country || 'France'
        },
        
        // Paramètres d'onboarding (valeurs par défaut en édition)
        enable_onboarding: true,
        auto_send_credentials: false, // Pas d'envoi auto en édition
        onboarding_template: 'standard'
      });
    }
  }, [isEdit, employee]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      // Gestion des champs imbriqués (ex: emergency_contact.name)
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Supprimer l'erreur de validation si elle existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis';
    }

    if (!formData.work_email.trim()) {
      errors.work_email = 'L\'email professionnel est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.work_email)) {
      errors.work_email = 'L\'email professionnel n\'est pas valide';
    }

    if (!formData.hire_date) {
      errors.hire_date = 'La date d\'embauche est requise';
    }

    if (!formData.department_id) {
      errors.department_id = 'Le département est requis';
    }

    if (!formData.position_id) {
      errors.position_id = 'Le poste est requis';
    }

    if (!formData.branch_id) {
      errors.branch_id = 'La branche est requise';
    }

    if (formData.current_salary && formData.current_salary < 0) {
      errors.current_salary = 'Le salaire doit être positif';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        const updateData: EmployeeUpdateInput = { ...formData };
        await updateEmployee(updateData);
      } else {
        await createEmployee(formData);
      }
      navigate('/hr/employees');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/hr/employees');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error || createError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Erreur</h3>
            <p className="mt-2 text-sm text-gray-500">{error?.message || createError?.message}</p>
            <Button onClick={handleCancel} className="mt-4" variant="outline">
              Retour à la liste
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
        </h1>
        <p className="text-gray-600">
          {isEdit 
            ? 'Modifiez les informations de l\'employé ci-dessous'
            : 'Ajoutez un nouvel employé à votre organisation'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations de base
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informations personnelles
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Informations professionnelles
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Onboarding
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations de base */}
          <TabsContent value="basic">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations de base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Jean"
                  />
                  {validationErrors.first_name && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Dupont"
                  />
                  {validationErrors.last_name && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.last_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="work_email">Email professionnel *</Label>
                  <Input
                    id="work_email"
                    type="email"
                    value={formData.work_email}
                    onChange={(e) => handleInputChange('work_email', e.target.value)}
                    placeholder="jean.dupont@entreprise.com"
                  />
                  {validationErrors.work_email && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.work_email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="personal_email">Email personnel</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => handleInputChange('personal_email', e.target.value)}
                    placeholder="jean.dupont@gmail.com"
                  />
                  <p className="text-xs text-gray-600">Utilisé pour l'envoi des identifiants d'onboarding</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Onglet Informations personnelles */}
          <TabsContent value="personal">
            <div className="space-y-6">
              {/* Informations personnelles */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="personal_phone">Téléphone personnel</Label>
                    <Input
                      id="personal_phone"
                      type="tel"
                      value={formData.personal_phone}
                      onChange={(e) => handleInputChange('personal_phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date de naissance</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="Française"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Genre</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Homme</SelectItem>
                        <SelectItem value="F">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Adresse */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address.street">Rue</Label>
                    <Input
                      id="address.street"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      placeholder="123 Rue de la République"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address.city">Ville</Label>
                    <Input
                      id="address.city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="Paris"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address.postal_code">Code postal</Label>
                    <Input
                      id="address.postal_code"
                      value={formData.address.postal_code}
                      onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                      placeholder="75001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address.country">Pays</Label>
                    <Select value={formData.address.country} onValueChange={(value) => handleInputChange('address.country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Belgique">Belgique</SelectItem>
                        <SelectItem value="Suisse">Suisse</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Contact d'urgence */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact d'urgence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact.name">Nom complet</Label>
                    <Input
                      id="emergency_contact.name"
                      value={formData.emergency_contact.name}
                      onChange={(e) => handleInputChange('emergency_contact.name', e.target.value)}
                      placeholder="Marie Dupont"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact.relationship">Relation</Label>
                    <Select 
                      value={formData.emergency_contact.relationship} 
                      onValueChange={(value) => handleInputChange('emergency_contact.relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conjoint">Conjoint(e)</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="enfant">Enfant</SelectItem>
                        <SelectItem value="frere_soeur">Frère/Sœur</SelectItem>
                        <SelectItem value="ami">Ami(e)</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact.phone">Téléphone</Label>
                    <Input
                      id="emergency_contact.phone"
                      type="tel"
                      value={formData.emergency_contact.phone}
                      onChange={(e) => handleInputChange('emergency_contact.phone', e.target.value)}
                      placeholder="+33 6 98 76 54 32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact.email">Email (optionnel)</Label>
                    <Input
                      id="emergency_contact.email"
                      type="email"
                      value={formData.emergency_contact.email}
                      onChange={(e) => handleInputChange('emergency_contact.email', e.target.value)}
                      placeholder="marie.dupont@email.com"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Informations professionnelles */}
          <TabsContent value="professional">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informations professionnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch_id">Branche *</Label>
                  <Select value={formData.branch_id} onValueChange={(value) => handleInputChange('branch_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une branche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Siège Paris</SelectItem>
                      <SelectItem value="2">Filiale Lyon</SelectItem>
                      <SelectItem value="3">Filiale Marseille</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.branch_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.branch_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department_id">Département *</Label>
                  <Select value={formData.department_id} onValueChange={(value) => handleInputChange('department_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Développement</SelectItem>
                      <SelectItem value="2">Commercial</SelectItem>
                      <SelectItem value="3">Marketing</SelectItem>
                      <SelectItem value="4">RH</SelectItem>
                      <SelectItem value="5">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.department_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.department_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position_id">Poste *</Label>
                  <Select value={formData.position_id} onValueChange={(value) => handleInputChange('position_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Développeur Senior</SelectItem>
                      <SelectItem value="2">Développeur Junior</SelectItem>
                      <SelectItem value="3">Chef de projet</SelectItem>
                      <SelectItem value="4">Commercial</SelectItem>
                      <SelectItem value="5">Responsable Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.position_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.position_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="manager_id">Manager</Label>
                  <Select value={formData.manager_id || 'none'} onValueChange={(value) => handleInputChange('manager_id', value === 'none' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun manager</SelectItem>
                      <SelectItem value="1">Marie Martin (CEO)</SelectItem>
                      <SelectItem value="3">Pierre Durand (CTO)</SelectItem>
                      <SelectItem value="5">Sophie Bernard (RH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employment_type">Type d'emploi *</Label>
                  <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Temps plein</SelectItem>
                      <SelectItem value="part_time">Temps partiel</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="intern">Stage</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hire_date">Date d'embauche *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  />
                  {validationErrors.hire_date && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.hire_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="current_salary">Salaire actuel</Label>
                  <Input
                    id="current_salary"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.current_salary}
                    onChange={(e) => handleInputChange('current_salary', parseFloat(e.target.value) || 0)}
                    placeholder="45000"
                  />
                  {validationErrors.current_salary && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.current_salary}</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Onglet Onboarding */}
          <TabsContent value="onboarding">
            <div className="space-y-6">
              {/* Paramètres d'onboarding */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres d'onboarding
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable_onboarding"
                      checked={formData.enable_onboarding}
                      onCheckedChange={(checked) => handleInputChange('enable_onboarding', !!checked)}
                    />
                    <Label htmlFor="enable_onboarding" className="flex flex-col">
                      <span className="font-medium">Activer l'onboarding automatique</span>
                      <span className="text-sm text-gray-600">
                        Lance le processus d'onboarding après la création de l'employé
                      </span>
                    </Label>
                  </div>

                  {formData.enable_onboarding && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="auto_send_credentials"
                          checked={formData.auto_send_credentials}
                          onCheckedChange={(checked) => handleInputChange('auto_send_credentials', !!checked)}
                        />
                        <Label htmlFor="auto_send_credentials" className="flex flex-col">
                          <span className="font-medium">Envoyer automatiquement les identifiants</span>
                          <span className="text-sm text-gray-600">
                            Envoie les identifiants de connexion à l'email personnel
                          </span>
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="onboarding_template">Template d'onboarding</Label>
                        <Select 
                          value={formData.onboarding_template} 
                          onValueChange={(value) => handleInputChange('onboarding_template', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard - Processus classique</SelectItem>
                            <SelectItem value="executive">Dirigeant - Processus accéléré</SelectItem>
                            <SelectItem value="intern">Stagiaire - Processus simplifié</SelectItem>
                            <SelectItem value="remote">Télétravail - Processus à distance</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-600 mt-1">
                          Détermine les étapes et documents inclus dans l'onboarding
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Informations pour l'onboarding */}
              {formData.enable_onboarding && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations requises pour l'onboarding</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="font-medium text-blue-900">Email personnel</span>
                        <p className="text-sm text-blue-700">
                          {formData.personal_email || 'Non renseigné - requis pour l\'envoi des identifiants'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <User className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="font-medium text-green-900">Contact d'urgence</span>
                        <p className="text-sm text-green-700">
                          {formData.emergency_contact.name 
                            ? `${formData.emergency_contact.name} (${formData.emergency_contact.relationship})`
                            : 'Non renseigné - requis pour les documents d\'onboarding'
                          }
                        </p>
                      </div>
                    </div>

                    {!formData.personal_email && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Email personnel requis
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                L'email personnel est nécessaire pour l'envoi des identifiants de connexion.
                                Veuillez le renseigner dans l'onglet "Informations de base".
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Aperçu du processus */}
              {formData.enable_onboarding && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du processus</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <div>
                        <span className="font-medium">Enrichissement des données</span>
                        <p className="text-sm text-gray-600">Collecte des informations personnelles additionnelles</p>
                      </div>
                    </div>
                    
                    {formData.auto_send_credentials && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <div>
                          <span className="font-medium">Envoi des identifiants</span>
                          <p className="text-sm text-gray-600">Création et envoi du compte utilisateur</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <div>
                        <span className="font-medium">Génération de documents</span>
                        <p className="text-sm text-gray-600">Contrats et documents administratifs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                      <div>
                        <span className="font-medium">Attribution matériel</span>
                        <p className="text-sm text-gray-600">Ordinateur, équipements et accès</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || isCreating}>
            {saving || isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Modifier' : 'Créer'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormPage;
