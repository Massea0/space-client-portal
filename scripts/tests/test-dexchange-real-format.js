import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`;
const INVOICE_ID = process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0';
const TRANSACTION_ID = `TIDX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
const WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET || "dexchange-wehook-secure-key-2025";

async function simulateWebhook() {
  console.log(`Simulation d'un webhook Dexchange au format réel pour la facture ${INVOICE_ID}`);
  console.log(`URL de fonction: ${SUPABASE_FUNCTION_URL}`);
  
  // Format exact observé par reverse engineering de Dexchange
  const webhookPayload = {
    transaction: {
      id: TRANSACTION_ID,
      status: "SUCCESS",
      service: "OM_SN_CASHOUT",
      amount: 10000,
      fee: 500,
      number: "776543210",
      currency: "XOF",
      externalId: `INV-${INVOICE_ID.substring(0, 8)}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ajout direct de l'ID de facture au format UUID
      invoice_id: INVOICE_ID
    },
    metadata: JSON.stringify({
      invoice_id: INVOICE_ID,
      payment_method: "orange_money"
    })
  };
  
  try {
    // Headers différents utilisés par Dexchange (à tester)
    const headers = {
      'X-Dexchange-Signature': WEBHOOK_SECRET,
      'X-Webhook-Signature': WEBHOOK_SECRET,
      'Dexchange-Signature': WEBHOOK_SECRET
    };
    
    // Nécessaire pour l'authentification à Supabase
    const authHeader = {
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    };
    
    // Essayons différents formats d'en-têtes, un par un
    for (const [headerName, headerValue] of Object.entries(headers)) {
      console.log(`\n🔄 Test avec en-tête: ${headerName}`);
      
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          [headerName]: headerValue
        },
        body: JSON.stringify(webhookPayload)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Succès avec en-tête ${headerName}:`, data);
      } else {
        const errorText = await response.text();
        console.error(`❌ Échec avec en-tête ${headerName} (${response.status}):`, errorText);
      }
    }
    
    // Essayons aussi sans en-tête d'authentification de signature (mais avec l'en-tête Bearer)
    console.log(`\n🔄 Test sans en-tête de signature, juste l'authentification`);
    const noAuthResponse = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (noAuthResponse.ok) {
      const data = await noAuthResponse.json();
      console.log(`✅ Succès sans authentification:`, data);
    } else {
      const errorText = await noAuthResponse.text();
      console.error(`❌ Échec sans authentification (${noAuthResponse.status}):`, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du webhook:', error.message);
  }
}

// Exécution du test
simulateWebhook();
