-- ============================================================================
-- SCRIPT D'AUDIT ET PRÉPARATION MODULE RH - MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Audit du schéma existant et préparation pour le module RH avancé
-- À exécuter depuis l'interface web Supabase (SQL Editor)
-- ============================================================================

-- PHASE 1: AUDIT DU SCHEMA EXISTANT
-- ============================================================================

-- 1.1 Vérification de l'existence des tables principales
SELECT 
    'AUDIT TABLES EXISTANTES' as audit_type,
    table_name,
    CASE 
        WHEN table_name IN ('users', 'companies', 'devis', 'invoices', 'tickets') 
        THEN '✅ Table métier existante'
        WHEN table_name LIKE '%payment%' 
        THEN '💳 Table paiement'
        WHEN table_name LIKE '%contract%' 
        THEN '📋 Table contrat'
        WHEN table_name LIKE '%ai_%' OR table_name LIKE '%prediction%'
        THEN '🤖 Table IA'
        ELSE '📋 Autre table'
    END as category
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 1.2 Vérification des contraintes de clés étrangères
SELECT 
    'AUDIT FOREIGN KEYS' as audit_type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 1.3 Vérification des politiques RLS
SELECT 
    'AUDIT RLS POLICIES' as audit_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 1.4 Audit des colonnes de la table users (important pour RH)
SELECT 
    'AUDIT TABLE USERS' as audit_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- PHASE 2: PRÉPARATION DES DONNÉES RH
-- ============================================================================

-- 2.1 Vérification des rôles utilisateurs existants
SELECT 
    'AUDIT USER ROLES' as audit_type,
    role,
    COUNT(*) as user_count,
    STRING_AGG(email, ', ') as sample_emails
FROM users 
WHERE is_active = true
GROUP BY role
ORDER BY user_count DESC;

-- 2.2 Vérification de l'existence des tables RH
SELECT 
    'VERIFICATION TABLES RH' as audit_type,
    expected_tables.table_name,
    CASE 
        WHEN t.table_name IS NOT NULL 
        THEN '✅ Table RH existante'
        ELSE '❌ Table RH manquante'
    END as status
FROM (
    VALUES 
        ('branches'),
        ('departments'), 
        ('positions'),
        ('employees')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t 
    ON t.table_name = expected_tables.table_name 
    AND t.table_schema = 'public';

-- ============================================================================
-- PHASE 3: PRÉPARATION DES RÔLES ET PERMISSIONS
-- ============================================================================

-- 3.1 Ajout de nouveaux rôles RH si nécessaire
-- (Cette section sera exécutée conditionnellement)

-- Vérification des rôles RH dans la table users
SELECT 
    'PREPARATION ROLES RH' as audit_type,
    'Rôles RH nécessaires:' as description,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE role = 'hr_manager') 
        THEN '✅ hr_manager existe'
        ELSE '⚠️ hr_manager à créer'
    END as hr_manager_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE role = 'hr_admin') 
        THEN '✅ hr_admin existe'
        ELSE '⚠️ hr_admin à créer'
    END as hr_admin_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE role = 'employee') 
        THEN '✅ employee existe'
        ELSE '⚠️ employee à créer'
    END as employee_status;

-- ============================================================================
-- PHASE 4: VALIDATION DE L'INTÉGRITÉ
-- ============================================================================

-- 4.1 Vérification des contraintes d'intégrité
SELECT 
    'VALIDATION INTEGRITE' as audit_type,
    'Companies sans users:' as check_type,
    COUNT(*) as count
FROM companies c
LEFT JOIN users u ON u.company_id = c.id
WHERE u.id IS NULL;

SELECT 
    'VALIDATION INTEGRITE' as audit_type,
    'Users sans company:' as check_type,
    COUNT(*) as count
FROM users u
LEFT JOIN companies c ON c.id = u.company_id
WHERE u.company_id IS NOT NULL AND c.id IS NULL;

-- 4.2 Vérification des données manquantes critiques
SELECT 
    'VALIDATION DONNEES' as audit_type,
    'Users avec email null:' as check_type,
    COUNT(*) as count
FROM users 
WHERE email IS NULL OR email = '';

SELECT 
    'VALIDATION DONNEES' as audit_type,
    'Companies avec nom null:' as check_type,
    COUNT(*) as count
FROM companies 
WHERE name IS NULL OR name = '';

-- ============================================================================
-- PHASE 5: RECOMMANDATIONS POUR L'IMPLÉMENTATION RH
-- ============================================================================

-- 5.1 Évaluation de la préparation RH
SELECT 
    'RECOMMANDATIONS RH' as audit_type,
    'État de préparation:' as description,
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
                AND table_name IN ('branches', 'departments', 'positions', 'employees')
        ) = 4 
        THEN '✅ Tables RH déjà créées - Migration appliquée'
        ELSE '⚠️ Tables RH manquantes - Migration nécessaire'
    END as hr_tables_status,
    
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM users 
            WHERE role IN ('hr_manager', 'hr_admin', 'super_admin')
        ) > 0 
        THEN '✅ Utilisateurs RH disponibles'
        ELSE '⚠️ Aucun utilisateur RH - Création nécessaire'
    END as hr_users_status;

-- ============================================================================
-- PHASE 6: ACTIONS CONDITIONNELLES (À DÉCOMMENTER SI NÉCESSAIRE)
-- ============================================================================

-- 6.1 Création d'un utilisateur RH de test (À DÉCOMMENTER SI BESOIN)
-- INSERT INTO users (
--     id,
--     first_name,
--     last_name,
--     email,
--     role,
--     company_id,
--     is_active
-- ) VALUES (
--     gen_random_uuid(),
--     'Admin',
--     'RH',
--     'admin.rh@myspace.com',
--     'hr_manager',
--     (SELECT id FROM companies LIMIT 1),
--     true
-- )
-- ON CONFLICT (email) DO NOTHING;

-- 6.2 Mise à jour des rôles existants (À DÉCOMMENTER SI BESOIN)
-- UPDATE users 
-- SET role = 'hr_manager' 
-- WHERE email = 'votre.email@example.com'
--     AND role = 'admin';

-- ============================================================================
-- PHASE 7: RÉSUMÉ DE L'AUDIT
-- ============================================================================

SELECT 
    'RESUME AUDIT' as audit_type,
    'Nombre total de tables:' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'RESUME AUDIT' as audit_type,
    'Nombre total d''utilisateurs actifs:' as metric,
    COUNT(*) as value
FROM users 
WHERE is_active = true

UNION ALL

SELECT 
    'RESUME AUDIT' as audit_type,
    'Nombre de companies:' as metric,
    COUNT(*) as value
FROM companies

UNION ALL

SELECT 
    'RESUME AUDIT' as audit_type,
    'Edge Functions disponibles:' as metric,
    37 as value  -- Basé sur l'audit précédent

ORDER BY metric;

-- ============================================================================
-- INSTRUCTIONS D'EXÉCUTION
-- ============================================================================

-- 🔴 IMPORTANT: AVANT D'EXÉCUTER CE SCRIPT
--
-- 1. Connectez-vous à votre interface Supabase
-- 2. Allez dans SQL Editor
-- 3. Copiez-collez ce script
-- 4. Exécutez section par section pour vérifier les résultats
--
-- 📋 ACTIONS APRÈS L'AUDIT:
--
-- ✅ Si les tables RH existent déjà:
--    - Le module RH peut être activé immédiatement
--    - Vérifiez les permissions RLS
--    - Testez les APIs RH existantes
--
-- ⚠️ Si les tables RH n'existent pas:
--    - Appliquez la migration 20250703200000_create_hr_foundation.sql
--    - Créez un utilisateur hr_manager
--    - Configurez les politiques RLS
--
-- 🚀 PROCHAINES ÉTAPES:
--    1. Exécuter ce script d'audit
--    2. Analyser les résultats
--    3. Appliquer les corrections recommandées
--    4. Tester l'interface RH dans l'application
--
-- 📞 SUPPORT: 
--    - Documentation: docs/hr-integration/
--    - Logs: Vérifiez les Edge Functions logs
--    - Tests: Utilisez les APIs /api/hr/*

-- Fin du script d'audit RH MySpace
-- Version: 1.0
-- Date: 4 juillet 2025
