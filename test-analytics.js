// Script de test pour diagnostiquer l'authentification et l'Edge Function
// Exécuter dans la console du navigateur

async function testAnalyticsFunction() {
  console.log('🧪 Test Edge Function Analytics...');
  
  try {
    // Récupérer la session
    const session = await window.supabase.auth.getSession();
    console.log('📋 Session:', session.data.session ? 'Connecté' : 'Non connecté');
    
    if (!session.data.session) {
      console.log('❌ Utilisateur non connecté - Tentative de connexion...');
      
      // Tentative de connexion avec des credentials par défaut
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email: 'admin@arcadisspace.com',
        password: 'admin123'
      });
      
      if (error) {
        console.error('❌ Erreur connexion:', error);
        return;
      }
      
      console.log('✅ Connexion réussie:', data.user.email);
    }
    
    // Test de l'Edge Function
    console.log('🚀 Appel Edge Function...');
    const response = await fetch(
      'https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/dashboard-analytics-generator',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period_days: 30 }),
      }
    );
    
    console.log('📊 Statut réponse:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données reçues:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

// Exécuter le test
testAnalyticsFunction();
