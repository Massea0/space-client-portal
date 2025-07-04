#!/usr/bin/env node

/**
 * Test pour vérifier que l'optimisation IA utilise bien original_amount
 * et n'itère pas en cascades de réductions
 */

const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5OTQyMTIsImV4cCI6MjA0MTU3MDIxMn0.kR3u-_8uu2oPq10TXzuhsOeLKHX-_HVdO3G_-aHJPGg";

// ID du devis de test (doit exister dans la base)
const TEST_QUOTE_ID = "e43db7e8-f831-4055-8a97-9734d67429ff";

async function testOriginalAmountFix() {
  console.log("🔬 TEST: Vérification que l'optimisation IA utilise original_amount");
  console.log("=" .repeat(70));

  try {
    // 1. Récupérer l'état actuel du devis
    console.log("\n📋 1. État actuel du devis...");
    const devisResponse = await fetch(`${SUPABASE_URL}/rest/v1/devis?id=eq.${TEST_QUOTE_ID}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
    console.log(`   💰 Montant actuel: ${devis.amount} FCFA`);
    console.log(`   💾 Montant original: ${devis.original_amount || 'Non défini'} FCFA`);

    // 2. Première optimisation
    console.log("\n🧠 2. Première optimisation IA...");
    const firstOptimization = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
    console.log(`      Original: ${firstResult.optimization.originalAmount} FCFA`);
    console.log(`      Suggéré: ${firstResult.optimization.suggestedAmount} FCFA`);
    console.log(`      Variation: ${firstResult.optimization.optimizationPercentage}%`);

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Deuxième optimisation (pour tester la cascade)
    console.log("\n🔄 3. Deuxième optimisation IA (test anti-cascade)...");
    const secondOptimization = await fetch(`${SUPABASE_URL}/functions/v1/ai-quote-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
    console.log(`      Original: ${secondResult.optimization.originalAmount} FCFA`);
    console.log(`      Suggéré: ${secondResult.optimization.suggestedAmount} FCFA`);
    console.log(`      Variation: ${secondResult.optimization.optimizationPercentage}%`);

    // 4. Analyse des résultats
    console.log("\n📈 4. Analyse des résultats...");
    
    const sameOriginal = firstResult.optimization.originalAmount === secondResult.optimization.originalAmount;
    const reasoningFirst = firstResult.optimization.reasoning || '';
    const reasoningSecond = secondResult.optimization.reasoning || '';
    
    console.log(`   🎯 Montant original cohérent: ${sameOriginal ? '✅ OUI' : '❌ NON'}`);
    
    if (sameOriginal) {
      console.log(`   ✅ SUCCESS: Les deux optimisations utilisent le même montant original`);
      console.log(`   📝 Montant de référence stable: ${firstResult.optimization.originalAmount} FCFA`);
    } else {
      console.log(`   ❌ PROBLÈME: Le montant original diffère entre les optimisations`);
      console.log(`   📝 Optim 1: ${firstResult.optimization.originalAmount} FCFA`);
      console.log(`   📝 Optim 2: ${secondResult.optimization.originalAmount} FCFA`);
    }

    // 5. Vérifier les raisonnements
    console.log("\n💭 5. Analyse des raisonnements...");
    console.log(`   🤖 Raisonnement 1: ${reasoningFirst.substring(0, 100)}...`);
    console.log(`   🤖 Raisonnement 2: ${reasoningSecond.substring(0, 100)}...`);

    // 6. Vérifier l'état final du devis dans la base
    console.log("\n🔍 6. État final du devis dans la base...");
    const finalDevisResponse = await fetch(`${SUPABASE_URL}/rest/v1/devis?id=eq.${TEST_QUOTE_ID}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (finalDevisResponse.ok) {
      const finalDevisData = await finalDevisResponse.json();
      if (finalDevisData && finalDevisData.length > 0) {
        const finalDevis = finalDevisData[0];
        console.log(`   💰 Montant final: ${finalDevis.amount} FCFA`);
        console.log(`   💾 Original final: ${finalDevis.original_amount || 'Non défini'} FCFA`);
        
        if (finalDevis.original_amount) {
          console.log(`   ✅ SUCCESS: La colonne original_amount est bien sauvegardée`);
        } else {
          console.log(`   ⚠️  ATTENTION: La colonne original_amount n'est pas encore sauvegardée`);
        }
      }
    }

    console.log("\n🎉 TEST TERMINÉ");
    console.log("=" .repeat(70));

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log("\n🔧 Suggestions:");
    console.log("   1. Vérifiez que le devis existe dans la base");
    console.log("   2. Vérifiez que l'edge function est déployée");
    console.log("   3. Vérifiez les logs Supabase pour plus de détails");
    process.exit(1);
  }
}

// Exécution
testOriginalAmountFix();
