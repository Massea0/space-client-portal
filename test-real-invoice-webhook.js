// test-real-invoice-webhook.js
// Script pour tester le webhook avec une facture existante

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WEBHOOK_SECRET = 'dexchange-webhooks-secret-2025';
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  try {
    console.log('🔍 Recherche d\'une facture non payée...');
    
    // Chercher une facture non payée
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, number, total_amount, client_id')
      .neq('status', 'paid')
      .limit(1);
      
    if (error) throw error;
    if (!invoices || invoices.length === 0) {
      console.log('❌ Aucune facture non payée trouvée.');
      return;
    }
    
    const invoice = invoices[0];
    console.log('✅ Facture trouvée:', invoice);
    
    // Générer un ID de transaction unique
    const transactionId = `TEST_TXN_${Date.now()}`;
    
    // Simuler un webhook de paiement réussi
    console.log(`📤 Envoi du webhook pour la facture ${invoice.id}...`);
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({
        event: 'payment.succeeded',
        type: 'payment.succeeded',
        data: {
          object: {
            id: transactionId,
            status: 'succeeded',
            amount: invoice.total_amount || 5000,
            currency: 'XOF',
            payment_method: 'wave',
            metadata: {
              invoice_id: invoice.id,
              test: true
            }
          }
        }
      })
    });
    
    const result = await response.json();
    console.log(`📥 Réponse du webhook (${response.status}):`, result);
    
    // Vérifier que la facture est maintenant marquée comme payée
    const { data: updatedInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id, status, payment_status, payment_date, payment_reference')
      .eq('id', invoice.id)
      .single();
      
    if (checkError) {
      console.log('❌ Erreur lors de la vérification de la facture:', checkError);
      return;
    }
    
    console.log('📋 État de la facture après webhook:', updatedInvoice);
    
    if (updatedInvoice.status === 'paid') {
      console.log('✅ TEST RÉUSSI: La facture a été correctement marquée comme payée!');
    } else {
      console.log('❌ TEST ÉCHOUÉ: La facture n\'a pas été marquée comme payée.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le test
main();
