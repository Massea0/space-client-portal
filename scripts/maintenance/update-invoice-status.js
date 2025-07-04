import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Paramètres Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc";

// ID de la facture à mettre à jour
const INVOICE_ID = process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0';
const ACTION = process.argv[3] || 'paid'; // 'paid' ou 'pending'

// Création du client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateInvoice() {
  console.log(`🔄 Mise à jour de la facture ${INVOICE_ID} au statut "${ACTION}"...`);
  
  try {
    // Vérifier que la facture existe
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', INVOICE_ID)
      .single();
      
    if (fetchError) {
      console.error(`❌ Facture non trouvée:`, fetchError.message);
      process.exit(1);
    }
    
    console.log(`✅ Facture trouvée: ${invoice.number}, statut actuel: ${invoice.status}`);
    
    // Préparer les données de mise à jour selon l'action
    const updateData = {};
    
    if (ACTION === 'paid') {
      const transactionId = `MANUAL-${Date.now()}`;
      updateData.status = 'paid';
      updateData.paid_at = new Date().toISOString();
      updateData.dexchange_transaction_id = transactionId;
      updateData.payment_method = 'orange_money';
      updateData.payment_reference = `REF-MANUAL-${Date.now()}`;
      
      console.log(`💰 Marquage comme PAYÉE avec transaction ${transactionId}`);
    } else if (ACTION === 'pending') {
      updateData.status = 'pending';
      updateData.paid_at = null;
      updateData.dexchange_transaction_id = null;
      updateData.payment_method = null;
      updateData.payment_reference = null;
      
      console.log(`⏳ Réinitialisation au statut EN ATTENTE`);
    } else {
      console.error(`❌ Action non reconnue: ${ACTION}`);
      console.log('Actions valides: paid, pending');
      process.exit(1);
    }
    
    // Mettre à jour la facture
    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', INVOICE_ID);
      
    if (updateError) {
      console.error(`❌ Erreur lors de la mise à jour:`, updateError.message);
      process.exit(1);
    }
    
    console.log(`✅ Facture mise à jour avec succès au statut "${ACTION}"!`);
    
  } catch (error) {
    console.error(`❌ Erreur inattendue:`, error.message);
    process.exit(1);
  }
}

// Exécuter la fonction
updateInvoice();
