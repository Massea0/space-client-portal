// test-orange-money-flow.js
// Script pour tester le flux complet de paiement Orange Money

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Lecture des variables d\'environnement...');
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Afficher les informations de configuration (sans montrer la clé complète)
console.log(`URL Supabase: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : 'Non définie'}`);

// Vérifier que les variables nécessaires sont définies
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes. Vérifiez le fichier .env');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service pour avoir accès complet
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ID de facture à utiliser pour les tests
// Vous pouvez spécifier un ID via une variable d'environnement ou utiliser celui par défaut
const invoiceId = process.env.INVOICE_ID || '197dc760-08a2-4e18-884d-098c1bcd08d0';
const phoneNumber = '774650800'; // Numéro de téléphone test pour Orange Money

async function testOrangeMoneyFlow() {
  console.log('=== Test du flux de paiement Orange Money ===');
  console.log(`Utilisation de la facture: ${invoiceId}`);
  console.log(`Numéro de téléphone: ${phoneNumber}`);
  
  try {
    // 1. Initier le paiement
    console.log('\n1. Initiation du paiement Orange Money...');
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('initiate-payment', {
      body: {
        invoice_id: invoiceId,
        payment_method: 'orange_money',
        phone_number: phoneNumber,
      },
    });
    
    if (paymentError) {
      console.error('Erreur lors de l\'initiation du paiement:', paymentError);
      return;
    }
    
    console.log('Réponse d\'initiation de paiement:', JSON.stringify(paymentData, null, 2));
    
    // 2. Vérifier qu'on a bien un ID de transaction mais pas forcément d'URL
    if (!paymentData.transactionId) {
      console.error('❌ Erreur: Aucun ID de transaction retourné');
      return;
    }
    
    console.log(`✅ ID de transaction reçu: ${paymentData.transactionId}`);
    if (!paymentData.paymentUrl) {
      console.log('✅ Aucune URL de paiement retournée pour Orange Money (comportement attendu)');
    } else {
      console.log(`ℹ️ URL de paiement: ${paymentData.paymentUrl} (inattendu pour Orange Money)`);
    }
    
    if (paymentData.paymentCode) {
      console.log(`✅ Code de paiement reçu: ${paymentData.paymentCode}`);
    } else {
      console.warn('⚠️ Aucun code de paiement reçu pour Orange Money');
    }
    
    if (paymentData.paymentInstructions) {
      console.log(`✅ Instructions de paiement reçues: ${paymentData.paymentInstructions}`);
    } else {
      console.warn('⚠️ Aucune instruction de paiement reçue pour Orange Money');
    }
    
    // Vérifier que l'erreur n'est PAS levée malgré l'absence d'URL
    console.log('✅ La fonction ne lève pas d\'erreur malgré l\'absence d\'URL (notre correction fonctionne)');
    
    // 3. Vérifier le statut du paiement
    console.log('\n2. Vérification du statut du paiement...');
    const { data: statusData, error: statusError } = await supabase.functions.invoke('payment-status', {
      body: {
        invoice_id: invoiceId,
      },
    });
    
    if (statusError) {
      console.error('Erreur lors de la vérification du statut:', statusError);
      return;
    }
    
    console.log('Statut du paiement:', JSON.stringify(statusData, null, 2));
    
    // 4. Simuler le callback Dexchange pour marquer la facture comme payée
    if (statusData.status !== 'paid') {
      console.log('\n3. Simulation du webhook Dexchange (callback)...');
      
      // Construire un payload similaire à ce que Dexchange envoie
      const webhookPayload = {
        id: paymentData.transactionId || `TIDOM${Date.now()}`,
        externalTransactionId: `INV-${invoiceId.split('-')[0]}-${Date.now()}`,
        transactionType: "CASHOUT",
        AMOUNT: 200,
        FEE: 3,
        PHONE_NUMBER: phoneNumber,
        STATUS: "SUCCESS",
        CUSTOM_DATA: "{}",
        COMPLETED_AT: new Date().toISOString(),
        PREVIOUS_BALANCE: 404,
        hash: "2d720fa2d263554d65a3318ab185eff3a07935619929b411939dfe02942e24f2"
      };
      
      const { data: callbackData, error: callbackError } = await supabase.functions.invoke('dexchange-callback-handler', {
        body: webhookPayload,
      });
      
      if (callbackError) {
        console.error('Erreur lors de la simulation du callback:', callbackError);
        return;
      }
      
      console.log('Réponse du webhook:', callbackData);
      
      // 5. Vérifier à nouveau le statut du paiement après le callback
      console.log('\n4. Vérification du statut après webhook...');
      const { data: finalStatusData, error: finalStatusError } = await supabase.functions.invoke('payment-status', {
        body: {
          invoice_id: invoiceId,
        },
      });
      
      if (finalStatusError) {
        console.error('Erreur lors de la vérification finale du statut:', finalStatusError);
        return;
      }
      
      console.log('Statut final du paiement:', JSON.stringify(finalStatusData, null, 2));
      
      // Vérifier si le statut est bien 'paid'
      if (finalStatusData.status === 'paid') {
        console.log('✅ La facture a été correctement marquée comme payée!');
      } else {
        console.error(`❌ La facture n'a pas été marquée comme payée: ${finalStatusData.status}`);
      }
    } else {
      console.log('✅ La facture est déjà marquée comme payée, test terminé.');
    }
    
  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

testOrangeMoneyFlow().catch(err => console.error('Erreur lors du test:', err));
