// Test de l'Edge Function Dashboard Analytics avec authentification
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE';

async function testDashboardAnalytics() {
  console.log('🧪 Test de l\'Edge Function Dashboard Analytics avec authentification...');
  
  try {
    console.log('� Appel de l\'Edge Function avec clé anon...');
    
    // Test avec la clé anon (simule le frontend)
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/dashboard-analytics-generator`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period_days: 30
        }),
      }
    );

    console.log(`📥 Statut de la réponse: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse de la fonction:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur de la fonction:', JSON.stringify(errorData, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDashboardAnalytics();
