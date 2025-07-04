-- ============================================================================
-- SCRIPT FINAL SIMPLIFIÉ - FINALISATION MODULE RH MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Finaliser le module RH sans problèmes de contraintes FK
-- Durée: 3-5 minutes d'exécution
-- À exécuter dans l'interface web Supabase (SQL Editor)
-- ============================================================================

-- ÉTAPE 1: CORRECTION DE LA CONTRAINTE USERS.ROLE
-- ============================================================================

-- Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Créer la nouvelle contrainte avec tous les rôles RH
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN (
    'client', 'admin', 'user', 'company_admin', 'manager',
    'hr_admin', 'hr_manager', 'hr_employee', 'employee', 
    'supplier', 'super_admin'
));

SELECT '✅ Contrainte users.role corrigée avec rôles RH' as status;

-- ÉTAPE 2: AJOUT COLONNE COMPANY_ID AUX BRANCHES (SI NÉCESSAIRE)
-- ============================================================================

-- Vérifier si la colonne existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'company_id')
        THEN '✅ Colonne company_id existe déjà dans branches'
        ELSE '⚠️ Colonne company_id manquante - sera ajoutée'
    END as company_id_status;

-- Ajouter la colonne si nécessaire (exécuter manuellement si besoin)
/*
ALTER TABLE branches ADD COLUMN IF NOT EXISTS company_id UUID;
UPDATE branches SET company_id = (SELECT id FROM companies ORDER BY created_at LIMIT 1) WHERE company_id IS NULL;
ALTER TABLE branches ADD CONSTRAINT fk_branches_company FOREIGN KEY (company_id) REFERENCES companies(id);
CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);
*/

-- ÉTAPE 3: CRÉATION SIMPLIFIÉE DES UTILISATEURS RH
-- ============================================================================

-- Obtenir une company_id valide
SELECT 
    id as company_id, 
    name as company_name,
    '👆 Utilisez cet ID pour créer les utilisateurs RH' as instruction
FROM companies 
ORDER BY created_at 
LIMIT 3;

-- Script de création hr_admin (remplacer COMPANY_ID_ICI)
SELECT '
-- COPIEZ ET EXÉCUTEZ SÉPARÉMENT (remplacez COMPANY_ID_ICI par un ID du résultat précédent):

INSERT INTO users (
    id, first_name, last_name, email, role, company_id, phone, created_at, is_active
) 
SELECT 
    gen_random_uuid(),
    ''Administrateur'',
    ''RH'',
    ''hr.admin@myspace.com'',
    ''hr_admin'',
    ''COMPANY_ID_ICI''::uuid,
    ''+221 77 123 45 67'',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ''hr.admin@myspace.com'');

INSERT INTO users (
    id, first_name, last_name, email, role, company_id, phone, created_at, is_active
) 
SELECT 
    gen_random_uuid(),
    ''Manager'',
    ''RH'',
    ''hr.manager@myspace.com'',
    ''hr_manager'',
    ''COMPANY_ID_ICI''::uuid,
    ''+221 77 123 45 68'',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ''hr.manager@myspace.com'');
' as creation_script;

-- ÉTAPE 4: VALIDATION RAPIDE
-- ============================================================================

-- Vérifier les tables RH
SELECT 
    'Tables RH' as category,
    COUNT(*) as count,
    '4 attendues' as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('branches', 'departments', 'positions', 'employees')

UNION ALL

-- Vérifier les utilisateurs RH
SELECT 
    'Utilisateurs RH' as category,
    COUNT(*) as count,
    '2+ attendus' as expected
FROM users 
WHERE role LIKE 'hr_%'

UNION ALL

-- Vérifier les companies
SELECT 
    'Companies' as category,
    COUNT(*) as count,
    '1+ requises' as expected
FROM companies

UNION ALL

-- Vérifier le total des tables
SELECT 
    'Total tables' as category,
    COUNT(*) as count,
    '28+ attendues' as expected
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- ÉTAPE 5: DÉTAILS DES UTILISATEURS RH (SI CRÉÉS)
-- ============================================================================

SELECT 
    '=== UTILISATEURS RH ===' as section,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.is_active,
    c.name as company_name,
    u.created_at
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.role LIKE 'hr_%'
ORDER BY u.created_at DESC;

-- ÉTAPE 6: VALIDATION DE LA CONTRAINTE ROLE
-- ============================================================================

SELECT 
    '=== CONTRAINTE ROLE ===' as section,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK';

-- ÉTAPE 7: RÉSUMÉ FINAL
-- ============================================================================

SELECT 
    '🎉 MODULE RH MYSPACE - FINALISATION' as title,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) as tables_rh,
    (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') as users_rh,
    (SELECT COUNT(*) FROM companies) as companies_total,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) = 4
        THEN '✅ TABLES RH OK'
        ELSE '⚠️ TABLES RH MANQUANTES'
    END as status_tables,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') >= 2
        THEN '✅ UTILISATEURS RH OK'
        ELSE '⚠️ CRÉER UTILISATEURS RH'
    END as status_users;

-- ============================================================================
-- INSTRUCTIONS FINALES
-- ============================================================================

SELECT '
🎯 INSTRUCTIONS FINALES:

1. ✅ CONTRAINTE ROLE: Corrigée automatiquement
2. 📋 COMPANY_ID: Vérifiez le statut ci-dessus
3. 👥 UTILISATEURS RH: Utilisez le script fourni avec un company_id valide
4. 🚀 VALIDATION: Relancez ce script pour vérifier

📧 COMPTES À CRÉER:
   • hr.admin@myspace.com (Administrateur RH)
   • hr.manager@myspace.com (Manager RH)

🔗 ACCÈS FINAL:
   • Supabase: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw
   • MySpace: https://myspace.arcadis.tech

🎉 MODULE RH PRÊT POUR PRODUCTION!
' as instructions;

-- ============================================================================
-- 🎉 SCRIPT SIMPLIFIÉ TERMINÉ
-- ============================================================================
