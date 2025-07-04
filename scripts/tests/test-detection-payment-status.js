// test-detection-payment-status.js
// Test pour vérifier que le frontend détecte correctement le statut de paiement
import fetch from 'node-fetch';

// Configuration pour les tests
const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc";

// ID de la facture à tester (fourni en argument ou valeur par défaut)
const INVOICE_ID = process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0';
const TRANSACTION_ID = 'TEST-' + Date.now();

// Fonction pour tester l'endpoint payment-status (utilisé par le frontend)
async function testerPaymentStatus() {
  console.log('🔍 Test de l\'endpoint payment-status...');
  
  try {
    // Construction de l'URL avec les paramètres
    const queryParams = new URLSearchParams();
    queryParams.append('invoiceId', INVOICE_ID);
    queryParams.append('transactionId', TRANSACTION_ID);
    
    const url = `${SUPABASE_URL}/functions/v1/payment-status?${queryParams.toString()}`;
    
    console.log('URL appelée:', url);
    
    // Envoi de la requête à l'endpoint payment-status
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    // Récupération et affichage du résultat
    const data = await response.json();
    console.log('✅ Réponse de payment-status:', data);
    
    // Vérification du comportement attendu
    if (data.status === 'paid' || data.status === 'completed') {
      console.log('✅ TEST RÉUSSI: Le statut "paid" est correctement détecté');
    } else {
      console.log(`❌ TEST ÉCHOUÉ: Le statut retourné est "${data.status}" au lieu de "paid"`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du test de payment-status:', error.message);
    throw error;
  }
}

// Fonction principale d'exécution des tests
async function executerTests() {
  console.log('🧪 Démarrage des tests de détection de statut...');
  
  try {
    // Test du point de terminaison payment-status
    console.log('\n📊 Test du endpoint payment-status');
    await testerPaymentStatus();
    
  } catch (error) {
    console.error('❌ ERREUR LORS DES TESTS:', error.message);
  }
}

// Exécution des tests
executerTests();
