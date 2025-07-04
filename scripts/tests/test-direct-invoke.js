// Tester directement la fonction déployée
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config(); // Charger les variables d'environnement

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL Supabase:', SUPABASE_URL);

// ID de la facture payée
const invoiceId = '197dc760-08a2-4e18-884d-098c1bcd08d0';

// Initialisation du client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFunction() {
  console.log('Test direct de la fonction déployée - invoiceId:', invoiceId);
  
  try {
    // Éviter le cache avec un timestamp
    const { data, error } = await supabase.functions.invoke('payment-status', {
      body: {
        invoiceId: invoiceId,
        _t: Date.now()
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Résultat:', JSON.stringify(data, null, 2));
    
    if (data.status === 'paid') {
      console.log('✅ SUCCÈS: La facture est correctement remontée comme payée!');
    } else {
      console.log('❌ ÉCHEC: La facture est remontée comme', data.status || 'unknown', 'au lieu de paid');
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

testFunction();
