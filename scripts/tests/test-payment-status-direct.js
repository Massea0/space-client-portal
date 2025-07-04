// test-payment-status-direct.js
// Test direct de la fonction payment-status pour vérifier qu'elle renvoie bien le statut "paid" pour une facture payée
// Usage: node test-payment-status-direct.js <invoice_id>

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Paramètres de connexion
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ID de facture à tester depuis les arguments de ligne de commande ou utiliser une valeur par défaut
const invoiceId = process.argv[2] || '197dc760-08a2-4e18-884d-098c1bcd08d0'; // La première facture de votre exemple

// Fonction principale auto-exécutée
(async function main() {
  try {
    console.log(`📊 Vérification directe du statut pour la facture ${invoiceId}`);
    
    // 1. Appel direct de la fonction via la clé anonyme
    console.log('🔄 Appel direct avec clé anonyme...');
    const anonResponse = await fetch(`${SUPABASE_URL}/functions/v1/payment-status?invoiceId=${invoiceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const anonResult = await anonResponse.json();
    console.log('✅ Résultat via clé anonyme:', JSON.stringify(anonResult, null, 2));
    
    // 2. Appel direct de la fonction via la clé de service
    console.log('🔄 Appel direct avec clé de service...');
    const serviceResponse = await fetch(`${SUPABASE_URL}/functions/v1/payment-status?invoiceId=${invoiceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    const serviceResult = await serviceResponse.json();
    console.log('✅ Résultat via clé de service:', JSON.stringify(serviceResult, null, 2));
    
    // 3. Vérifier les statuts
    console.log('\n📊 Résumé des statuts:');
    console.log(`  - Via clé anonyme: ${anonResult.status || 'erreur'}`);
    console.log(`  - Via clé de service: ${serviceResult.status || 'erreur'}`);
    
    if (anonResult.status === 'paid' && serviceResult.status === 'paid') {
      console.log('🎉 SUCCÈS: Tous les statuts sont cohérents (paid)');
    } else {
      console.log('⚠️ ATTENTION: Les statuts ne sont pas cohérents');
    }
    
  } catch (error) {
    console.error('❌ Erreur non gérée:', error);
  }
})();
