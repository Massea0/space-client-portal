// Test spécifique pour le devis DEV-2025-53688
// Vérifier que l'optimisation IA utilise le bon montant original

const SUPABASE_URL = 'https://qvvfvhyvcmqrwrlxigla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dmZ2aHl2Y21xcndybHhpZ2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Mzg5MjAsImV4cCI6MjA1MjQxNDkyMH0.sF5VDPO0W_Kz-3KRaZTKz0TjRXZ7Z4XR5Ep_g8kJ7cw';

async function testSpecificQuote() {
  console.log('🔍 Test du devis DEV-2025-53688');
  console.log('==============================\n');
  
  const quoteId = 'DEV-2025-53688';
  
  try {
    // 1. Récupérer les données du devis directement de Supabase
    console.log('📋 Récupération des données du devis...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/devis?id=eq.${quoteId}&select=*,companies(name,industry)`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const quotes = await response.json();
    
    if (quotes.length === 0) {
      throw new Error('Devis non trouvé');
    }
    
    const quote = quotes[0];
    
    console.log(`✅ Devis trouvé:`);
    console.log(`   ID: ${quote.id}`);
    console.log(`   Montant: ${quote.amount.toLocaleString()} FCFA`);
    console.log(`   Entreprise: ${quote.companies?.name || 'N/A'}`);
    console.log(`   Secteur: ${quote.companies?.industry || 'N/A'}`);
    console.log(`   Description: ${quote.description?.substring(0, 100) || 'N/A'}...`);
    console.log('');
    
    // 2. Appeler la fonction d'optimisation IA
    console.log('🤖 Appel de la fonction d\'optimisation IA...');
    
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteId: quoteId,
        companyId: quote.company_id,
        applyOptimization: false
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Erreur fonction IA: ${aiResponse.status} - ${errorText}`);
    }
    
    const aiResult = await aiResponse.json();
    
    if (!aiResult.success) {
      throw new Error(`Erreur IA: ${aiResult.error}`);
    }
    
    const optimization = aiResult.optimization;
    
    console.log('✅ Optimisation IA reçue:');
    console.log(`   Montant original: ${optimization.originalAmount.toLocaleString()} FCFA`);
    console.log(`   Montant suggéré: ${optimization.suggestedAmount.toLocaleString()} FCFA`);
    console.log(`   Optimisation: ${optimization.optimizationPercentage}%`);
    console.log(`   Probabilité de conversion: ${Math.round(optimization.conversionProbability * 100)}%`);
    console.log(`   Confiance: ${Math.round(optimization.confidence * 100)}%`);
    console.log(`   Raisonnement: ${optimization.reasoning}`);
    console.log('');
    
    // 3. Vérifier la cohérence des montants
    console.log('🔍 Vérification de la cohérence:');
    
    const originalAmountMatch = quote.amount === optimization.originalAmount;
    const optimizationCalculation = Math.round((optimization.suggestedAmount / optimization.originalAmount - 1) * 100 * 10) / 10;
    const percentageMatch = Math.abs(optimizationCalculation - optimization.optimizationPercentage) < 0.1;
    
    console.log(`   ✅ Montant original correct: ${originalAmountMatch ? 'OUI' : 'NON'}`);
    if (!originalAmountMatch) {
      console.log(`      Attendu: ${quote.amount} FCFA`);
      console.log(`      Reçu: ${optimization.originalAmount} FCFA`);
    }
    
    console.log(`   ✅ Calcul d'optimisation correct: ${percentageMatch ? 'OUI' : 'NON'}`);
    if (!percentageMatch) {
      console.log(`      Calculé: ${optimizationCalculation}%`);
      console.log(`      Retourné: ${optimization.optimizationPercentage}%`);
    }
    
    console.log('');
    
    // 4. Afficher les recommandations
    console.log('💡 Recommandations:');
    console.log('   Prix:');
    optimization.recommendations.pricing.forEach(rec => console.log(`      • ${rec}`));
    console.log('   Description:');
    optimization.recommendations.description.forEach(rec => console.log(`      • ${rec}`));
    console.log('   Conditions:');
    optimization.recommendations.terms.forEach(rec => console.log(`      • ${rec}`));
    
    if (originalAmountMatch && percentageMatch) {
      console.log('\\n🎉 Test réussi ! L\'optimisation IA utilise les bonnes données.');
    } else {
      console.log('\\n❌ Problème détecté dans les données d\'optimisation.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testSpecificQuote();
