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

async function checkInvoicesStructure() {
  console.log('🔍 Vérification de la structure de la table invoices...')
  
  try {
    // Essayer de récupérer quelques factures pour voir la structure
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur lors de la requête:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Structure de la table invoices:')
      const columns = Object.keys(data[0])
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`)
      })
      
      // Vérifier si la colonne currency existe
      if (columns.includes('currency')) {
        console.log('✅ La colonne currency existe!')
      } else {
        console.log('⚠️  La colonne currency n\'existe pas - il faut l\'ajouter')
      }
      
      console.log('\n📄 Exemple de facture:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('ℹ️  Aucune facture trouvée - table vide')
      
      // Essayer de créer une facture test pour voir les colonnes requises
      console.log('🧪 Test de création d\'une facture...')
      const testInvoice = {
        amount: 1000,
        currency: 'XOF',
        status: 'pending',
        reference: 'TEST-' + Date.now(),
        customer_email: 'test@example.com',
        description: 'Test de structure'
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('invoices')
        .insert(testInvoice)
        .select()
      
      if (insertError) {
        console.log('❌ Erreur lors du test d\'insertion:', insertError.message)
        if (insertError.message.includes('currency')) {
          console.log('⚠️  La colonne currency n\'existe probablement pas')
        }
      } else {
        console.log('✅ Test d\'insertion réussi!')
        console.log(JSON.stringify(insertData[0], null, 2))
      }
    }
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
  }
}

checkInvoicesStructure()
