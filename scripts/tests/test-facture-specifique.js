// test-facture-specifique.js
// Script pour tester le flux de paiement avec une facture spécifique
import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration pour les tests - compatibilité avec différents formats de variables d'environnement
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEXCHANGE_WEBHOOK_SECRET = process.env.DEXCHANGE_WEBHOOK_SECRET;

// Vérifier que les variables d'environnement sont définies
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes.');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans le fichier .env');
  process.exit(1);
}

// Données de la facture à tester
const factureTest = {
  id: '08ddf73e-aa64-40e0-9c43-d4781db42150',
  number: 'FAC-2025-59147',
  company_id: 'f05de628-9f20-4289-9ea9-fc56ce5d1e46',
  amount: 200.00,
  status: 'pending',
  created_at: '2025-06-23T13:50:59.472142+00:00',
  due_date: '2025-07-23T00:00:00+00:00',
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

// Test complet du flux de paiement
async function executerTestComplet() {
  console.log('🧪 Démarrage du test complet pour la facture', factureTest.number);
  
  try {
    // 1. Vérifier l'état initial de la facture
    console.log('\n📊 ÉTAPE 1: Vérification de l\'état initial de la facture');
    const etatInitial = await verifierEtatFactureDirectement();
    
    // 2. Initier le paiement
    console.log('\n📊 ÉTAPE 2: Initiation du paiement');
    const initiationResult = await initierPaiement();
    const transactionId = initiationResult.transactionId;
    console.log('Transaction ID:', transactionId);
    
    // 3. Vérifier le statut du paiement (doit être 'pending')
    console.log('\n📊 ÉTAPE 3: Vérification du statut initial du paiement');
    const statusInitial = await verifierStatutPaiement(transactionId);
    
    // 4. Simuler un webhook de callback Dexchange (paiement réussi)
    console.log('\n📊 ÉTAPE 4: Simulation du webhook Dexchange');
    await simulerWebhookDexchange(transactionId);
    
    // 5. Vérifier à nouveau le statut du paiement (doit maintenant être 'paid')
    console.log('\n📊 ÉTAPE 5: Vérification du statut final du paiement');
    const statusFinal = await verifierStatutPaiement(transactionId);
    
    // 6. Vérifier l'état final de la facture dans la base de données
    console.log('\n📊 ÉTAPE 6: Vérification de l\'état final de la facture');
    const etatFinal = await verifierEtatFactureDirectement();
    
    // Rapport final
    console.log('\n📋 RAPPORT DE TEST:');
    console.log('───────────────────────────────────────────────');
    console.log('Facture:', factureTest.number);
    console.log('Transaction ID:', transactionId);
    console.log('État initial de la facture:', etatInitial.status);
    console.log('État initial du paiement:', statusInitial.status);
    console.log('État final de la facture:', etatFinal.status);
    console.log('État final du paiement:', statusFinal.status);
    console.log('Mise à jour de la facture réussie:', etatFinal.status === 'paid');
    console.log('Date de paiement enregistrée:', etatFinal.paid_at || 'Non');
    console.log('Transaction ID enregistré:', etatFinal.dexchange_transaction_id || 'Non');
    console.log('───────────────────────────────────────────────');
    
    if (etatFinal.status === 'paid' && statusFinal.status === 'paid') {
      console.log('✅ TEST RÉUSSI: Le flux de paiement fonctionne correctement.');
    } else {
      console.log('❌ TEST ÉCHOUÉ: Le flux de paiement ne fonctionne pas correctement.');
    }
    
  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error.message);
  }
}

// Exécuter le test
executerTestComplet();
