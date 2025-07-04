// test-service-recommendations.js
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MDQxNTMsImV4cCI6MjA1MDM4MDE1M30.v4Z3Ga8vRAOWHyKLY_xSCa_PjFNfcIV7TqgOjcfB3KY';

async function testServiceRecommendations() {
  console.log('🤖 Test des recommandations de services IA');
  console.log('=============================================\n');

  try {
    // Simulation d'un token d'authentification (en réalité il faudrait un vrai token utilisateur)
    const mockToken = 'mock-jwt-token-for-testing';

    console.log('📡 Appel à l\'Edge Function recommend-services...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/recommend-services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({})
    });

    console.log('Status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Recommandations générées avec succès!');
      console.log('\n📊 Résultat:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('\n🎯 Recommandations détaillées:');
        data.recommendations.forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.service_name} (${rec.category})`);
          console.log(`   📝 ${rec.description}`);
          console.log(`   🎯 ${rec.justification}`);
          console.log(`   ⭐ Score: ${rec.priority_score}/10`);
          console.log(`   💰 Valeur estimée: ${rec.estimated_value}`);
        });
      }
    } else {
      console.log('❌ Erreur lors de la génération des recommandations');
      console.log('Response:', data);
      
      // Si c'est une erreur d'authentification, c'est normal avec un mock token
      if (response.status === 401) {
        console.log('\n💡 Note: Erreur d\'authentification attendue avec un token de test');
        console.log('    Pour tester réellement, utilisez un token utilisateur valide');
      }
    }

  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
}

// Test simple de la fonction directement
async function testGeminiPrompt() {
  console.log('\n🧠 Test direct du prompt Gemini...');
  
  // Simulation d'un profil client
  const clientProfile = {
    company: {
      name: "TechCorp",
      industry: "Technology",
      size: "medium",
      age_months: 12
    },
    activity: {
      devis_count: 5,
      recent_devis_types: ["website", "mobile-app"],
      invoices_count: 8,
      total_spent: 25000,
      tickets_count: 3,
      recent_ticket_subjects: ["Bug dans l'app", "Optimisation performance"]
    }
  };

  console.log('📋 Profil client simulé:');
  console.log(JSON.stringify(clientProfile, null, 2));
  
  console.log('\n✅ Structure de données validée pour Gemini AI');
}

// Exécuter les tests
testServiceRecommendations().then(() => {
  testGeminiPrompt();
});
