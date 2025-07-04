// test-prod-connection.js
// Script pour tester la connexion à la vraie base et appliquer la migration Sage

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testConnection() {
  console.log('🔄 Test de connexion à la base de production...')
  
  try {
    // Tester la connexion en listant quelques factures
    const { data, error } = await supabase
      .from('invoices')
      .select('id, number, status')
      .limit(5)
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      return false
    }
    
    console.log('✅ Connexion réussie! Factures trouvées:')
    data.forEach(invoice => console.log(`  - ${invoice.number} (${invoice.status})`))
    
    return true
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
    return false
  }
}

async function checkInvoicesTable() {
  console.log('\n🔍 Vérification de la table invoices...')
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, sage_export_status, sage_validation_needed')
      .limit(1)
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️  Colonnes Sage manquantes, migration nécessaire')
        return true // Table existe mais sans colonnes Sage
      } else {
        console.error('❌ Table invoices non trouvée:', error.message)
        return false
      }
    }
    
    console.log('✅ Table invoices existe avec les colonnes Sage!')
    console.log('✅ Migration Sage déjà appliquée!')
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    return false
  }
}

async function applySageMigration() {
  console.log('\n🚀 Application de la migration Sage...')
  
  try {
    // Utiliser des requêtes SQL directes via supabase-js
    console.log('  - Ajout des colonnes Sage...')
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE public.invoices 
        ADD COLUMN IF NOT EXISTS sage_export_status VARCHAR(50) DEFAULT 'not_processed',
        ADD COLUMN IF NOT EXISTS sage_export_details JSONB,
        ADD COLUMN IF NOT EXISTS sage_export_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS sage_transaction_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sage_account_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS sage_validation_needed BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS sage_anomalies JSONB,
        ADD COLUMN IF NOT EXISTS sage_processed_by UUID;
      `
    })
    
    if (alterError) {
      console.error('❌ Erreur ajout colonnes:', alterError.message)
      
      // Essayer une approche alternative via l'API REST
      console.log('  - Tentative alternative via SQL Editor...')
      
      // Instructions pour l'utilisateur
      console.log(`
📝 MIGRATION MANUELLE REQUISE:
   
1. Allez sur: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/sql/new
2. Copiez-collez ce SQL:

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sage_export_status VARCHAR(50) DEFAULT 'not_processed',
ADD COLUMN IF NOT EXISTS sage_export_details JSONB,
ADD COLUMN IF NOT EXISTS sage_export_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sage_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS sage_account_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS sage_validation_needed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sage_anomalies JSONB,
ADD COLUMN IF NOT EXISTS sage_processed_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_invoices_sage_export_status ON public.invoices(sage_export_status);

3. Cliquez sur "Run"
4. Relancez ce script pour vérifier
      `)
      return false
    }
    
    console.log('  - Création de l\'index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_invoices_sage_export_status ON public.invoices(sage_export_status);'
    })
    
    if (indexError) {
      console.warn('⚠️  Index non créé:', indexError.message)
    }
    
    console.log('✅ Migration Sage appliquée avec succès!')
    return true
    
  } catch (error) {
    console.error('❌ Exception migration:', error.message)
    return false
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('📊 TEST DE CONNEXION BASE PRODUCTION')
  console.log('='.repeat(50))
  
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  const invoicesOk = await checkInvoicesTable()
  if (!invoicesOk) {
    process.exit(1)
  }
  
  // Demander confirmation pour la migration
  console.log('\n⚠️  Voulez-vous appliquer la migration Sage? (Cette action modifie la base de production)')
  console.log('Pour continuer, relancez le script avec --apply-migration')
  
  if (process.argv.includes('--apply-migration')) {
    await applySageMigration()
  }
  
  console.log('\n✅ Test terminé!')
}

main().catch(console.error)
