// test-facture-specifique-direct.js
// Version simplifiée pour test direct avec valeurs hardcodées
// Script pour tester le flux de paiement avec une facture spécifique
import fetch from 'node-fetch';

// Configuration pour les tests - valeurs hardcodées pour simplifier
const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc";
const DEXCHANGE_WEBHOOK_SECRET = "dexchange-wehook-secure-key-2025";

// Données de la facture à tester
const factureTest = {
  id: process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0', // Utiliser l'ID fourni en argument ou valeur par défaut
  number: 'FAC-2025-04876',
  company_id: 'f05de628-9f20-4289-9ea9-fc56ce5d1e46',
  amount: 200.00,
  status: 'pending',
  created_at: '2025-06-23T15:40:05.306064+00',
  due_date: '2025-07-23T00:00:00+00',
};

// Fonction pour obtenir une URL de paiement pour la facture
async function getPaymentUrl() {
  console.log('🔍 Obtention de l\'URL de paiement pour la facture', factureTest.number);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-payment-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        invoiceId: factureTest.id,
        paymentMethod: 'orange_money', // ou 'wave'
        phoneNumber: '770000000' // Remplacez par un numéro de test valide
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ URL de paiement obtenue:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'obtention de l\'URL de paiement:', error.message);
    throw error;
  }
}

// Fonction pour initier un paiement
async function initierPaiement() {
  console.log('🚀 Initiation du paiement pour la facture', factureTest.number);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        invoiceId: factureTest.id,
        paymentMethod: 'orange_money', // ou 'wave'
        phoneNumber: '770000000' // Remplacez par un numéro de test valide
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Paiement initié:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initiation du paiement:', error.message);
    throw error;
  }
}

// Fonction pour vérifier l'état du paiement
async function verifierStatutPaiement(transactionId = null) {
  console.log('🔍 Vérification du statut de paiement...');
  
  const queryParams = new URLSearchParams();
  queryParams.append('invoiceId', factureTest.id);
  if (transactionId) {
    queryParams.append('transactionId', transactionId);
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-status?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Statut de paiement récupéré:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error.message);
    throw error;
  }
}

// Fonction pour simuler un webhook Dexchange (comme si Dexchange nous notifiait d'un paiement réussi)
async function simulerWebhookDexchange(transactionId) {
  console.log('🔄 Simulation du webhook Dexchange...');
  
  const webhookData = {
    event: 'payment.success',
    data: {
      transaction_id: transactionId,
      invoice_id: factureTest.id,
      status: 'COMPLETED',
      amount: factureTest.amount,
      payment_method: 'orange_money',
      phone_number: '770000000',
      payment_date: new Date().toISOString()
    }
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dexchange-callback-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
        'x-webhook-secret': DEXCHANGE_WEBHOOK_SECRET || 'test-secret'
      },
      body: JSON.stringify(webhookData)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Webhook simulé avec succès:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la simulation du webhook:', error.message);
    throw error;
  }
}

// Fonction pour vérifier l'état de la facture directement dans la base de données
async function verifierEtatFactureDirectement() {
  console.log('🔍 Vérification de l\'état de la facture directement dans la base de données...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${factureTest.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
        'apikey': `${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      console.log('✅ État actuel de la facture:', data[0]);
      return data[0];
    } else {
      throw new Error('Facture non trouvée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'état de la facture:', error.message);
    throw error;
  }
}

// Fonction pour simuler directement la mise à jour d'une facture en "paid"
async function marquerFactureCommePaye(transactionId) {
  console.log('🔄 Marquage direct de la facture comme payée...');
  
  const now = new Date().toISOString();
  const updateData = {
    status: 'paid',
    paid_at: now,
    payment_method: 'orange_money',
    dexchange_transaction_id: transactionId || `TEST-${Date.now()}`,
    payment_reference: `REF-TEST-${Date.now()}`
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${factureTest.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Facture marquée comme payée:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du marquage de la facture:', error.message);
    throw error;
  }
}

// Test simple de vérification et marquage comme payé
async function executerTestSimple() {
  console.log('🧪 Démarrage du test simple pour la facture', factureTest.number);
  
  try {
    // 1. Vérifier l'état initial de la facture
    console.log('\n📊 ÉTAPE 1: Vérification de l\'état initial de la facture');
    const etatInitial = await verifierEtatFactureDirectement();
    
    // 2. Marquer la facture comme payée directement
    console.log('\n📊 ÉTAPE 2: Marquage direct de la facture comme payée');
    const transactionId = `TEST-${Date.now()}`;
    await marquerFactureCommePaye(transactionId);
    
    // 3. Vérifier l'état final de la facture
    console.log('\n📊 ÉTAPE 3: Vérification de l\'état final de la facture');
    const etatFinal = await verifierEtatFactureDirectement();
    
    // Rapport final
    console.log('\n📋 RAPPORT DE TEST:');
    console.log('───────────────────────────────────────────────');
    console.log('Facture:', factureTest.number);
    console.log('Transaction ID:', transactionId);
    console.log('État initial de la facture:', etatInitial.status);
    console.log('État final de la facture:', etatFinal.status);
    console.log('Mise à jour réussie:', etatFinal.status === 'paid');
    console.log('Date de paiement enregistrée:', etatFinal.paid_at || 'Non');
    console.log('Transaction ID enregistré:', etatFinal.dexchange_transaction_id || 'Non');
    console.log('───────────────────────────────────────────────');
    
    if (etatFinal.status === 'paid') {
      console.log('✅ TEST RÉUSSI: La facture a été marquée comme payée avec succès.');
    } else {
      console.log('❌ TEST ÉCHOUÉ: La facture n\'a pas été marquée comme payée.');
    }
  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error.message);
  }
}

// Exécuter le test
executerTestSimple();
