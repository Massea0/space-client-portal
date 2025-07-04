/**
 * Script de test complet pour la chaîne de paiement Dexchange
 * Ce script simule un flux complet de paiement:
 * 1. Création d'une transaction
 * 2. Simulation d'un webhook de callback (comme si Dexchange nous notifiait)
 * 3. Vérification que la facture est bien marquée comme payée
 */

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env' });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEXCHANGE_WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !DEXCHANGE_WEBHOOK_SECRET) {
  console.error("❌ Variables d'environnement manquantes. Vérifiez votre fichier .env");
  process.exit(1);
}

// Créer les clients Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fonction principale
async function runEndToEndTest() {
  try {
    console.log("🧪 Démarrage du test end-to-end pour le processus de paiement Dexchange");
    
    // 1. Créer ou récupérer une facture de test
    console.log("📝 Création d'une facture de test...");
    const testInvoiceId = await createTestInvoice();
    console.log(`✅ Facture créée avec ID: ${testInvoiceId}`);
    
    // 2. Initier un paiement pour cette facture
    console.log("💰 Initiation du paiement...");
    const paymentData = await initiatePayment(testInvoiceId);
    console.log(`✅ Paiement initié! Transaction ID: ${paymentData.transactionId}`);
    
    // 3. Vérifier l'état initial du paiement
    console.log("🔎 Vérification de l'état initial du paiement...");
    const initialStatus = await checkPaymentStatus(paymentData.transactionId, testInvoiceId);
    console.log(`ℹ️ État initial: ${initialStatus.status}`);
    
    // 4. Simuler un webhook de callback de Dexchange
    console.log("🔄 Simulation d'un callback de paiement Dexchange...");
    await simulateWebhookCallback(testInvoiceId, paymentData.transactionId);
    console.log("✅ Callback simulé avec succès!");
    
    // 5. Attendre quelques secondes pour que les mises à jour se propagent
    console.log("⏱️ Attente de la propagation des mises à jour...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Vérifier l'état final du paiement
    console.log("🔎 Vérification de l'état final du paiement...");
    const finalStatus = await checkPaymentStatus(paymentData.transactionId, testInvoiceId);
    
    // 7. Résumé du test
    console.log("\n📊 RÉSULTAT DU TEST:");
    console.log(`InvoiceID: ${testInvoiceId}`);
    console.log(`TransactionID: ${paymentData.transactionId}`);
    console.log(`État initial: ${initialStatus.status}`);
    console.log(`État final: ${finalStatus.status}`);
    
    if (finalStatus.status === 'paid' || finalStatus.invoiceStatus === 'paid') {
      console.log("✅ TEST RÉUSSI: Le paiement a bien été marqué comme payé!");
    } else {
      console.log(`❌ TEST ÉCHOUÉ: Le paiement n'a pas été marqué comme payé. État final: ${finalStatus.status}`);
    }
    
    // 8. Nettoyage si nécessaire (pour tests futurs)
    if (process.env.CLEANUP_TEST_DATA === 'true') {
      console.log("🧹 Nettoyage des données de test...");
      await cleanupTestData(testInvoiceId);
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors du test: ${error.message}`);
    console.error(error);
  }
}

// Fonction pour créer une facture de test
async function createTestInvoice() {
  const testClientId = process.env.TEST_CLIENT_ID || '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      client_id: testClientId,
      amount: 1000, // 1000 FCFA
      status: 'pending',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // due dans 7 jours
      invoice_number: `TEST-${Math.floor(Math.random() * 10000)}`,
      invoice_date: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw new Error(`Erreur lors de la création de la facture: ${error.message}`);
  return data.id;
}

// Fonction pour initier un paiement
async function initiatePayment(invoiceId) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      invoiceId: invoiceId,
      paymentMethod: 'orange_money',
      phoneNumber: '771234567'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de l'initiation du paiement: ${errorText}`);
  }
  
  return await response.json();
}

// Fonction pour vérifier le statut du paiement
async function checkPaymentStatus(transactionId, invoiceId) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/payment-status?transactionId=${transactionId}&invoiceId=${invoiceId}`, 
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la vérification du statut: ${errorText}`);
  }
  
  return await response.json();
}

// Fonction pour simuler un webhook de callback
async function simulateWebhookCallback(invoiceId, transactionId) {
  // Créer un événement simulé comme le ferait Dexchange
  const webhookPayload = {
    type: 'payment.completed',
    data: {
      object: {
        id: transactionId,
        invoice_id: invoiceId,
        status: 'succeeded',
        provider: 'orange_money',
        amount: 1000,
        currency: 'XOF',
        created_at: new Date().toISOString(),
        metadata: {
          invoice_id: invoiceId
        }
      }
    }
  };
  
  // Simuler une signature (dans un cas réel, ceci serait cryptographiquement généré)
  const mockSignature = 'mock_signature_for_testing';
  
  // Envoyer la requête à notre endpoint de callback
  const response = await fetch(`${SUPABASE_URL}/functions/v1/dexchange-callback-handler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Dexchange-Signature': mockSignature
    },
    body: JSON.stringify(webhookPayload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la simulation du webhook: ${errorText} (${response.status})`);
  }
  
  return await response.json();
}

// Fonction pour nettoyer les données de test
async function cleanupTestData(invoiceId) {
  // Supprimer d'abord les transactions de paiement liées
  const { error: txError } = await supabaseAdmin
    .from('payment_transactions')
    .delete()
    .eq('invoice_id', invoiceId);
  
  if (txError) console.warn(`Avertissement lors du nettoyage des transactions: ${txError.message}`);
  
  // Supprimer ensuite la facture
  const { error: invError } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
  
  if (invError) console.warn(`Avertissement lors du nettoyage de la facture: ${invError.message}`);
}

// Exécuter le test
runEndToEndTest();
