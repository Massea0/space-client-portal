// Test des optimisations IA sélectives sur les devis
// Ce fichier peut être utilisé pour tester manuellement les fonctionnalités

import { aiService } from './src/services/aiService.js';

async function testSelectiveOptimizations() {
  console.log('🧪 Test des optimisations IA sélectives');
  
  // Test quote ID (remplacer par un vrai ID de devis)
  const testQuoteId = 'test-quote-id';
  
  try {
    console.log('\n1. Test génération d\'optimisation...');
    // const optimization = await aiService.optimizeQuote(testQuoteId);
    // console.log('✅ Optimisation générée:', optimization);
    
    console.log('\n2. Test application sélective de la description...');
    // const descSuccess = await aiService.applyDescriptionOptimization(
    //   testQuoteId, 
    //   'Nouvelle description optimisée par l\'IA'
    // );
    // console.log('✅ Description appliquée:', descSuccess);
    
    console.log('\n3. Test application sélective du prix...');
    // const priceSuccess = await aiService.applyPricingOptimization(
    //   testQuoteId, 
    //   15000 // Nouveau montant optimisé
    // );
    // console.log('✅ Prix appliqué:', priceSuccess);
    
    console.log('\n4. Test application sélective des conditions...');
    // const termsSuccess = await aiService.applyTermsOptimization(
    //   testQuoteId, 
    //   'Nouvelles conditions commerciales optimisées'
    // );
    // console.log('✅ Conditions appliquées:', termsSuccess);
    
    console.log('\n🎉 Tous les tests sont configurés et prêts');
    console.log('💡 Décommentez les lignes pour exécuter les vrais tests');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Instructions d'utilisation
console.log(`
📋 Instructions pour tester l'optimisation IA sélective:

1. 🎯 Dans l'interface utilisateur:
   - Ouvrez un devis existant
   - Cliquez sur "Optimiser avec l'IA" dans le panel QuoteOptimizationPanel
   - Attendez que l'IA génère les recommandations
   
2. 🎛️ Application sélective:
   - Utilisez le bouton "Appliquer Description" pour appliquer uniquement les améliorations de description
   - Utilisez le bouton "Appliquer Prix" pour appliquer uniquement l'optimisation tarifaire
   - Utilisez le bouton "Appliquer Conditions" pour appliquer uniquement les conditions commerciales
   - Ou utilisez le bouton principal "Appliquer l'Optimisation" pour tout appliquer d'un coup

3. 🔍 Validation:
   - Vérifiez que seuls les éléments sélectionnés sont modifiés dans le devis
   - Contrôlez que les notifications s'affichent correctement
   - Confirmez que le state du panel se met à jour appropriément

4. 🎨 Éléments UI ajoutés:
   - Boutons d'application sélective dans chaque section de recommandations
   - État de chargement (applying) pendant l'application
   - Messages de succès/erreur spécifiques à chaque type d'optimisation
   - Gestion des erreurs avec feedback utilisateur

Fonctionnalités disponibles:
✅ Génération d'optimisations IA complètes
✅ Application automatique de toutes les optimisations
✅ Application sélective de la description
✅ Application sélective des prix
✅ Application sélective des conditions commerciales
✅ Gestion des états de chargement et d'erreur
✅ Interface utilisateur intuitive avec boutons dédiés
`);

// Exporter pour utilisation dans d'autres tests
export { testSelectiveOptimizations };
