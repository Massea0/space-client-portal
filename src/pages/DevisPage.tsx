// src/pages/DevisPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import { devisApi } from '@/services/api';
import { Devis as DevisType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { downloadDevisPdf } from '@/lib/pdfGenerator';
import { Download, CheckCircle, XCircle, Search as SearchIcon, Plus, Filter, Eye, FileText } from 'lucide-react';

const DevisPage = () => {
    const { user, isLoading: authLoading } = useAuth(); // Renommé pour clarté
    const navigate = useNavigate();
    const { toast } = useToast();
    const [devisList, setDevisList] = useState<DevisType[]>([]);
    const [filteredDevis, setFilteredDevis] = useState<DevisType[]>([]);
    const [loading, setLoading] = useState(true); // Chargement des données de la page
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [rejectionReason, setRejectionReason] = useState('');
    const [devisToManage, setDevisToManage] = useState<DevisType | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);

    const getStatusBadgeClass = (status: DevisType['status']): string => {
        // ... (même fonction)
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-slate-100 text-slate-800';
            case 'expired': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const fetchDevisForUser = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setDevisList([]);
            return;
        }
        setLoading(true);
        try {
            let data;
            if (user.role === 'admin') {
                // L'admin voit tous les devis sur sa page dédiée /admin/devis
                // Ici, on pourrait choisir de ne rien afficher ou de rediriger,
                // ou d'afficher aussi tous les devis si c'est le comportement souhaité.
                // Pour l'instant, on va supposer que cette page est principalement pour les clients
                // et que l'admin a sa propre vue /admin/devis.
                // Si un admin arrive ici, il verra aussi tous les devis.
                data = await devisApi.getAll();
            } else if (user.companyId) {
                data = await devisApi.getByCompany(user.companyId);
            } else {
                data = []; // Cas où un client n'a pas de companyId (ne devrait pas arriver)
            }
            setDevisList(data);
        } catch (error) {
            console.error("[DevisPage] Erreur chargement devis:", error);
            toast({ title: 'Erreur', description: 'Impossible de charger vos devis.', variant: 'error' });
            setDevisList([]);
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (!authLoading) { // Attendre que l'authentification soit terminée
            fetchDevisForUser();
        }
    }, [authLoading, fetchDevisForUser]);

    useEffect(() => {
        let result = devisList;
        if (searchTerm) {
            result = result.filter(devis =>
                devis.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                devis.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user?.role === 'admin' && devis.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (statusFilter && statusFilter !== 'all') {
            result = result.filter(devis => devis.status === statusFilter);
        }
        setFilteredDevis(result);
    }, [searchTerm, statusFilter, devisList, user?.role]);

    const handleUpdateStatus = async (id: string, status: DevisType['status'], reason?: string) => {
        setActionLoading(id);
        try {
            // Les clients ne peuvent qu'approuver ou rejeter. Les admins gèrent via /admin/devis
            if (user?.role === 'client' && (status === 'approved' || status === 'rejected')) {
                await devisApi.updateStatus(id, status, reason);
                toast({
                    title: 'Succès',
                    description: `Devis ${status === 'approved' ? 'approuvé' : 'rejeté'}.`,
                    variant: 'success',
                });
                fetchDevisForUser();
            } else if (user?.role === 'admin') {
                // L'admin peut aussi utiliser cette fonction si on le souhaite, sinon il utilise sa page dédiée
                await devisApi.updateStatus(id, status, reason);
                toast({ title: 'Succès', description: 'Statut du devis mis à jour.', variant: 'success' });
                fetchDevisForUser(); // ou rediriger/notifier que la gestion se fait sur /admin/devis
            }
        } catch (error) {
            console.error("[DevisPage] Erreur mise à jour statut:", error);
            toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'error' });
        } finally {
            setActionLoading(null);
            setDevisToManage(null);
            setIsRejecting(false);
            setRejectionReason('');
        }
    };

    const handleApproveAction = () => {
        if (devisToManage && user?.role === 'client') {
            handleUpdateStatus(devisToManage.id, 'approved');
        }
    };

    const handleRejectAction = () => {
        if (devisToManage && rejectionReason.trim() && user?.role === 'client') {
            handleUpdateStatus(devisToManage.id, 'rejected', rejectionReason.trim());
        } else if (!rejectionReason.trim()) {
            toast({ title: "Validation", description: "La raison du rejet est requise.", variant: "warning" });
        }
    };

    const handleDownloadPDF = async (devis: DevisType) => {
        setActionLoading(`pdf-${devis.id}`);
        try {
            await downloadDevisPdf(devis);
        } catch (error) {
            console.error("[DevisPage] Erreur PDF:", error);
            toast({ title: 'Erreur PDF', description: 'Impossible de générer le PDF.', variant: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || (loading && devisList.length === 0 && !user)) { // Attendre auth ET chargement initial
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arcadis-orange mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement...</p>
                </div>
            </div>
        );
    }
    const availableStatuses: DevisType['status'][] = ['draft', 'sent', 'pending', 'approved', 'rejected', 'expired'];


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {user?.role === 'admin' ? 'Consultation des Devis (Vue Client/Admin)' : 'Mes Devis'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {user?.role === 'admin' ? 'Visualisez les devis comme un client ou accédez à la gestion admin.' : 'Consultez l\'historique et le statut de vos devis.'}
                    </p>
                </div>
                {/* Le bouton redirige vers la page de création admin */}
                {user?.role === 'admin' && !authLoading && (
                    <Button
                        className="flex items-center gap-2 w-full md:w-auto"
                        onClick={() => navigate('/admin/devis/creer')}
                    >
                        <Plus className="h-4 w-4" /> Créer un Devis (Admin)
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Rechercher par N°, objet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                {availableStatuses.map(status => (
                                    <SelectItem key={status} value={status} className="capitalize">
                                        {status.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {filteredDevis.length === 0 && !loading ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {user?.role === 'admin' && devisList.length === 0 ? "Aucun devis trouvé pour cette vue. Gérez les devis via la section admin." : "Vous n'avez aucun devis pour le moment."}
                        </p>
                        {user?.role === 'admin' && (
                            <Button onClick={() => navigate('/admin/devis')} className="mt-4 mr-2">Gestion Admin Devis</Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-1"> {/* ou grid-cols-2 */}
                    {filteredDevis.map((devis) => (
                        <Card key={devis.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                    <div>
                                        <CardTitle className="text-xl text-arcadis-blue">{devis.object}</CardTitle>
                                        <CardDescription className="text-sm text-slate-500">
                                            N°: {devis.number} - {user?.role === 'admin' ? `Client: ${devis.companyName}` : `Montant: ${formatCurrency(devis.amount)}`}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusBadgeClass(devis.status) + " text-xs whitespace-nowrap mt-2 sm:mt-0"}>
                                        {devis.status.charAt(0).toUpperCase() + devis.status.slice(1).replace('_', ' ')}
                                    </Badge>
                                </div>
                                {user?.role === 'admin' && (
                                    <p className="text-lg font-semibold text-slate-700 pt-1">
                                        Montant: {formatCurrency(devis.amount)}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm text-slate-600">
                                    <p><strong>Créé le:</strong> {formatDate(new Date(devis.createdAt))}</p>
                                    <p><strong>Valide jusqu'au:</strong> {formatDate(new Date(devis.validUntil))}</p>
                                    {devis.notes && <p className="mt-2"><strong>Notes:</strong> {devis.notes}</p>}
                                    {devis.status === 'rejected' && devis.rejectionReason && (
                                        <p className="mt-2 text-red-600"><strong>Raison du rejet:</strong> {devis.rejectionReason}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Articles:</h4>
                                    <ul className="list-disc list-inside pl-1 space-y-1 text-sm">
                                        {devis.items.slice(0, 3).map(item => (
                                            <li key={item.id}>{item.description} ({item.quantity} x {formatCurrency(item.unitPrice)})</li>
                                        ))}
                                        {devis.items.length > 3 && <li>et {devis.items.length - 3} autre(s)...</li>}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => handleDownloadPDF(devis)} disabled={actionLoading === `pdf-${devis.id}`}>
                                    <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                                </Button>
                                {user?.role === 'client' && devis.status === 'pending' && (
                                    <>
                                        <AlertDialog open={devisToManage?.id === devis.id && !isRejecting} onOpenChange={(open) => !open && setDevisToManage(null)}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setDevisToManage(devis)} disabled={actionLoading === devis.id}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Approuver le devis ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Confirmez-vous l'approbation du devis "{devis.object}" (N°{devis.number}) ?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setDevisToManage(null)}>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleApproveAction} className="bg-green-600 hover:bg-green-700">
                                                        Confirmer l'Approbation
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog open={devisToManage?.id === devis.id && isRejecting} onOpenChange={(open) => {if (!open) {setDevisToManage(null); setIsRejecting(false); setRejectionReason('');}}}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" onClick={() => {setDevisToManage(devis); setIsRejecting(true);}} disabled={actionLoading === devis.id}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Rejeter
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Rejeter le devis ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Veuillez fournir une raison pour le rejet du devis "{devis.object}" (N°{devis.number}).
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <Textarea
                                                    placeholder="Raison du rejet..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="my-4"
                                                />
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => { setDevisToManage(null); setIsRejecting(false); setRejectionReason(''); }}>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleRejectAction} disabled={!rejectionReason.trim()}>
                                                        Confirmer le Rejet
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                                {/* L'admin gère les statuts sur /admin/devis */}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            {/* Dialogue de rejet pour l'admin (si on le garde ici, sinon uniquement sur AdminDevisPage) */}
            {/* ... */}
        </div>
    );
};

export default DevisPage;