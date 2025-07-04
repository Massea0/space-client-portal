#!/usr/bin/env node

/**
 * Test automatisé pour vérifier que l'optimisation IA utilise original_amount
 * et évite les cascades de réductions
 */

const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTk5NDIxMiwiZXhwIjoyMDQxNTcwMjEyfQ.YWDqHMqZQ0gBfOkL-1QbqINLjNGOxczjCFBFBRqOmxs";

// ID du devis de test (doit exister dans la base)
const TEST_QUOTE_ID = "e43db7e8-f831-4055-8a97-9734d67429ff";

async function testOriginalAmountFix() {
  console.log("🔬 TEST ANTI-CASCADE : Vérification original_amount");
  console.log("=" .repeat(60));

  try {
    // 1. Récupérer l'état actuel du devis
    console.log("\n📋 1. État initial du devis...");
    const devisResponse = await fetch(`${SUPABASE_URL}/rest/v1/devis?id=eq.${TEST_QUOTE_ID}&select=*`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!devisResponse.ok) {
      throw new Error(`Erreur récupération devis: ${devisResponse.status}`);
    }

    const devisData = await devisResponse.json();
    if (!devisData || devisData.length === 0) {
      throw new Error("Devis non trouvé");
    }

    const devis = devisData[0];
    console.log(`   💰 Montant actuel: ${devis.amount.toLocaleString()} FCFA`);
    console.log(`   💾 Montant original: ${devis.original_amount ? devis.original_amount.toLocaleString() + ' FCFA' : 'Non défini'}`);

    // 2. Première optimisation
    console.log("\n🧠 2. Première optimisation IA...");
    const firstOptimization = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({
        quoteId: TEST_QUOTE_ID
      })
    });

    if (!firstOptimization.ok) {
      const errorText = await firstOptimization.text();
      throw new Error(`Erreur première optimisation: ${firstOptimization.status} - ${errorText}`);
    }

    const firstResult = await firstOptimization.json();
    console.log(`   📊 Résultat 1:`);
    console.log(`      Original: ${firstResult.optimization.originalAmount.toLocaleString()} FCFA`);
    console.log(`      Suggéré: ${firstResult.optimization.suggestedAmount.toLocaleString()} FCFA`);
    console.log(`      Variation: ${firstResult.optimization.optimizationPercentage}%`);

    // Attendre 3 secondes
    console.log("\n⏱️  Attente de 3 secondes...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Deuxième optimisation (test anti-cascade)
    console.log("\n🔄 3. Deuxième optimisation IA (test anti-cascade)...");
    const secondOptimization = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({
        quoteId: TEST_QUOTE_ID
      })
    });

    if (!secondOptimization.ok) {
      const errorText = await secondOptimization.text();
      throw new Error(`Erreur deuxième optimisation: ${secondOptimization.status} - ${errorText}`);
    }

    const secondResult = await secondOptimization.json();
    console.log(`   📊 Résultat 2:`);
    console.log(`      Original: ${secondResult.optimization.originalAmount.toLocaleString()} FCFA`);
    console.log(`      Suggéré: ${secondResult.optimization.suggestedAmount.toLocaleString()} FCFA`);
    console.log(`      Variation: ${secondResult.optimization.optimizationPercentage}%`);

    // 4. Analyse des résultats
    console.log("\n📈 4. Analyse ANTI-CASCADE...");
    
    const sameOriginal = firstResult.optimization.originalAmount === secondResult.optimization.originalAmount;
    const firstSuggested = firstResult.optimization.suggestedAmount;
    const secondSuggested = secondResult.optimization.suggestedAmount;
    const variationBetweenSuggestions = Math.abs(firstSuggested - secondSuggested) / firstSuggested * 100;
    
    console.log(`   🎯 Montant original cohérent: ${sameOriginal ? '✅ OUI' : '❌ NON'}`);
    console.log(`   🔄 Variation entre suggestions: ${variationBetweenSuggestions.toFixed(2)}%`);
    
    if (sameOriginal) {
      console.log(`   ✅ SUCCESS: Même montant original utilisé dans les deux optimisations`);
      console.log(`   📝 Base de référence: ${firstResult.optimization.originalAmount.toLocaleString()} FCFA`);
      
      if (variationBetweenSuggestions < 5) {
        console.log(`   ✅ EXCELLENT: Suggestions cohérentes (écart < 5%)`);
      } else {
        console.log(`   ⚠️  ATTENTION: Écart important entre les suggestions (${variationBetweenSuggestions.toFixed(2)}%)`);
      }
    } else {
      console.log(`   ❌ PROBLÈME: Montants originaux différents`);
      console.log(`   📝 Optim 1: ${firstResult.optimization.originalAmount.toLocaleString()} FCFA`);
      console.log(`   📝 Optim 2: ${secondResult.optimization.originalAmount.toLocaleString()} FCFA`);
    }

    // 5. Vérifier l'état final du devis dans la base
    console.log("\n🔍 5. État final du devis dans la base...");
    const finalDevisResponse = await fetch(`${SUPABASE_URL}/rest/v1/devis?id=eq.${TEST_QUOTE_ID}&select=*`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (finalDevisResponse.ok) {
      const finalDevisData = await finalDevisResponse.json();
      if (finalDevisData && finalDevisData.length > 0) {
        const finalDevis = finalDevisData[0];
        console.log(`   💰 Montant final: ${finalDevis.amount.toLocaleString()} FCFA`);
        console.log(`   💾 Original final: ${finalDevis.original_amount ? finalDevis.original_amount.toLocaleString() + ' FCFA' : 'Non défini'}`);
        
        if (finalDevis.original_amount) {
          console.log(`   ✅ SUCCESS: La colonne original_amount est sauvegardée`);
        } else {
          console.log(`   ⚠️  INFO: La colonne original_amount va être créée au prochain appel`);
        }
      }
    }

    // 6. Résumé du test
    console.log("\n🎯 6. RÉSUMÉ DU TEST");
    console.log("=" .repeat(60));
    
    if (sameOriginal && variationBetweenSuggestions < 10) {
      console.log("✅ TEST RÉUSSI : L'optimisation IA est fixée !");
      console.log("🔧 Le système utilise bien original_amount comme référence");
      console.log("🚫 Plus de cascades de réductions excessives");
      console.log("📊 Les optimisations sont cohérentes et prévisibles");
    } else {
      console.log("❌ TEST PARTIELLEMENT RÉUSSI");
      if (!sameOriginal) {
        console.log("🔧 PROBLÈME : original_amount pas cohérent");
      }
      if (variationBetweenSuggestions >= 10) {
        console.log("🔧 PROBLÈME : Trop de variation entre les suggestions");
      }
    }

    console.log("\n🎉 TEST TERMINÉ");

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log("\n🔧 Vérifications:");
    console.log("   1. Edge function déployée ?");
    console.log("   2. Devis existe dans la base ?");
    console.log("   3. Service key valide ?");
    process.exit(1);
  }
}

// Exécution
testOriginalAmountFix();
