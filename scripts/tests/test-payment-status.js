// Script de test pour vérifier si les données de transaction 
// sont correctement remontées du backend vers le frontend
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Si les variables d'environnement ne sont pas définies, nous utilisons des valeurs de test
// IMPORTANT: Dans un environnement de production, récupérez ces valeurs à partir des variables d'environnement!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://votre-instance-supabase.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'votre-cle-service-role';

console.log('Utilisation de l\'URL Supabase:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testPaymentStatus() {
  try {
    console.log("Test de récupération du statut de paiement...");
    
    // 1. Récupérer une transaction et une facture récente pour le test
    const { data: transactions, error: txError } = await supabase
      .from('payment_transactions')
      .select('transaction_id, invoice_id, status, payment_method')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (txError || !transactions || transactions.length === 0) {
      console.error("Erreur ou aucune transaction trouvée:", txError);
      return;
    }
    
    const transaction = transactions[0];
    console.log("Transaction de test:", transaction);
    
    // 2. Récupérer la facture associée
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id, status, amount, paid_at')
      .eq('id', transaction.invoice_id)
      .single();
    
    if (invError) {
      console.error("Erreur lors de la récupération de la facture:", invError);
      return;
    }
    
    console.log("Facture associée:", invoice);
    
    // 3. Appeler la fonction payment-status directement
    const { data: paymentStatus, error: psError } = await supabase.functions.invoke('payment-status', {
      body: { 
        transactionId: transaction.transaction_id,
        invoiceId: transaction.invoice_id,
        _t: Date.now() // Anti-cache
      }
    });
    
    if (psError) {
      console.error("Erreur lors de l'appel à payment-status:", psError);
      return;
    }
    
    console.log("Réponse de payment-status:", paymentStatus);
    
    // 4. Vérifier si les données sont cohérentes
    console.log("\nVérification de la cohérence des données:");
    console.log("- Status transaction en DB:", transaction.status);
    console.log("- Status facture en DB:", invoice.status);
    console.log("- Status retourné par l'API:", paymentStatus.status);
    console.log("- Status invoice retourné par l'API:", paymentStatus.invoiceStatus);
    
    if (
      paymentStatus.transactionId === transaction.transaction_id && 
      (paymentStatus.status === transaction.status || paymentStatus.invoiceStatus === invoice.status)
    ) {
      console.log("\n✅ Les données semblent cohérentes entre le backend et le frontend!");
    } else {
      console.log("\n❌ Incohérence détectée entre les données du backend et du frontend!");
      console.log("Vérifier la logique dans payment-status.js");
    }
    
  } catch (error) {
    console.error("Erreur lors du test:", error);
  }
}

testPaymentStatus();
