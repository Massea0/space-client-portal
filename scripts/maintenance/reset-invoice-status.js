// reset-invoice-status.js
// Script pour réinitialiser le statut de la facture à "pending"
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc";

// ID de la facture à réinitialiser
const INVOICE_ID = '08ddf73e-aa64-40e0-9c43-d4781db42150';

// Fonction pour réinitialiser le statut de la facture
async function reinitialiserFacture() {
  console.log(`🔄 Réinitialisation de la facture ${INVOICE_ID} à "pending"...`);
  
  const updateData = {
    status: 'pending',
    paid_at: null,
    dexchange_transaction_id: null,
    payment_method: null,
    payment_reference: null
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${INVOICE_ID}`, {
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
    console.log('✅ Facture réinitialisée avec succès:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
    throw error;
  }
}

// Exécuter la réinitialisation
reinitialiserFacture()
  .then(() => console.log('✅ OPÉRATION TERMINÉE'))
  .catch(error => console.error('❌ ÉCHEC DE L\'OPÉRATION:', error));
