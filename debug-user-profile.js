// Script de debug pour vérifier le profil utilisateur
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugUsers() {
  console.log('🔍 Vérification des utilisateurs existants...')
  
  // Lister tous les utilisateurs auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Erreur récupération utilisateurs auth:', authError)
    return
  }
  
  console.log(`📊 ${authUsers.users.length} utilisateurs trouvés dans auth.users`)
  
  for (const authUser of authUsers.users) {
    console.log(`\n👤 Utilisateur Auth: ${authUser.email} (${authUser.id})`)
    
    // Vérifier s'il a un profil dans public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, company_id,
        companies(id, name)
      `)
      .eq('id', authUser.id)
      .single()
    
    if (profileError) {
      console.log(`   ❌ Pas de profil dans public.users: ${profileError.message}`)
    } else {
      console.log(`   ✅ Profil trouvé: ${profile.first_name} ${profile.last_name} (${profile.role})`)
      console.log(`   🏢 Entreprise: ${profile.companies?.name || 'Aucune'}`)
    }
  }
  
  // Lister toutes les entreprises
  console.log('\n🏢 Entreprises disponibles:')
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, email')
  
  companies?.forEach(company => {
    console.log(`   - ${company.name} (${company.email})`)
  })
}

debugUsers().catch(console.error)
