// Test direct de l'edge function d'optimisation IA
// Ce script teste la variabilité des optimisations IA via l'API Supabase

import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE';

async function testAIOptimization() {
  console.log('🧪 Test de l\'edge function d\'optimisation IA');
  console.log('============================================\n');
  
  // IDs de devis de test (générons des IDs fictifs pour simuler)
  const testQuoteIds = [
    '12345678-1234-5678-9012-123456789001',
    '12345678-1234-5678-9012-123456789002', 
    '12345678-1234-5678-9012-123456789003',
    '12345678-1234-5678-9012-123456789004',
    '12345678-1234-5678-9012-123456789005'
  ];
  
  console.log('📊 Test de la variabilité des optimisations...\n');
  
  for (let i = 0; i < testQuoteIds.length; i++) {
    const quoteId = testQuoteIds[i];
    console.log(`🔍 Test ${i + 1}: ${quoteId}`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quoteId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const opt = result.optimization;
        console.log(`   ✅ Original: ${opt.originalAmount?.toLocaleString() || 'N/A'} FCFA`);
        console.log(`   💡 Suggéré: ${opt.suggestedAmount?.toLocaleString() || 'N/A'} FCFA`);
        console.log(`   📈 Optimisation: ${opt.optimizationPercentage || 'N/A'}%`);
        console.log(`   🎯 Conversion: ${Math.round((opt.conversionProbability || 0) * 100)}%`);
        console.log(`   💪 Confiance: ${Math.round((opt.confidence || 0) * 100)}%`);
        console.log(`   📝 Raison: ${(opt.reasoning || 'Aucune').substring(0, 60)}...`);
      } else {
        console.log(`   ⚠️  Erreur API: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    console.log('');
    
    // Pause entre les appels
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✨ Test terminé !');
}

// Fonction pour tester avec de vrais devis (si disponibles)
async function testWithRealQuotes() {
  console.log('🔍 Recherche de vrais devis dans la base...\n');
  
  try {
    // Récupérer quelques devis réels
    const response = await fetch(`${SUPABASE_URL}/rest/v1/devis?select=id,amount,description&limit=3`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      const quotes = await response.json();
      console.log(`📋 ${quotes.length} devis trouvés`);
      
      for (const quote of quotes) {
        console.log(`\n🔍 Test avec devis réel: ${quote.id}`);
        console.log(`   💰 Montant: ${quote.amount?.toLocaleString() || 'N/A'} FCFA`);
        console.log(`   📝 Description: ${(quote.description || 'Aucune').substring(0, 50)}...`);
        
        try {
          const optResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quoteId: quote.id })
          });
          
          if (optResponse.ok) {
            const result = await optResponse.json();
            if (result.success) {
              const opt = result.optimization;
              console.log(`   ✅ Optimisation générée:`);
              console.log(`      💡 Nouveau montant: ${opt.suggestedAmount?.toLocaleString() || 'N/A'} FCFA`);
              console.log(`      📈 Variation: ${opt.optimizationPercentage || 'N/A'}%`);
              console.log(`      🎯 Probabilité conversion: ${Math.round((opt.conversionProbability || 0) * 100)}%`);
            } else {
              console.log(`   ⚠️  Erreur optimisation: ${result.error}`);
            }
          } else {
            console.log(`   ❌ Erreur HTTP: ${optResponse.status}`);
          }
        } catch (error) {
          console.log(`   ❌ Erreur: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      console.log('❌ Impossible de récupérer les devis réels');
      console.log('🔄 Passage aux tests avec IDs fictifs...\n');
      await testAIOptimization();
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    console.log('🔄 Passage aux tests avec IDs fictifs...\n');
    await testAIOptimization();
  }
}

// Lancer le test
console.log('🚀 Démarrage du test d\'optimisation IA\n');
testWithRealQuotes().catch(console.error);
