#!/usr/bin/env node

/**
 * Script pour vérifier si une facture existe dans Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant')
  console.log('Utilisez: SUPABASE_SERVICE_ROLE_KEY=your_key node check-invoice.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const INVOICE_ID = 'INV-54252fa3-1751071164713'

console.log('🔍 VÉRIFICATION FACTURE DANS SUPABASE')
console.log('====================================')
console.log(`Recherche de la facture: ${INVOICE_ID}`)
console.log('')

async function checkInvoice() {
  try {
    // Recherche exacte par ID
    console.log('1. 🎯 Recherche par ID exact...')
    const { data: exactMatch, error: exactError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', INVOICE_ID)
      .single()

    if (exactMatch) {
      console.log('✅ Facture trouvée (ID exact) !')
      console.log('   Statut:', exactMatch.status)
      console.log('   Montant:', exactMatch.amount)
      console.log('   Créée le:', exactMatch.created_at)
      return true
    }

    if (exactError && exactError.code !== 'PGRST116') {
      console.log('❌ Erreur lors de la recherche exacte:', exactError.message)
    } else {
      console.log('⚠️  Aucune facture trouvée avec cet ID exact')
    }

    // Recherche partielle
    console.log('')
    console.log('2. 🔍 Recherche partielle...')
    const { data: partialMatches, error: partialError } = await supabase
      .from('invoices')
      .select('*')
      .ilike('id', '%54252fa3%')
      .order('created_at', { ascending: false })
      .limit(5)

    if (partialError) {
      console.log('❌ Erreur lors de la recherche partielle:', partialError.message)
    } else if (partialMatches && partialMatches.length > 0) {
      console.log(`✅ ${partialMatches.length} facture(s) trouvée(s) avec '54252fa3' :`)
      partialMatches.forEach((invoice, index) => {
        console.log(`   ${index + 1}. ID: ${invoice.id}`)
        console.log(`      Statut: ${invoice.status}`)
        console.log(`      Montant: ${invoice.amount}`)
        console.log(`      Créée le: ${invoice.created_at}`)
        console.log('')
      })
    } else {
      console.log('⚠️  Aucune facture trouvée avec ce fragment d\'ID')
    }

    // Recherche des factures récentes
    console.log('3. 📋 Dernières factures créées...')
    const { data: recentInvoices, error: recentError } = await supabase
      .from('invoices')
      .select('id, status, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.log('❌ Erreur lors de la recherche des factures récentes:', recentError.message)
    } else if (recentInvoices && recentInvoices.length > 0) {
      console.log(`📄 Les ${recentInvoices.length} dernières factures :`)
      recentInvoices.forEach((invoice, index) => {
        console.log(`   ${index + 1}. ${invoice.id} - ${invoice.status} - ${invoice.amount} - ${invoice.created_at}`)
      })
    } else {
      console.log('⚠️  Aucune facture trouvée dans la base')
    }

    return false

  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
    return false
  }
}

async function createTestInvoice() {
  console.log('')
  console.log('4. 🛠️  Création d\'une facture de test...')
  
  const testInvoice = {
    id: INVOICE_ID,
    amount: 200,
    status: 'pending',
    company_id: null, // Vous devrez peut-être ajuster selon votre schéma
    description: 'Facture de test pour webhook DExchange',
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert(testInvoice)
      .select()

    if (error) {
      console.log('❌ Erreur lors de la création de la facture de test:', error.message)
      console.log('   Détails:', error.details)
      console.log('   Hint:', error.hint)
    } else {
      console.log('✅ Facture de test créée avec succès !')
      console.log('   ID:', data[0].id)
      console.log('   Maintenant vous pouvez tester le webhook à nouveau')
    }
  } catch (error) {
    console.log('❌ Exception lors de la création:', error.message)
  }
}

// Exécution
checkInvoice().then(found => {
  if (!found) {
    console.log('')
    console.log('💡 SOLUTION RECOMMANDÉE:')
    console.log('1. Créer une facture avec l\'ID exact depuis l\'application')
    console.log('2. Ou utiliser une facture existante pour tester le webhook')
    console.log('3. Vérifier que l\'ID correspond exactement')
    
    // Proposer de créer une facture de test
    console.log('')
    console.log('Voulez-vous créer une facture de test ? (Décommentez la ligne suivante)')
    console.log('// createTestInvoice()')
  }
})
