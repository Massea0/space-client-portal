#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndWaitForCurrency() {
  console.log('🔍 Vérification de la colonne currency...')
  
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('currency')
        .limit(1)
      
      if (!error) {
        console.log('✅ La colonne currency existe!')
        console.log('🎉 Migration réussie!')
        
        // Mettre à jour les factures existantes qui n'ont pas de devise
        const { data: updateData, error: updateError } = await supabase
          .from('invoices')
          .update({ currency: 'XOF' })
          .is('currency', null)
          .select()
        
        if (updateError) {
          console.log('⚠️  Avertissement lors de la mise à jour des devises:', updateError.message)
        } else {
          console.log(`💰 ${updateData?.length || 0} factures mises à jour avec la devise XOF`)
        }
        
        // Exécuter le test final
        console.log('\n🚀 Lancement du test final du système...')
        await import('./test-final-payment-system.js')
        
        return true
      }
      
      attempts++
      console.log(`⏳ Tentative ${attempts}/${maxAttempts} - La colonne currency n'existe pas encore...`)
      
      if (attempts === 1) {
        console.log('')
        console.log('📋 INSTRUCTIONS:')
        console.log('1. Aller sur: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/editor')
        console.log('2. Cliquer sur la table "invoices"')
        console.log('3. Cliquer sur "Add Column"')
        console.log('4. Nom: currency, Type: text, Défaut: XOF, Not null: ✓')
        console.log('5. Sauvegarder')
        console.log('')
      }
      
      // Attendre 5 secondes avant la prochaine vérification
      await new Promise(resolve => setTimeout(resolve, 5000))
      
    } catch (err) {
      console.error('❌ Erreur lors de la vérification:', err.message)
      break
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('⏰ Délai d\'attente dépassé')
    console.log('⚠️  Veuillez ajouter manuellement la colonne currency et relancer ce script')
  }
  
  return false
}

checkAndWaitForCurrency()
