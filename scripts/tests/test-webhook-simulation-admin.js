// Test webhook pour mettre à jour la facture et la transaction
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: './.env' }); // Utiliser le fichier .env principal

// Paramètres pour le test
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ID de la facture réelle que nous voulons mettre à jour - pris en argument ou par défaut
const invoiceId = process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0';
// ID de transaction associé à cette facture
const transactionId = `TEST-${Date.now()}`;

// Initialisation du client Supabase avec la clé d'administration
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/**
 * Ce script simule ce que le webhook fait dans la base de données:
 * 1. Vérifier si la transaction existe
 * 2. Si non, la créer
 * 3. Mettre à jour le statut de la facture à "paid"
 */
async function simulateWebhookUpdate() {
  console.log('Simulation de mise à jour webhook pour:');
  console.log(`- Facture: ${invoiceId}`);
  console.log(`- Transaction: ${transactionId}`);
  
  try {
    // 1. Vérifier si la transaction existe déjà
    const { data: transactionData, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    // 2. Si la transaction n'existe pas, la créer
    if (txError) {
      console.log('Transaction non trouvée, création d\'une nouvelle transaction...');
      
      const newTransaction = {
        transaction_id: transactionId,
        invoice_id: invoiceId, 
        external_transaction_id: `EXT-${transactionId}`,
        status: 'completed',
        payment_method: 'wave',
        amount: 200, // Valeur de la facture
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transaction_data: { 
          provider: 'wave', 
          status: 'COMPLETED', 
          phone_number: '771234567',
          amount: 200,
          currency: 'XOF'
        }
      };

      const { error: createError } = await supabase
        .from('payment_transactions')
        .insert([newTransaction]);
        
      if (createError) {
        console.error('Erreur lors de la création de la transaction:', createError);
        return;
      }
      
      console.log('Transaction créée avec succès');
    } else {
      console.log('Transaction trouvée, mise à jour du statut...');
      
      // Mise à jour de la transaction existante
      const { error: updateTxError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString(),
          transaction_data: {
            ...transactionData.transaction_data,
            status: 'COMPLETED',
            completed_at: new Date().toISOString()
          }
        })
        .eq('transaction_id', transactionId);
      
      if (updateTxError) {
        console.error('Erreur lors de la mise à jour de la transaction:', updateTxError);
        return;
      }
      
      console.log('Transaction mise à jour avec succès');
    }
    
    // 3. Mettre à jour le statut de la facture à "paid"
    const { error: updateInvoiceError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: transactionId,
        dexchange_transaction_id: transactionId
      })
      .eq('id', invoiceId);
    
    if (updateInvoiceError) {
      console.error('Erreur lors de la mise à jour de la facture:', updateInvoiceError);
      return;
    }
    
    console.log('Facture mise à jour avec succès');
    
    // 4. Vérifier que la mise à jour a bien été prise en compte
    const { data: updatedInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id, status, paid_at, payment_reference, dexchange_transaction_id')
      .eq('id', invoiceId)
      .single();
    
    if (checkError) {
      console.error('Erreur lors de la vérification de la facture:', checkError);
      return;
    }
    
    console.log('\nStatut actuel de la facture après mise à jour:');
    console.log(JSON.stringify(updatedInvoice, null, 2));
    
    console.log('\n✅ Simulation terminée avec succès!');
    console.log('Maintenant, testez la fonction payment-status pour vérifier si les données sont correctement remontées.');
    
  } catch (err) {
    console.error('Erreur lors de la simulation:', err);
  }
}

// Exécuter la simulation
simulateWebhookUpdate();
