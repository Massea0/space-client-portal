// Script pour vérifier si une facture payée est correctement remontée
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config(); // Chargement des variables d'environnement

// Paramètres pour le test
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL Supabase:', supabaseUrl);

// ID de la facture réelle à vérifier (fourni en argument ou valeur par défaut)
const invoiceId = process.argv[2] || '3ea15608-ed69-4a66-9c4f-2d30a2830ae0';
// ID de transaction associé à cette facture (généré dynamiquement)
const transactionId = `INVOICE-TEST-${Date.now()}`;

// Initialisation du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInvoiceStatus() {
  console.log(`Simulation du frontend - Vérification du statut via l'API pour:`);
  console.log(`- Facture: ${invoiceId}`);
  console.log(`- Transaction: ${transactionId}`);
  
  try {
    // Le frontend n'a pas accès direct aux tables, il utilise uniquement les fonctions Edge
    
    // Appel à la fonction payment-status comme le ferait le frontend
    const { data, error } = await supabase.functions.invoke('payment-status', {
      body: {
        invoiceId,
        transactionId,
        _t: Date.now() // Paramètre anti-cache
      }
    });
    
    if (error) {
      console.error('Erreur lors de l\'appel à payment-status:', error);
      return;
    }
    
    // Affichage des résultats
    console.log('\nRésultat de la fonction payment-status:');
    console.log(JSON.stringify(data, null, 2));
    
    // Vérification du statut payé
    if (data.status === 'paid') {
      console.log('\n✅ SUCCESS: La facture est correctement marquée comme payée dans l\'API');
    } else {
      console.log(`\n❓ ATTENTION: La facture n'est pas marquée comme payée dans l'API (statut: "${data.status}")`);
    }
  } catch (err) {
    console.error('Erreur lors de la vérification:', err);
  }
}

// Exécution du test
checkInvoiceStatus();
