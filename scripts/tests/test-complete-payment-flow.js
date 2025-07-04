require('dotenv').config(); // Charge les variables d'environnement depuis .env
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://yashaylcsxglyhnapvug.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.SITE_URL || "https://yashaylcsxglyhnapvug.supabase.co";

// Vérification des variables d'environnement
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error("Variables d'environnement manquantes. Assurez-vous que SUPABASE_URL, SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY sont définies.");
  process.exit(1);
}

// Initialisation des clients Supabase (anonyme et admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ID de facture pour le test (à passer en argument ou générer)
const INVOICE_ID = process.argv[2];

async function testCompletePaymentFlow() {
  console.log("🧪 Début du test de la chaîne de paiement complète");
  console.log("==============================================");
  
  // 1. Vérifier si un ID de facture a été fourni ou en créer un nouveau
  let invoiceId = INVOICE_ID;
  let paymentMethod = 'orange_money';
  let phoneNumber = '770000000';
  
  // Vérifier/créer la facture
  if (!invoiceId) {
    console.log("Aucun ID de facture fourni, création d'une facture de test...");
    await createTestInvoice();
  } else {
    console.log(`Utilisation de la facture existante: ${invoiceId}`);
    // Vérifier que la facture existe
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (error) {
      console.error("❌ La facture spécifiée n'existe pas:", error.message);
      process.exit(1);
    }
    
    console.log(`✅ Facture trouvée: ${invoice.number}, montant: ${invoice.amount} XOF`);
  }
  
  // 2. Initialiser un paiement
  console.log("\n🔄 Initialisation du paiement...");
  const paymentResponse = await initiatePayment(invoiceId, paymentMethod, phoneNumber);
  
  if (!paymentResponse.transactionId) {
    console.error("❌ Échec de l'initialisation du paiement: pas de transactionId");
    process.exit(1);
  }
  
  console.log(`✅ Paiement initialisé avec transactionId: ${paymentResponse.transactionId}`);
  console.log(`🔗 URL de paiement: ${paymentResponse.paymentUrl || 'Non disponible'}`);
  
  // 3. Simuler un webhook Dexchange (paiement réussi)
  console.log("\n🔄 Simulation du webhook Dexchange (confirmation de paiement)...");
  await simulateWebhook(invoiceId, paymentResponse.transactionId);
  
  // 4. Vérifier le statut du paiement après webhook
  console.log("\n🔄 Vérification du statut du paiement après webhook...");
  await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3 secondes
  
  const paymentStatus = await checkPaymentStatus(invoiceId);
  
  if (paymentStatus === 'paid') {
    console.log("✅ La facture a été correctement marquée comme PAYÉE après le webhook!");
  } else {
    console.error(`❌ Échec: La facture n'est pas marquée comme payée, statut actuel: ${paymentStatus}`);
  }
  
  console.log("\n==============================================");
  console.log("🏁 Fin du test de la chaîne de paiement");
}

// Fonction pour créer une facture de test
async function createTestInvoice() {
  // À implémenter si nécessaire
  console.log("Cette fonctionnalité n'est pas encore implémentée");
  process.exit(1);
}

// Fonction pour initialiser un paiement
async function initiatePayment(invoiceId, paymentMethod, phoneNumber) {
  try {
    // Se connecter pour obtenir un token
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD
    });
    
    if (authError) {
      console.error("❌ Échec de l'authentification:", authError.message);
      process.exit(1);
    }
    
    // Appeler la fonction Edge initiate-payment
    const response = await fetch(`${SITE_URL}/functions/v1/initiate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
        payment_method: paymentMethod,
        phone_number: phoneNumber
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Échec de l'initialisation du paiement (${response.status}):`, errorText);
      process.exit(1);
    }
    
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du paiement:", error.message);
    process.exit(1);
  }
}

// Fonction pour simuler un webhook Dexchange
async function simulateWebhook(invoiceId, transactionId) {
  try {
    // Création d'un payload simulant un webhook Dexchange
    const webhookPayload = {
      type: 'payment.completed',
      data: {
        object: {
          id: transactionId,
          status: 'SUCCESS',
          metadata: {
            invoice_id: invoiceId
          }
        }
      }
    };
    
    // Appel à la fonction Edge dexchange-callback-handler
    const response = await fetch(`${SITE_URL}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Dexchange-Signature': 'sim_signature' // Signature simulée
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook simulé avec succès:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error(`❌ Échec du webhook (${response.status}):`, errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du webhook:', error.message);
    return null;
  }
}

// Fonction pour vérifier le statut d'un paiement
async function checkPaymentStatus(invoiceId) {
  try {
    // Vérifier directement dans la base de données
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .single();
      
    if (error) {
      console.error("❌ Erreur lors de la vérification du statut de la facture:", error.message);
      return 'error';
    }
    
    return invoice.status;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du statut:", error.message);
    return 'error';
  }
}

// Exécuter le test
testCompletePaymentFlow();
