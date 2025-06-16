
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { MOCK_COMPANIES } from '@/data/mockData';
import { Company } from '@/types';
import { Plus, Search, Building, Mail, Phone, MapPin, Edit, Users } from 'lucide-react';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Apply search filter
  const filteredCompanies = MOCK_COMPANIES.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = () => {
    if (!newCompany.name.trim() || !newCompany.email.trim()) return;
    
    console.log('Créer nouvelle entreprise:', newCompany);
    // TODO: Implement company creation
    
    setNewCompany({ name: '', email: '', phone: '', address: '' });
    setShowNewCompanyDialog(false);
  };

  const handleEditCompany = (companyId: string) => {
    console.log('Modifier entreprise:', companyId);
    // TODO: Implement company editing
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Entreprises</h1>
          <p className="text-slate-600 mt-1">
            Gérez les entreprises clientes d'Arcadis Tech
          </p>
        </div>
        
        <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Entreprise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <Input
                  placeholder="Ex: ACME Corporation"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email de contact *
                </label>
                <Input
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <Input
                  placeholder="+221 XX XXX XX XX"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse
                </label>
                <Input
                  placeholder="Adresse complète"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewCompanyDialog(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={!newCompany.name.trim() || !newCompany.email.trim()}
                >
                  Créer l'entreprise
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-arcadis-gradient rounded-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                      Client depuis {formatDate(company.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCompany(company.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </div>
              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-2">{company.address}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-slate-200">
                <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gérer les utilisateurs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucune entreprise trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Companies;
