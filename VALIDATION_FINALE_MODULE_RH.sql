-- ============================================================================
-- VALIDATION FINALE DÉPLOIEMENT MODULE RH
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Validation complète du déploiement du module RH
-- À exécuter après tous les scripts précédents
-- ============================================================================

-- SECTION 1: VALIDATION DES TABLES RH
-- ============================================================================

SELECT '=== VALIDATION DES TABLES RH ===' as section;

-- Vérifier l'existence et la structure des tables RH
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
    AND t.table_name IN ('branches', 'departments', 'positions', 'employees')
ORDER BY t.table_name;

-- Compter les enregistrements dans chaque table RH
SELECT 
    'branches' as table_name, 
    COUNT(*) as records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records
FROM branches
UNION ALL
SELECT 
    'departments' as table_name, 
    COUNT(*) as records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records
FROM departments
UNION ALL
SELECT 
    'positions' as table_name, 
    COUNT(*) as records,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_records
FROM positions
UNION ALL
SELECT 
    'employees' as table_name, 
    COUNT(*) as records,
    COUNT(CASE WHEN employment_status = 'active' THEN 1 END) as active_records
FROM employees;

-- SECTION 2: VALIDATION DES CONTRAINTES ET RELATIONS
-- ============================================================================

SELECT '=== VALIDATION DES CONTRAINTES ===' as section;

-- Vérifier les contraintes de clés étrangères
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tc.table_name, tc.constraint_name;

-- Vérifier la contrainte sur users.role
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK';

-- SECTION 3: VALIDATION DES UTILISATEURS RH
-- ============================================================================

SELECT '=== VALIDATION DES UTILISATEURS RH ===' as section;

-- Compter les utilisateurs par rôle
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM users
GROUP BY role
ORDER BY role;

-- Détails des utilisateurs RH
SELECT 
    u.id,
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

-- SECTION 4: VALIDATION DES POLITIQUES RLS
-- ============================================================================

SELECT '=== VALIDATION DES POLITIQUES RLS ===' as section;

-- Vérifier les politiques RLS sur les tables RH
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tablename, policyname;

-- Vérifier l'activation RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tablename;

-- SECTION 5: VALIDATION DES INDEX
-- ============================================================================

SELECT '=== VALIDATION DES INDEX ===' as section;

-- Vérifier les index sur les tables RH
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tablename, indexname;

-- SECTION 6: TEST D'INTÉGRITÉ DES DONNÉES
-- ============================================================================

SELECT '=== TEST D''INTÉGRITÉ DES DONNÉES ===' as section;

-- Test des relations hiérarchiques
SELECT 
    'Départements orphelins' as test_name,
    COUNT(*) as issues_count
FROM departments d
LEFT JOIN branches b ON d.branch_id = b.id
WHERE b.id IS NULL

UNION ALL

SELECT 
    'Positions orphelines' as test_name,
    COUNT(*) as issues_count
FROM positions p
LEFT JOIN departments d ON p.department_id = d.id
WHERE d.id IS NULL

UNION ALL

SELECT 
    'Employés orphelins' as test_name,
    COUNT(*) as issues_count
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
WHERE p.id IS NULL;

-- SECTION 7: RÉSUMÉ FINAL
-- ============================================================================

SELECT '=== RÉSUMÉ FINAL DU DÉPLOIEMENT ===' as section;

-- Statistiques globales
SELECT 
    COUNT(DISTINCT c.id) as companies_count,
    COUNT(DISTINCT b.id) as branches_count,
    COUNT(DISTINCT d.id) as departments_count,
    COUNT(DISTINCT p.id) as positions_count,
    COUNT(DISTINCT e.id) as employees_count,
    COUNT(DISTINCT u.id) as hr_users_count
FROM companies c
LEFT JOIN branches b ON (
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'company_id')
        THEN c.id = b.company_id
        ELSE true
    END
)
LEFT JOIN departments d ON b.id = d.branch_id
LEFT JOIN positions p ON d.id = p.department_id
LEFT JOIN employees e ON p.id = e.position_id
LEFT JOIN users u ON u.role LIKE 'hr_%';

-- Dernière validation : structure hiérarchique complète
SELECT 
    c.name as company,
    b.name as branch,
    d.name as department,
    p.title as position,
    COUNT(e.id) as employees_count
FROM companies c
LEFT JOIN branches b ON (
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'company_id')
        THEN c.id = b.company_id AND b.status = 'active'
        ELSE true
    END
)
LEFT JOIN departments d ON b.id = d.branch_id AND d.status = 'active'
LEFT JOIN positions p ON d.id = p.department_id AND p.status = 'active'
LEFT JOIN employees e ON p.id = e.position_id AND e.employment_status = 'active'
GROUP BY c.id, c.name, b.id, b.name, d.id, d.name, p.id, p.title
ORDER BY c.name, b.name, d.name, p.title;

-- ============================================================================
-- INDICATEURS DE SUCCÈS DU DÉPLOIEMENT:
-- ✅ Toutes les tables RH existent avec les bonnes colonnes
-- ✅ Les contraintes FK et CHECK sont en place
-- ✅ Les politiques RLS sont activées
-- ✅ Les index de performance sont créés
-- ✅ Les utilisateurs RH peuvent être créés
-- ✅ Les données de test sont cohérentes
-- ✅ La hiérarchie organisationnelle fonctionne
-- ============================================================================
