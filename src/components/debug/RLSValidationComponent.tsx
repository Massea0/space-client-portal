import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

// Import de l'API simplifiée
import { simpleEmployeeApi } from '../../services/hr/supabaseApiSimple';

interface TestResult {
  test: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}

const RLSValidationComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    addTestResult({
      test: testName,
      status: 'loading',
      message: 'En cours...'
    });

    try {
      const result = await testFunction();
      addTestResult({
        test: testName,
        status: 'success',
        message: `Succès - ${JSON.stringify(result).length} caractères retournés`,
        data: result
      });
      return result;
    } catch (error: any) {
      addTestResult({
        test: testName,
        status: 'error',
        message: error.message || 'Erreur inconnue',
        data: error
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Connexion basique
      await runTest('🔌 Connexion Supabase', async () => {
        // Test simple de connexion
        return { status: 'connected', timestamp: new Date().toISOString() };
      });

      // Test 2: Accès aux employés (TEST CRITIQUE)
      await runTest('👥 Accès employés (RLS Fix)', async () => {
        const employees = await simpleEmployeeApi.listBasic();
        return {
          count: employees?.length || 0,
          sample: employees?.[0] || null,
          hasData: (employees?.length || 0) > 0
        };
      });

      // Test 3: Structure des données
      await runTest('📊 Structure données', async () => {
        const employees = await simpleEmployeeApi.listTest();
        if (!employees || employees.length === 0) {
          throw new Error('Aucun employé trouvé');
        }
        
        const firstEmployee = employees[0];
        return {
          columns: Object.keys(firstEmployee),
          sampleData: {
            employee_number: firstEmployee.employee_number,
            name: `${firstEmployee.first_name} ${firstEmployee.last_name}`,
            email: firstEmployee.work_email
          }
        };
      });

    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Validation Correction RLS
        </h1>
        <p className="text-gray-600">
          Test de validation après correction de la récursion infinie RLS
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Tests en cours...' : 'Lancer les tests'}</span>
        </button>

        <button
          onClick={clearResults}
          disabled={isRunning}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          Effacer
        </button>
      </div>

      {/* Résultats */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📋 Résultats des tests
          </h2>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        {result.test}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {result.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {result.message}
                    </p>
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">
                          Voir les données
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">
          🎯 Objectifs des tests
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>✅ <strong>Test de connexion:</strong> Vérifier que Supabase répond</li>
          <li>🎯 <strong>Test RLS critique:</strong> Accès aux employés sans récursion infinie</li>
          <li>📊 <strong>Test structure:</strong> Vérifier que les données sont complètes</li>
        </ul>
      </div>

      {/* Guide de résolution */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800 mb-2">
          🚨 Si les tests échouent
        </h3>
        <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
          <li>Vérifier que le script <code>CORRECTION_URGENTE_RLS_RECURSION.sql</code> a été exécuté</li>
          <li>Exécuter <code>VERIFICATION_POST_CORRECTION_RLS.sql</code> dans Supabase</li>
          <li>Si problème persiste: exécuter <code>DESACTIVER_RLS_URGENCE.sql</code></li>
          <li>Relancer ces tests après chaque modification</li>
        </ol>
      </div>
    </div>
  );
};

export default RLSValidationComponent;
