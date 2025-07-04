// test-sage-integration-flow.js
// Script pour tester le flux complet d'intégration Sage

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkSageIntegrationData() {
  console.log('🔍 Vérification des données d\'intégration Sage...\n')
  
  try {
    // Vérifier les factures avec statut Sage
    const { data: invoicesWithSage, error } = await supabase
      .from('invoices')
      .select(`
        id, number, status, amount,
        sage_export_status, sage_validation_needed, 
        sage_anomalies, sage_export_details
      `)
      .not('sage_export_status', 'is', null)
      .limit(10)
    
    if (error) {
      console.error('❌ Erreur requête factures Sage:', error.message)
      return false
    }
    
    console.log(`📊 Factures avec données Sage: ${invoicesWithSage.length}`)
    invoicesWithSage.forEach(invoice => {
      console.log(`  - ${invoice.number}: ${invoice.sage_export_status} (validation: ${invoice.sage_validation_needed})`)
    })
    
    // Vérifier les factures payées récentes sans traitement Sage
    const { data: unprocessedInvoices, error: unprocessedError } = await supabase
      .from('invoices')
      .select('id, number, status, amount, sage_export_status')
      .eq('status', 'paid')
      .eq('sage_export_status', 'not_processed')
      .limit(5)
    
    if (unprocessedError) {
      console.error('❌ Erreur requête factures non traitées:', unprocessedError.message)
      return false
    }
    
    console.log(`\n💼 Factures payées non traitées pour Sage: ${unprocessedInvoices.length}`)
    unprocessedInvoices.forEach(invoice => {
      console.log(`  - ${invoice.number}: ${invoice.amount}€`)
    })
    
    return { invoicesWithSage, unprocessedInvoices }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
    return false
  }
}

async function testSageProcessingFunction(invoiceId) {
  console.log(`\n🧠 Test de la fonction de traitement IA Sage pour la facture ${invoiceId}...`)
  
  try {
    // Récupérer les informations de base de la facture
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('number, amount')
      .eq('id', invoiceId)
      .single()
    
    if (invoiceError || !invoiceData) {
      console.error('❌ Erreur récupération facture:', invoiceError?.message || 'Facture non trouvée')
      return false
    }
    
    console.log(`📄 Traitement facture ${invoiceData.number} (${invoiceData.amount}€)`)
    
    // Appeler la fonction avec seulement invoice_id (transaction simulée)
    const { data, error } = await supabase.functions.invoke('process-dexchange-payment-for-sage', {
      body: { 
        invoice_id: invoiceId
        // transaction_id est optionnel maintenant
      }
    })
    
    if (error) {
      console.error('❌ Erreur fonction traitement:', error.message)
      return false
    }
    
    console.log('✅ Traitement IA réussi!')
    console.log('📄 Résultat:', JSON.stringify(data, null, 2))
    
    return data
    
  } catch (error) {
    console.error('❌ Exception fonction:', error.message)
    return false
  }
}

async function checkSageValidationQueue() {
  console.log('\n📋 Vérification de la file d\'attente de validation Sage...')
  
  try {
    const { data: pendingValidations, error } = await supabase
      .from('invoices')
      .select(`
        id, number, amount,
        sage_export_status, sage_validation_needed,
        sage_anomalies, sage_export_details
      `)
      .eq('sage_validation_needed', true)
      .in('sage_export_status', ['ai_processed', 'anomaly_detected'])
      .limit(10)
    
    if (error) {
      console.error('❌ Erreur requête validations:', error.message)
      return false
    }
    
    console.log(`🎯 Factures en attente de validation: ${pendingValidations.length}`)
    pendingValidations.forEach(invoice => {
      const hasAnomalies = invoice.sage_anomalies && Object.keys(invoice.sage_anomalies).length > 0
      console.log(`  - ${invoice.number}: ${invoice.sage_export_status} ${hasAnomalies ? '⚠️ ' : '✅'}`)
      
      if (hasAnomalies) {
        console.log(`    Anomalies: ${JSON.stringify(invoice.sage_anomalies)}`)
      }
    })
    
    return pendingValidations
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
    return false
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('🧪 TEST DU FLUX D\'INTÉGRATION SAGE COMPLET')
  console.log('='.repeat(60))
  
  // Étape 1: Vérifier l'état actuel
  const integrationData = await checkSageIntegrationData()
  if (!integrationData) {
    console.log('❌ Impossible de vérifier les données Sage')
    process.exit(1)
  }
  
  // Étape 2: Vérifier la file d'attente de validation
  const pendingValidations = await checkSageValidationQueue()
  
  // Étape 3: Si on a des factures non traitées, en tester une
  if (integrationData.unprocessedInvoices && integrationData.unprocessedInvoices.length > 0) {
    const testInvoice = integrationData.unprocessedInvoices[0]
    console.log(`\n🎯 Test du traitement IA sur la facture: ${testInvoice.number}`)
    
    const aiResult = await testSageProcessingFunction(testInvoice.id)
    if (aiResult) {
      console.log('✅ Test IA réussi!')
      
      // Re-vérifier l'état après traitement
      console.log('\n🔄 Vérification post-traitement...')
      await checkSageValidationQueue()
    }
  } else {
    console.log('\n💡 Aucune facture non traitée trouvée pour le test')
  }
  
  console.log('\n📱 Interface d\'administration disponible sur: http://localhost:3000/admin/sage-integration')
  console.log('\n✅ Test du flux d\'intégration Sage terminé!')
}

main().catch(console.error)
