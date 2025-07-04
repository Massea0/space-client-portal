#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addCurrencyColumn() {
  console.log('🔨 Ajout de la colonne currency à la table invoices...')
  
  try {
    // Vérifier d'abord si la colonne existe déjà
    const { data: existingData, error: checkError } = await supabase
      .from('invoices')
      .select('currency')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ La colonne currency existe déjà!')
      return
    }
    
    console.log('⚙️  La colonne currency n\'existe pas, ajout en cours...')
    
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('add_currency_column.sql', 'utf8')
    
    // Exécuter la migration via RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    })
    
    if (error) {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', error.message)
      
      // Tentative alternative : ajouter directement via une requête simple
      console.log('🔄 Tentative alternative...')
      
      const { error: altError } = await supabase
        .rpc('exec_sql', { 
          sql_query: "ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'XOF' NOT NULL;" 
        })
      
      if (altError) {
        console.error('❌ Erreur alternative:', altError.message)
        
        // Dernière tentative : utiliser une fonction Edge
        console.log('🔄 Dernière tentative via fonction Edge...')
        await executeMigrationViaEdge()
      } else {
        console.log('✅ Colonne currency ajoutée avec succès!')
      }
    } else {
      console.log('✅ Migration exécutée avec succès!')
    }
    
    // Vérifier que la colonne a été ajoutée
    await verifyColumnAdded()
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
  }
}

async function executeMigrationViaEdge() {
  console.log('🚀 Exécution de la migration via fonction Edge...')
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/init-payment-database`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add_currency_column'
      })
    })
    
    const result = await response.json()
    console.log('📤 Résultat de la fonction Edge:', result)
    
  } catch (err) {
    console.error('❌ Erreur fonction Edge:', err.message)
  }
}

async function verifyColumnAdded() {
  console.log('🔍 Vérification que la colonne a été ajoutée...')
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, currency')
      .limit(1)
    
    if (error) {
      console.error('❌ La colonne currency n\'existe toujours pas:', error.message)
    } else {
      console.log('✅ Colonne currency vérifiée avec succès!')
      if (data.length > 0) {
        console.log('💰 Devise par défaut:', data[0].currency)
      }
    }
  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err.message)
  }
}

addCurrencyColumn()
