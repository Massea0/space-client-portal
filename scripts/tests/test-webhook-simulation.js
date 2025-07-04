// Simuler un webhook De
import fetch from 'node-fetch';
import { config } from 'dotenv';
config({ path: './.env.test' }); // Charger env depuis .env.test

// Configuration 
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`;
const WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET || 'test-webhook-secret-123';

// Identifiants de test - utilisation de vraies données de la base
// Données réelles fournies par l'utilisateur
const REAL_INVOICE_ID = '197dc760-08a2-4e18-884d-098c1bcd08d0'; // ID réel de l'invoice
const REAL_TRANSACTION_ID = 'TID4RUNWZ08ZY3'; // ID de transaction existant

// Priorité aux arguments de ligne de commande, sinon utiliser les vraies données
const transactionId = process.argv[2] || REAL_TRANSACTION_ID;
const invoiceId = process.argv[3] || REAL_INVOICE_ID;
const statusToSimulate = process.argv[4] || 'COMPLETED'; // COMPLETED, FAILED, PENDING

console.log('Configuration:');
console.log(`URL Webhook: ${WEBHOOK_URL}`);
console.log(`Simulation avec: Transaction=${transactionId}, Invoice=${invoiceId}, Status=${statusToSimulate}`);

// Payload au format attendu par la version déployée (payment_intent.succeeded)
const webhookPayload = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: transactionId,
      status: statusToSimulate,
      amount: 10000, 
      currency: 'XOF',
      created_at: new Date().toISOString(),
      metadata: {
        invoice_id: invoiceId,
        phone_number: '771234567',
        operator: 'WAVE'
      }
    }
  }
};

// Envoi du webhook
async function sendWebhook() {
  try {
    console.log('\nEnvoi du webhook avec payload:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const responseText = await response.text();
    
    console.log(`\nRéponse du webhook (${response.status} ${response.statusText}):`);
    try {
      console.log(JSON.stringify(JSON.parse(responseText), null, 2));
    } catch {
      console.log(responseText);
    }
    
    // Vérifier le statut après simulation du webhook
    await checkStatus();
  } catch (error) {
    console.error('Erreur lors de l\'envoi du webhook:', error);
  }
}

// Vérifier le statut de la transaction après le webhook
async function checkStatus() {
  try {
    console.log('\nAttente de 2 secondes pour laisser le temps à la base de données de se mettre à jour...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Vérification du statut après le webhook:');
    
    const statusUrl = `${SUPABASE_URL}/functions/v1/payment-status`;
    console.log(`URL de vérification: ${statusUrl}`);
    
    const statusResponse = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        invoiceId,
        _t: Date.now()
      })
    });
    
    const statusData = await statusResponse.json();
    
    console.log('\nStatut actuel:');
    console.log(JSON.stringify(statusData, null, 2));
    
    // Vérifier que le statut correspond à ce qui a été simulé
    const expectedStatus = statusToSimulate.toLowerCase() === 'completed' ? 'paid' : 
                          statusToSimulate.toLowerCase() === 'failed' ? 'failed' : 'pending';
    
    if (statusData.status === expectedStatus) {
      console.log(`\n✅ SUCCÈS: Le statut "${statusData.status}" correspond au statut simulé "${statusToSimulate}"`);
    } else {
      console.log(`\n❌ ÉCHEC: Le statut "${statusData.status}" ne correspond pas au statut simulé "${expectedStatus}"`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
  }
}

// Exécuter la simulation
sendWebhook();
