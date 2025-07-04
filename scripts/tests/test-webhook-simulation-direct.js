import 'dotenv/config'; // Charge les variables d'environnement depuis .env
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`;
const INVOICE_ID = process.argv[2]; // ID de la facture à marquer comme payée
const TRANSACTION_ID = `test-txn-${Date.now()}`;
const WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET || "dexchange-wehook-secure-key-2025";

if (!INVOICE_ID) {
  console.error("Veuillez fournir un ID de facture en argument");
  console.log("Usage: node test-webhook-simulation-direct.js [invoice_id]");
  process.exit(1);
}

async function simulateWebhook() {
  console.log(`Simulation d'un webhook Dexchange pour la facture ${INVOICE_ID}`);
  console.log(`URL de fonction: ${SUPABASE_FUNCTION_URL}`);
  
  // Création d'un payload simulant un webhook Dexchange
  const webhookPayload = {
    type: 'payment.completed', // Type d'événement
    data: {
      object: {
        id: TRANSACTION_ID,
        transactionId: TRANSACTION_ID,
        transaction_id: TRANSACTION_ID,
        status: 'SUCCESS',
        metadata: JSON.stringify({
          invoice_id: INVOICE_ID
        }),
        invoice_id: INVOICE_ID, // Format direct
        invoiceId: INVOICE_ID, // Format camelCase
        invoice: INVOICE_ID // Format court
      }
    }
  };
  
  try {
    console.log(`URL d'appel: ${SUPABASE_FUNCTION_URL}`);
    
    // Simulation d'un appel webhook
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Dexchange-Signature': WEBHOOK_SECRET, // Utilisation du secret configuré
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}` // Ajout de l'authentification
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook simulé avec succès:');
      console.log(data);
    } else {
      const errorText = await response.text();
      console.error(`❌ Échec du webhook (${response.status}):`, errorText);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du webhook:', error.message);
  }
}

// Exécution du test
simulateWebhook();
