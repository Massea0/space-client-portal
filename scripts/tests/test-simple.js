// Script simple pour tester la fonction payment-status

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config(); // Chargement des variables d'environnement

// Paramètres pour le test
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL Supabase:', supabaseUrl);

// Transaction et facture de test
const testTransactionId = process.argv[2] || 'test-transaction';
const testInvoiceId = process.argv[3] || 'test-invoice';

// Initialisation du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPaymentStatusFunction() {
  console.log(`Vérification du statut pour la transaction: ${testTransactionId}, facture: ${testInvoiceId}...`);
  
  try {
    // Appel à la fonction payment-status déployée
    const { data, error } = await supabase.functions.invoke('payment-status', {
      body: {
        transactionId: testTransactionId,
        invoiceId: testInvoiceId,
        _t: Date.now() // Paramètre anti-cache
      }
    });
    
    if (error) {
      console.error('Erreur lors de l\'appel à payment-status:', error);
      return;
    }
    
    // Affichage des résultats
    console.log('\nRésultat de la fonction payment-status:');
    console.log(JSON.stringify(data, null, 2));
    
    // Analyse du résultat
    console.log('\nAnalyse du résultat:');
    console.log('- Status transaction:', data.status);
    console.log('- Status facture:', data.invoiceStatus);
    console.log('- ID transaction:', data.transactionId);
    console.log('- ID externe:', data.externalTransactionId || 'Non disponible');
    
    // Vérification des champs essentiels
    if (data.status && data.transactionId) {
      console.log('\n✅ Les données essentielles sont bien remontées');
    } else {
      console.log('\n❌ Des données essentielles sont manquantes dans la réponse');
    }
  } catch (err) {
    console.error('Erreur lors du test:', err);
  }
}

// Exécution du test
testPaymentStatusFunction();
