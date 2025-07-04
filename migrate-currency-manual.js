#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addCurrencyColumnManually() {
  console.log('🔨 Tentative d\'ajout de la colonne currency...')
  
  try {
    // Méthode 1: Vérifier si la colonne existe en essayant de la sélectionner
    console.log('🔍 Vérification de l\'existence de la colonne currency...')
    
    const { data: testData, error: testError } = await supabase
      .from('invoices')
      .select('currency')
      .limit(1)
    
    if (!testError) {
      console.log('✅ La colonne currency existe déjà!')
      console.log('💰 Exemple de devise:', testData[0]?.currency || 'N/A')
      return true
    }
    
    console.log('⚠️  La colonne currency n\'existe pas')
    console.log('🔧 Erreur détectée:', testError.message)
    
    // Méthode 2: Essayer de mettre à jour une facture avec currency
    console.log('🧪 Test d\'ajout de currency sur une facture existante...')
    
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1)
    
    if (fetchError || !invoices.length) {
      console.error('❌ Impossible de récupérer les factures:', fetchError?.message)
      return false
    }
    
    const invoiceId = invoices[0].id
    
    const { data: updateData, error: updateError } = await supabase
      .from('invoices')
      .update({ currency: 'XOF' })
      .eq('id', invoiceId)
      .select()
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError.message)
      
      if (updateError.message.includes('column "currency" of relation "invoices" does not exist')) {
        console.log('')
        console.log('📋 INSTRUCTIONS MANUELLES:')
        console.log('─'.repeat(50))
        console.log('1. Aller sur https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/editor')
        console.log('2. Cliquer sur la table "invoices"')
        console.log('3. Cliquer sur "Add Column" (+ ou bouton d\'ajout)')
        console.log('4. Nom de la colonne: currency')
        console.log('5. Type: text')
        console.log('6. Valeur par défaut: XOF')
        console.log('7. Cocher "Not null"')
        console.log('8. Cliquer sur "Save"')
        console.log('─'.repeat(50))
        console.log('')
        
        return false
      }
    } else {
      console.log('✅ Colonne currency ajoutée et mise à jour avec succès!')
      console.log('📄 Facture mise à jour:', updateData[0])
      return true
    }
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
    return false
  }
}

async function verifyCurrencyColumn() {
  console.log('🔍 Vérification finale de la colonne currency...')
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, amount, currency, status')
      .limit(3)
    
    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message)
      return false
    }
    
    console.log('✅ Vérification réussie! Exemples de factures:')
    data.forEach((invoice, i) => {
      console.log(`${i + 1}. ID: ${invoice.id.slice(0, 8)}... | Montant: ${invoice.amount} ${invoice.currency || 'N/A'} | Statut: ${invoice.status}`)
    })
    
    return true
    
  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err.message)
    return false
  }
}

async function main() {
  console.log('🚀 Démarrage de la migration currency...')
  
  const added = await addCurrencyColumnManually()
  
  if (added) {
    await verifyCurrencyColumn()
    console.log('🎉 Migration terminée avec succès!')
  } else {
    console.log('⚠️  Migration nécessaire manuellement')
  }
}

main()
