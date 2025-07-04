// Test de l'optimisation IA avec des devis réels
// Ce script teste que l'IA génère des optimisations différentes pour chaque devis

import { aiService } from './src/services/aiService.js';

async function testMultipleQuoteOptimizations() {
  console.log('🧪 Test de variabilité des optimisations IA');
  console.log('===============================================\n');
  
  // IDs de devis de test (remplacer par de vrais IDs)
  const testQuoteIds = [
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
  ];
  
  const optimizations = [];
  
  try {
    console.log('📊 Génération des optimisations pour chaque devis...\n');
    
    for (let i = 0; i < testQuoteIds.length; i++) {
      const quoteId = testQuoteIds[i];
      console.log(`🔍 Test devis ${i + 1}: ${quoteId}`);
      
      try {
        const optimization = await aiService.optimizeQuote(quoteId);
        optimizations.push({
          quoteId,
          optimization
        });
        
        console.log(`   ✅ Original: ${optimization.originalAmount.toLocaleString()} FCFA`);
        console.log(`   💡 Suggéré: ${optimization.suggestedAmount.toLocaleString()} FCFA`);
        console.log(`   📈 Optimisation: ${optimization.optimizationPercentage}%`);
        console.log(`   🎯 Conversion: ${Math.round(optimization.conversionProbability * 100)}%`);
        console.log(`   💪 Confiance: ${Math.round(optimization.confidence * 100)}%`);
        console.log(`   📝 Raison: ${optimization.reasoning.substring(0, 80)}...`);
        console.log('');
        
        // Pause entre les appels
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
      }
    }
    
    // Analyse de la variabilité
    console.log('\n📈 Analyse de la variabilité des résultats:');
    console.log('===============================================');
    
    if (optimizations.length > 1) {
      const amounts = optimizations.map(o => o.optimization.suggestedAmount);
      const percentages = optimizations.map(o => o.optimization.optimizationPercentage);
      const conversions = optimizations.map(o => o.optimization.conversionProbability);
      
      const uniqueAmounts = new Set(amounts).size;
      const uniquePercentages = new Set(percentages).size;
      const uniqueConversions = new Set(conversions).size;
      
      console.log(`💰 Montants uniques: ${uniqueAmounts}/${amounts.length}`);
      console.log(`📊 Pourcentages uniques: ${uniquePercentages}/${percentages.length}`);
      console.log(`🎯 Probabilités uniques: ${uniqueConversions}/${conversions.length}`);
      
      if (uniqueAmounts === amounts.length) {
        console.log('✅ Excellente variabilité des montants optimisés');
      } else if (uniqueAmounts > 1) {
        console.log('⚠️  Variabilité partielle des montants');
      } else {
        console.log('❌ Aucune variabilité - problème détecté');
      }
      
      // Statistiques détaillées
      const minAmount = Math.min(...amounts);
      const maxAmount = Math.max(...amounts);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      console.log(`\n📊 Statistiques des montants optimisés:`);
      console.log(`   Min: ${minAmount.toLocaleString()} FCFA`);
      console.log(`   Max: ${maxAmount.toLocaleString()} FCFA`);
      console.log(`   Moyenne: ${Math.round(avgAmount).toLocaleString()} FCFA`);
      console.log(`   Écart: ${((maxAmount - minAmount) / avgAmount * 100).toFixed(1)}%`);
      
      // Affichage des recommandations distinctes
      console.log(`\n💡 Exemples de recommandations personnalisées:`);
      optimizations.slice(0, 3).forEach((opt, i) => {
        console.log(`\nDevis ${i + 1}:`);
        console.log(`   Prix: ${opt.optimization.recommendations.pricing[0]}`);
        console.log(`   Description: ${opt.optimization.recommendations.description[0]}`);
        console.log(`   Conditions: ${opt.optimization.recommendations.terms[0]}`);
      });
    }
    
    console.log('\n🎉 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error);
  }
}

// Instructions d'utilisation
console.log(`
🚀 Test de Variabilité de l'IA d'Optimisation des Devis

Ce script teste que l'IA génère des optimisations personnalisées et variées
pour chaque devis, évitant le problème des "données mock" identiques.

📋 Vérifications effectuées:
1. Génération d'optimisations pour 5 devis différents
2. Analyse de la variabilité des montants suggérés
3. Vérification de la personnalisation des recommandations
4. Contrôle de la cohérence des probabilités de conversion

🔧 Pour exécuter le test:
1. Assurez-vous que la base de données contient des devis
2. Remplacez les IDs de test par de vrais IDs de devis
3. Exécutez: node test-ai-variability.js

💡 Résultats attendus:
- Chaque devis doit avoir des montants optimisés différents
- Les recommandations doivent être personnalisées
- Les pourcentages d'optimisation doivent varier selon les données
- Les raisons d'optimisation doivent mentionner des données spécifiques

⚠️  Si les résultats sont identiques, cela indique un problème
   dans l'algorithme d'optimisation ou l'utilisation de données mock.
`);

// Lancer le test automatiquement si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultipleQuoteOptimizations();
}

export { testMultipleQuoteOptimizations };
