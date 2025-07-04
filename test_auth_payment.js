// Test d'authentification pour diagnostic paiement
// À exécuter dans la console du navigateur quand connecté à l'app

async function testAuthentication() {
  console.log('🔍 Test d\'authentification...');
  
  // Vérifier la session Supabase
  const { data: session, error: sessionError } = await window.supabase.auth.getSession();
  console.log('Session Supabase:', { session: !!session?.session, error: sessionError });
  
  if (session?.session) {
    console.log('✅ Utilisateur connecté:', session.session.user.email);
    console.log('🔑 Token JWT:', session.session.access_token.substring(0, 50) + '...');
    
    // Test direct de l'Edge Function avec le token
    try {
      const response = await fetch('https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          invoice_id: 'test-invoice-id',
          payment_method: 'wave',
          phone_number: '221777777777'
        })
      });
      
      console.log('📡 Statut réponse:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Réponse brute:', responseText);
      
      if (response.status === 400) {
        console.error('❌ Erreur 400 confirmée. Contenu:', responseText);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
    }
  } else {
    console.error('❌ Aucune session utilisateur trouvée');
  }
}

// Exécuter le test
testAuthentication();
