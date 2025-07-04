// Script de test pour l'Edge Function Dashboard Analytics IA
// Pour tester: node test-dashboard-analytics.js

const testDashboardAnalytics = async () => {
  try {
    console.log('🧪 Test de l\'Edge Function Dashboard Analytics IA...');
    
    // URL de l'Edge Function déployée
    const edgeFunctionUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dashboard-analytics-generator';
    
    // Données de test
    const testPayload = {
      user_id: 'test-user-123',
      role: 'admin',
      company_id: 'test-company-456',
      period_days: 30
    };
    
    console.log('📤 Envoi de la requête avec payload:', testPayload);
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Token de test
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📥 Statut de la réponse:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur de la fonction:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Réponse reçue avec succès!');
    console.log('📊 Résumé IA:', result.summary?.substring(0, 100) + '...');
    console.log('🔢 Métriques:', {
      tickets: result.metrics?.tickets?.total || 'N/A',
      revenue: result.metrics?.financial?.total_revenue || 'N/A',
      insights: result.insights?.length || 0
    });
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
};

// Exécuter le test
testDashboardAnalytics();
