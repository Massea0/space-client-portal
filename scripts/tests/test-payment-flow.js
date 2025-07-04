// test-payment-flow.js
// Test complet du flux de paiement en simulant les différentes étapes
// Usage: node test-payment-flow.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Paramètres de connexion
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ID de facture à tester - utiliser une facture marquée comme "paid"
const invoiceId = '197dc760-08a2-4e18-884d-098c1bcd08d0';

// Fonction pour simuler le webhook Dexchange (dexchange-callback-handler)
async function simulateWebhook(invoiceId, transactionId) {
  console.log(`🔔 Simulation d'un webhook pour la facture ${invoiceId} avec la transaction ${transactionId}`);
  
  const webhook = {
    event: 'TRANSACTION_COMPLETED',
    data: {
      transactionId: transactionId,
      externalTransactionId: `INV-${invoiceId}-${Date.now()}`,
      status: 'COMPLETED',
      amount: 200,
      completed_at: new Date().toISOString(),
      metadata: {
        invoice_id: invoiceId
      }
    }
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'x-webhook-secret': process.env.DEXCHANGE_WEBHOOK_SECRET || 'test-secret' // Simuler le secret du webhook
      },
      body: JSON.stringify(webhook)
    });
    
    const result = await response.json();
    console.log('✅ Réponse du webhook:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du webhook:', error);
    return null;
  }
}

// Fonction pour vérifier le statut d'une facture
async function checkInvoiceStatus(invoiceId) {
  console.log(`🔍 Vérification du statut de la facture ${invoiceId}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-status?invoiceId=${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    const result = await response.json();
    console.log('✅ Statut actuel:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    return null;
  }
}

// Fonction principale auto-exécutée
(async function main() {
  try {
    // 1. Vérifier l'état initial
    console.log('🚀 ÉTAPE 1: Vérification du statut initial');
    const initialStatus = await checkInvoiceStatus(invoiceId);
    
    // 2. Simuler un webhook pour cette facture
    console.log('\n🚀 ÉTAPE 2: Simulation d\'un webhook Dexchange');
    const transactionId = `TID${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    await simulateWebhook(invoiceId, transactionId);
    
    // 3. Vérifier le statut final après webhook
    console.log('\n🚀 ÉTAPE 3: Vérification du statut après webhook');
    const finalStatus = await checkInvoiceStatus(invoiceId);
    
    // 4. Comparer les résultats
    console.log('\n📊 RÉSULTATS:');
    console.log(`  - Statut initial: ${initialStatus.status}`);
    console.log(`  - Statut final: ${finalStatus.status}`);
    
    if (finalStatus.status === 'paid') {
      console.log('🎉 SUCCÈS: Le flux de paiement fonctionne correctement!');
    } else {
      console.log('❌ ÉCHEC: Le statut n\'est pas "paid" après le webhook.');
    }
    
  } catch (error) {
    console.error('❌ Erreur non gérée:', error);
  }
})();
