// src/components/debug/EmployeeTestComponent.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { simpleEmployeeApi, type EmployeeSimple } from '@/services/hr/supabaseApiSimple';

export const EmployeeTestComponent: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBasicQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Test: Requête basique...');
      const data = await simpleEmployeeApi.listBasic();
      setEmployees(data);
      console.log('✅ Test réussi:', data.length, 'employés trouvés');
    } catch (err: any) {
      console.error('❌ Test échoué:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const testFilteredQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Test: Requête avec filtre EMP%...');
      const data = await simpleEmployeeApi.listTest();
      setEmployees(data);
      console.log('✅ Test avec filtre réussi:', data.length, 'employés trouvés');
    } catch (err: any) {
      console.error('❌ Test avec filtre échoué:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test de Diagnostic - API Employés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testBasicQuery} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Test en cours...' : 'Test Requête Basique'}
            </Button>
            
            <Button 
              onClick={testFilteredQuery} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Test en cours...' : 'Test avec Filtre EMP%'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-800">❌ Erreur détectée:</h4>
              <p className="text-red-700 mt-1">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                Vérifiez la console pour plus de détails.
              </p>
            </div>
          )}

          {employees.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">
                ✅ {employees.length} employé(s) trouvé(s):
              </h4>
              {employees.map((emp) => (
                <div key={emp.id} className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">
                        {emp.first_name} {emp.last_name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        📧 {emp.work_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        🆔 {emp.employee_number}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">
                        📊 {emp.employment_status}
                      </p>
                      <p className="text-gray-600">
                        💼 {emp.employment_type}
                      </p>
                      {emp.performance_score && (
                        <p className="text-gray-600">
                          ⭐ {emp.performance_score}/5
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-blue-800">💡 Instructions:</h4>
            <ol className="text-blue-700 mt-2 space-y-1 text-sm">
              <li>1. Cliquez sur "Test Requête Basique" pour vérifier l'accès aux données</li>
              <li>2. Cliquez sur "Test avec Filtre EMP%" pour tester les employés de test</li>
              <li>3. Ouvrez la console (F12) pour voir les logs détaillés</li>
              <li>4. Si aucun test ne fonctionne → Problème de permissions Supabase</li>
              <li>5. Si seul le filtre échoue → Problème avec les données EMP%</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTestComponent;
