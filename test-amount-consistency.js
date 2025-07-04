// Test de validation des montants après correction
// Vérifie que l'optimisation IA utilise les vrais montants des devis

async function testQuoteAmountConsistency() {
  console.log('🔍 Test de cohérence des montants après correction');
  console.log('===============================================\n');
  
  const SUPABASE_URL = 'https://qvvfvhyvcmqrwrlxigla.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dmZ2aHl2Y21xcndybHhpZ2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Mzg5MjAsImV4cCI6MjA1MjQxNDkyMH0.sF5VDPO0W_Kz-3KRaZTKz0TjRXZ7Z4XR5Ep_g8kJ7cw';
  
  // Test avec différents montants pour vérifier la variabilité
  const testCases = [
    { quoteId: 'TEST-700K', amount: 700000, description: 'Test devis 700k' },
    { quoteId: 'TEST-500K', amount: 500000, description: 'Test devis 500k' },
    { quoteId: 'TEST-300K', amount: 300000, description: 'Test devis 300k' },
    { quoteId: 'TEST-1M', amount: 1000000, description: 'Test devis 1M' },
    { quoteId: 'DEV-2025-53688', amount: null, description: 'Devis réel DEV-2025-53688' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\\n📋 Test: ${testCase.description}`);
    console.log(`   ID: ${testCase.quoteId}`);
    if (testCase.amount) {
      console.log(`   Montant attendu: ${testCase.amount.toLocaleString()} FCFA`);
    }
    
    try {
      // Appeler directement la fonction d'optimisation IA
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteId: testCase.quoteId,
          companyId: 'test-company-id',
          applyOptimization: false
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Erreur HTTP ${response.status}: ${errorText.substring(0, 100)}...`);
        continue;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.log(`   ❌ Erreur API: ${result.error}`);
        continue;
      }
      
      const optimization = result.optimization;
      const actualQuoteAmount = result.quote?.originalAmount;
      
      console.log(`   ✅ Optimisation reçue:`);
      console.log(`      Montant original retourné: ${optimization.originalAmount.toLocaleString()} FCFA`);
      console.log(`      Montant suggéré: ${optimization.suggestedAmount.toLocaleString()} FCFA`);
      console.log(`      Optimisation: ${optimization.optimizationPercentage}%`);
      console.log(`      Confiance: ${Math.round(optimization.confidence * 100)}%`);
      
      // Vérifier la cohérence
      if (testCase.amount && optimization.originalAmount !== testCase.amount) {
        console.log(`   ⚠️  INCOHÉRENCE DÉTECTÉE:`);
        console.log(`      Attendu: ${testCase.amount.toLocaleString()} FCFA`);
        console.log(`      Retourné: ${optimization.originalAmount.toLocaleString()} FCFA`);
      } else if (testCase.amount) {
        console.log(`   ✅ Montant cohérent`);
      } else {
        console.log(`   ℹ️  Montant du devis réel: ${optimization.originalAmount.toLocaleString()} FCFA`);
      }
      
      // Vérifier le calcul d'optimisation
      const calculatedPercentage = Math.round((optimization.suggestedAmount / optimization.originalAmount - 1) * 100 * 10) / 10;
      const percentageMatch = Math.abs(calculatedPercentage - optimization.optimizationPercentage) < 0.1;
      
      if (!percentageMatch) {
        console.log(`   ⚠️  ERREUR DE CALCUL:`);
        console.log(`      Calculé: ${calculatedPercentage}%`);
        console.log(`      Retourné: ${optimization.optimizationPercentage}%`);
      } else {
        console.log(`   ✅ Calcul d'optimisation correct`);
      }
      
      // Afficher le raisonnement (premier ligne seulement)
      const firstLine = optimization.reasoning.split('.')[0];
      console.log(`   💭 Raisonnement: ${firstLine}...`);
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\\n🏁 Test terminé');
}

// Fonction pour tester avec Node.js
if (typeof globalThis.fetch === 'undefined') {
  import('node-fetch').then(fetch => {
    globalThis.fetch = fetch.default;
    testQuoteAmountConsistency();
  }).catch(() => {
    console.error('❌ node-fetch non disponible. Installez avec: npm install node-fetch');
  });
} else {
  testQuoteAmountConsistency();
}

export { testQuoteAmountConsistency };
