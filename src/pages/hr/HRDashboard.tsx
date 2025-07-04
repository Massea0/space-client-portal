// src/pages/hr/HRDashboard.tsx
// Page principale du module RH avec aperçu des métriques

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { employeeApi } from '@/services/hr/employeeApi';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Calendar,
  UserCheck,
  UserX,
  Target,
  Award
} from 'lucide-react';
import type { Employee } from '@/types/hr';

const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await employeeApi.list({}, { page: 1, limit: 100 });
        setEmployees(result.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Calcul des métriques en temps réel
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.employment_status === 'active').length;
  const uniqueDepartments = new Set(employees.map(emp => emp.department_id)).size;
  const avgPerformance = employees.length > 0 
    ? employees.reduce((sum, emp) => sum + emp.performance_score, 0) / employees.length 
    : 0;

  const metrics = [
    {
      title: 'Total Employés',
      value: loading ? '...' : totalEmployees.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Employés Actifs',
      value: loading ? '...' : activeEmployees.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Départements',
      value: loading ? '...' : uniqueDepartments.toString(),
      change: '0',
      changeType: 'neutral' as const,
      icon: Building,
      color: 'purple'
    },
    {
      title: 'Performance Moyenne',
      value: loading ? '...' : `${avgPerformance.toFixed(1)}/5`,
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Award,
      color: 'yellow'
    }
  ];

  const quickActions = [
    {
      title: 'Gestion des Employés',
      description: 'Consulter, ajouter ou modifier les informations des employés',
      icon: Users,
      href: '/hr/employees',
      color: 'blue'
    },
    {
      title: 'Structure Organisationnelle',
      description: 'Gérer les départements, postes et hiérarchie',
      icon: Building,
      href: '/hr/organization',
      color: 'green'
    },
    {
      title: 'Analytics RH',
      description: 'Analyses et rapports détaillés des ressources humaines',
      icon: TrendingUp,
      href: '/hr/analytics',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' }
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ressources Humaines</h1>
          <p className="text-gray-600 mt-1">
            Tableau de bord et gestion des ressources humaines
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/hr/employees')}
          >
            <Users className="h-4 w-4 mr-2" />
            Voir tous les employés
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  {metric.change !== '0' && (
                    <div className={`flex items-center mt-2 text-sm ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      <span>{metric.change} ce mois</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color, 'bg')}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.title} 
                className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${getColorClasses(action.color, 'border')}`}
                onClick={() => navigate(action.href)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getColorClasses(action.color, 'bg')}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alertes et notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes RH</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">5 évaluations de performance en attente</p>
              <p className="text-xs text-yellow-600">À compléter avant la fin du mois</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">3 nouveaux employés ce mois</p>
              <p className="text-xs text-blue-600">Processus d'intégration en cours</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Target className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Objectifs trimestriels atteints à 95%</p>
              <p className="text-xs text-green-600">Performance globale excellente</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HRDashboard;
