import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Classe d'erreur personnalisée pour une gestion plus structurée
class AppError extends Error {
  statusCode;
  constructor(message, statusCode){
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// En-têtes pour la gestion du CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Chargement des variables d'environnement
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const GCP_RELAY_URL = Deno.env.get('GCP_RELAY_URL');
const GCP_RELAY_SECRET = Deno.env.get('GCP_RELAY_SECRET');
const SITE_URL = Deno.env.get('SITE_URL');

// Vérification initiale des variables d'environnement
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GCP_RELAY_URL || !GCP_RELAY_SECRET || !SITE_URL) {
  console.error("Erreur: Variables d'environnement manquantes. Assurez-vous que SUPABASE_URL, SUPABASE_ANON_KEY, GCP_RELAY_URL, GCP_RELAY_SECRET et SITE_URL sont définies.");
}

/**
 * Extrait l'URL de paiement de différentes structures de réponse possibles
 */
function extractPaymentUrl(response) {
  // Log complet de la réponse pour débogage
  console.log('Analyzing response for payment URL:', JSON.stringify(response, null, 2));
  
  // Cas 1: Structure avec transaction.cashout_url
  if (response.transaction?.cashout_url) {
    return response.transaction.cashout_url;
  }
  
  // Cas 2: Structure avec transaction.payment_url
  if (response.transaction?.payment_url) {
    return response.transaction.payment_url;
  }
  
  // Cas 3: Structure avec transaction.url
  if (response.transaction?.url) {
    return response.transaction.url;
  }
  
  // Cas 4: Structure avec data.transaction
  if (response.data?.transaction) {
    const txn = response.data.transaction;
    return txn.cashout_url || txn.payment_url || txn.url;
  }
  
  // Cas 5: Réponse avec paymentUrl directe
  if (response.paymentUrl) {
    return response.paymentUrl;
  }
  
  // Cas 6: URL directe dans la réponse
  if (typeof response === 'string' && response.includes('http')) {
    return response;
  }
  
  // Aucune URL trouvée
  return null;
}

/**
 * Appelle l'API de dexchange via le relais Google Cloud pour créer une intention de paiement.
 */
async function createDexchangePaymentIntent(params) {
  console.log('🔧 [DEBUG] Appel réel du relay GCP pour Wave');
  
  // Désactivation du mode test - utilisation du relay réel
  
  // Code original pour les autres méthodes (si nécessaire)
  if (!GCP_RELAY_URL) throw new AppError("La variable d'environnement GCP_RELAY_URL n'est pas définie.", 500);
  if (!GCP_RELAY_SECRET) throw new AppError("La variable d'environnement GCP_RELAY_SECRET n'est pas définie.", 500);
  
  const endpoint = `${GCP_RELAY_URL}/relay`;
  
  // Déterminer le serviceCode en fonction de la méthode de paiement
  // Pour les paiements clients, on utilise CASHOUT (le client sort l'argent de son compte)
  let serviceCode;
  switch(params.payment_method){
    case 'wave':
      serviceCode = 'WAVE_SN_CASHOUT';
      break;
    case 'orange_money':
      serviceCode = 'OM_SN_CASHOUT';
      break;
    case 'free_money':
      serviceCode = 'FM_SN_CASHOUT';
      break;
    case 'wizall':
      serviceCode = 'WIZALL_SN_CASHOUT';
      break;
    default:
      throw new AppError(`Méthode de paiement non supportée: ${params.payment_method}`, 400);
  }
  
  // Générer un ID de transaction externe unique
  const externalTransactionId = `INV-${params.metadata.invoice_id.substring(0, 8)}-${Date.now()}`;
  
  // Normaliser le numéro de téléphone pour le Sénégal
  // Retirer l'indicatif pays +221 ou 221 si présent
  let normalizedNumber = params.phone_number.replace(/^\+?221/, '');
  console.log(`📱 Numéro normalisé: ${params.phone_number} → ${normalizedNumber}`);
  
  // Construire le payload pour Dexchange selon leur API
  // Assurons-nous que l'URL de callback est correctement définie
  const callbackURL = `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`;
  console.log(`🔔 Configuration du callback vers: ${callbackURL}`);
  
  const dexchangePayload = {
    externalTransactionId: externalTransactionId,
    serviceCode: serviceCode,
    amount: params.amount,
    number: normalizedNumber, // Utiliser le numéro normalisé
    callBackURL: callbackURL,
    successUrl: `https://myspace.arcadis.tech/payment/callback?status=success&transactionId=${externalTransactionId}&invoiceId=${params.metadata.invoice_id}`,
    failureUrl: `https://myspace.arcadis.tech/payment/callback?status=cancel&transactionId=${externalTransactionId}&invoiceId=${params.metadata.invoice_id}`,
    metadata: JSON.stringify(params.metadata)
  };
  
  // Construire le payload pour le relais
  const relayPayload = {
    dexchangePath: '/transaction/init',
    dexchangeMethod: 'POST',
    dexchangeBody: dexchangePayload
  };
  
  console.log('Sending to relay:', JSON.stringify(relayPayload, null, 2));
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-relay-secret': GCP_RELAY_SECRET
    },
    body: JSON.stringify(relayPayload)
  });
  
  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    console.error('Failed to parse relay response as JSON:', error);
    const textResponse = await response.text();
    console.error('Raw response:', textResponse);
    throw new AppError('Réponse invalide du relais: format JSON attendu', 500);
  }
  
  if (!response.ok) {
    console.error('Error response from relay:', responseData);
    throw new AppError(`Erreur du relais (${response.status}): ${responseData.error || response.statusText || 'Réponse non OK'}`, response.status);
  }
  
  console.log('Full Dexchange response:', JSON.stringify(responseData, null, 2));
  
  return responseData;
}

// Le serveur Deno écoute les requêtes HTTP
serve(async (req)=>{
  console.log(`🚀 [initiate-payment] Nouvelle requête ${req.method} à ${new Date().toISOString()}`);
  console.log(`🔧 Variables d'environnement:`);
  console.log(`   SITE_URL: ${SITE_URL}`);
  console.log(`   GCP_RELAY_URL: ${GCP_RELAY_URL}`);
  console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new AppError("Supabase URL ou Anon Key n'est pas défini.", 500);
    }
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || ''
        }
      }
    });
    
    const requestBody = await req.json();
    console.log('📥 Request body reçu:', JSON.stringify(requestBody, null, 2));
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    console.log('👤 Authentification:', { hasUser: !!user, error: userError?.message });
    
    if (userError || !user) {
      console.error('❌ Erreur authentification:', userError);
      throw new AppError('Authentification requise ou utilisateur non trouvé.', 401);
    }
    
    const { data: userProfile, error: userProfileError } = await supabaseClient.from('users').select('company_id, role').eq('id', user.id).single();
    if (userProfileError || !userProfile) {
      throw new AppError('Profil utilisateur non trouvé ou accès refusé.', 404);
    }
    
    const { invoice_id, payment_method, phone_number } = requestBody;
    if (!invoice_id || !payment_method || !phone_number) {
      throw new AppError('invoice_id, payment_method, et phone_number sont requis.', 400);
    }
    
    const { data: invoice, error: invoiceError } = await supabaseClient.from('invoices').select('id, amount, company_id, number').eq('id', invoice_id).single();
    if (invoiceError || !invoice) {
      throw new AppError('Facture non trouvée ou accès refusé.', 404);
    }
    
    if (userProfile.role === 'client' && invoice.company_id !== userProfile.company_id) {
      throw new AppError('Non autorisé : La facture n\'appartient pas à votre compagnie ou n\'existe pas.', 403);
    }
    
    const { error: updateError } = await supabaseClient.from('invoices').update({
      status: 'pending_payment'
    }).eq('id', invoice.id);
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut de la facture:', updateError);
      throw new AppError('Échec de la mise à jour du statut de la facture.', 500);
    }
    
    if (!SITE_URL) throw new AppError("La variable d'environnement SITE_URL n'est pas définie.", 500);
    
    const paymentParams = {
      amount: invoice.amount,
      currency: 'xof',
      payment_method: payment_method,
      phone_number: phone_number,
      success_url: `${SITE_URL}/payment/success?invoice_id=${invoice.id}`, // URL de succès pour l'utilisateur
      cancel_url: `${SITE_URL}/payment/failure?invoice_id=${invoice.id}`,   // URL d'échec pour l'utilisateur
      callback_url: `${SUPABASE_URL}/functions/v1/dexchange-callback-handler`, // URL de webhook pour les notifications serveur
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.number,
        user_id: user.id,
        company_id: invoice.company_id
      }
    };
    
    const paymentResponse = await createDexchangePaymentIntent(paymentParams);
    
    // Extraction de l'URL de paiement avec la fonction dédiée
    const paymentUrl = extractPaymentUrl(paymentResponse);
    
    if (!paymentUrl) {
      console.error('Impossible de trouver l\'URL de paiement dans la réponse:', JSON.stringify(paymentResponse, null, 2));
      throw new AppError("L'URL de paiement n'a pas été retournée par le service de paiement.", 500);
    }
    
    // Récupérer les informations de transaction
    let transactionId = null;
    let transactionStatus = 'initiated';
    
    // Générer à nouveau l'ID pour s'assurer qu'il est disponible pour l'insertion
    const externalTransactionId = `INV-${invoice.id.substring(0, 8)}-${Date.now()}`;
    
    if (paymentResponse.transaction) {
      transactionId = paymentResponse.transaction.transactionId || paymentResponse.transaction.id;
      transactionStatus = paymentResponse.transaction.status || 'initiated';
    } else if (paymentResponse.data?.transaction) {
      transactionId = paymentResponse.data.transaction.transactionId || paymentResponse.data.transaction.id;
      transactionStatus = paymentResponse.data.transaction.status || 'initiated';
    }
    
    // Créer la table payment_transactions si elle n'existe pas
    try {
      await supabaseClient.rpc('create_payment_transactions_table');
    } catch (createError) {
      console.log('Table payment_transactions existe déjà ou erreur de création:', createError.message);
    }

    // Enregistrer la transaction
    try {
      const { data: insertData, error: insertError } = await supabaseClient.from('payment_transactions').insert({
        invoice_id: invoice.id,
        user_id: user.id,
        external_transaction_id: paymentResponse.transaction?.externalTransactionId || externalTransactionId,
        transaction_id: transactionId,
        status: transactionStatus,
        amount: invoice.amount,
        payment_method: payment_method,
        phone_number: phone_number,
        payment_url: paymentUrl
      });
      
      if (insertError) {
        console.error('Erreur lors de l\'insertion de la transaction:', insertError);
      } else {
        console.log('Transaction enregistrée avec succès:', transactionId);
      }
    } catch (dbError) {
      // Log l'erreur mais ne pas interrompre le flux
      console.error('Erreur lors de l\'enregistrement de la transaction:', dbError);
    }
    
    // Mettre à jour le payment_method de la facture
    try {
      const { error: methodUpdateError } = await supabaseClient
        .from('invoices')
        .update({
          payment_method: payment_method
        })
        .eq('id', invoice.id);
      
      if (methodUpdateError) {
        console.error('Erreur lors de la mise à jour du payment_method:', methodUpdateError);
      } else {
        console.log(`✅ Payment method mis à jour: ${payment_method} pour la facture ${invoice.id}`);
      }
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour du payment_method:', updateError);
    }
    
    // Note: Le marquage automatique des paiements Wave se fait maintenant
    // via le système de vérification automatique (check-wave-status) déclenché
    // par payment-status lors du monitoring frontend
    console.log(`🎯 Paiement ${payment_method} initié pour la facture ${invoice.id}`);
    console.log('ℹ️ Le marquage automatique se fera via le système de vérification en temps réel');
    
    return new Response(JSON.stringify({
      paymentUrl: paymentUrl,
      transactionId: transactionId,
      status: transactionStatus
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Erreur de la fonction Edge:', error.message);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return new Response(JSON.stringify({
      error: error.message || "Une erreur inconnue est survenue."
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: statusCode
    });
  }
});
