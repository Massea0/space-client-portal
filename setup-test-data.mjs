// setup-test-data.js - Créer des données de test dans Supabase

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestData() {
  console.log('🔧 Création des données de test...')
  
  // 1. Créer une compagnie de test
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .upsert({
      id: 'test-company-1',
      name: 'Entreprise Test',
      email: 'test@entreprise.com',
      phone: '+33123456789',
      address: '123 Rue de Test, 75001 Paris',
      created_at: new Date().toISOString()
    })
    .select()
  
  if (companyError) {
    console.error('❌ Erreur création compagnie:', companyError)
    return false
  }
  console.log('✅ Compagnie de test créée')
  
  // 2. Créer un utilisateur de test
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      id: 'test-user-1',
      email: 'test@user.com',
      name: 'Utilisateur Test',
      role: 'client',
      company_id: 'test-company-1',
      created_at: new Date().toISOString()
    })
    .select()
  
  if (userError) {
    console.error('❌ Erreur création utilisateur:', userError)
    return false
  }
  console.log('✅ Utilisateur de test créé')
  
  // 3. Créer une facture de test
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .upsert({
      id: 'test-invoice-1',
      number: 'FAC-2025-001',
      company_id: 'test-company-1',
      company_name: 'Entreprise Test',
      object: 'Facture de test pour l\'IA',
      amount: 5000,
      status: 'sent',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
  
  if (invoiceError) {
    console.error('❌ Erreur création facture:', invoiceError)
    return false
  }
  console.log('✅ Facture de test créée')
  
  // 4. Créer un devis de test
  const { data: quote, error: quoteError } = await supabase
    .from('devis')
    .upsert({
      id: 'test-quote-1',
      number: 'DEV-2025-001',
      company_id: 'test-company-1',
      company_name: 'Entreprise Test',
      object: 'Développement application web avec IA',
      amount: 15000,
      status: 'draft',
      created_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
  
  if (quoteError) {
    console.error('❌ Erreur création devis:', quoteError)
    return false
  }
  console.log('✅ Devis de test créé')
  
  // 5. Créer des items de devis
  const { error: itemsError } = await supabase
    .from('devis_items')
    .upsert([
      {
        id: 'test-item-1',
        devis_id: 'test-quote-1',
        description: 'Développement frontend React avec IA',
        quantity: 1,
        unit_price: 8000,
        total: 8000
      },
      {
        id: 'test-item-2',
        devis_id: 'test-quote-1',
        description: 'Développement backend Node.js avec optimisations IA',
        quantity: 1,
        unit_price: 7000,
        total: 7000
      }
    ])
  
  if (itemsError) {
    console.error('❌ Erreur création items:', itemsError)
    return false
  }
  console.log('✅ Items de devis créés')
  
  return true
}

async function main() {
  console.log('🚀 Configuration des données de test pour l\'IA')
  console.log('=' .repeat(50))
  
  const success = await createTestData()
  
  if (success) {
    console.log('🎉 Données de test créées avec succès!')
    console.log('Vous pouvez maintenant tester les fonctions IA.')
  } else {
    console.log('❌ Échec de la création des données de test.')
  }
}

main().catch(console.error)
