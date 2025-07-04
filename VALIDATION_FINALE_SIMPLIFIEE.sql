-- ============================================================================
-- VALIDATION FINALE SIMPLIFIÉE - MODULE RH
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Validation rapide et efficace du déploiement RH
-- ============================================================================

-- SECTION 1: TABLES RH EXISTANTES
-- ============================================================================

SELECT '=== VALIDATION DES TABLES RH ===' as validation_type;

-- Compter les tables RH créées
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
    AND t.table_name IN ('branches', 'departments', 'positions', 'employees')
ORDER BY t.table_name;

-- SECTION 2: DONNÉES DANS LES TABLES RH
-- ============================================================================

SELECT '=== DONNÉES CRÉÉES ===' as validation_type;

-- Compter les enregistrements
SELECT 'branches' as table_name, COUNT(*) as records FROM branches
UNION ALL
SELECT 'departments' as table_name, COUNT(*) as records FROM departments
UNION ALL
SELECT 'positions' as table_name, COUNT(*) as records FROM positions
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as records FROM employees;

-- SECTION 3: UTILISATEURS RH
-- ============================================================================

SELECT '=== UTILISATEURS RH ===' as validation_type;

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
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.is_active,
    c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.role LIKE 'hr_%'
ORDER BY u.created_at DESC;

-- SECTION 4: CONTRAINTE ROLE
-- ============================================================================

SELECT '=== CONTRAINTE ROLE ===' as validation_type;

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

-- SECTION 5: STRUCTURE HIÉRARCHIQUE
-- ============================================================================

SELECT '=== HIÉRARCHIE ORGANISATIONNELLE ===' as validation_type;

-- Vérifier la structure de base
SELECT 
    d.name as department,
    COUNT(p.id) as positions_count
FROM departments d
LEFT JOIN positions p ON d.id = p.department_id
GROUP BY d.id, d.name
ORDER BY d.name;

-- SECTION 6: RLS ET SÉCURITÉ
-- ============================================================================

SELECT '=== SÉCURITÉ RLS ===' as validation_type;

-- Vérifier l'activation RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tablename;

-- SECTION 7: RÉSUMÉ FINAL
-- ============================================================================

SELECT '=== RÉSUMÉ FINAL ===' as validation_type;

-- Statistiques globales simplifiées
SELECT 
    (SELECT COUNT(*) FROM companies) as companies_count,
    (SELECT COUNT(*) FROM branches) as branches_count,
    (SELECT COUNT(*) FROM departments) as departments_count,
    (SELECT COUNT(*) FROM positions) as positions_count,
    (SELECT COUNT(*) FROM employees) as employees_count,
    (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') as hr_users_count;

-- SECTION 8: TESTS D'INTÉGRITÉ SIMPLIFIÉS
-- ============================================================================

SELECT '=== TESTS INTÉGRITÉ ===' as validation_type;

-- Tests de base
SELECT 
    'Départements sans branche' as test_name,
    COUNT(*) as issues_count
FROM departments d
LEFT JOIN branches b ON d.branch_id = b.id
WHERE b.id IS NULL

UNION ALL

SELECT 
    'Positions sans département' as test_name,
    COUNT(*) as issues_count
FROM positions p
LEFT JOIN departments d ON p.department_id = d.id
WHERE d.id IS NULL

UNION ALL

SELECT 
    'Employés sans position' as test_name,
    COUNT(*) as issues_count
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- INDICATEURS DE SUCCÈS:
-- ✅ 4 tables RH créées (branches, departments, positions, employees)
-- ✅ Données de test présentes dans les tables
-- ✅ Utilisateurs RH créés et actifs
-- ✅ Contrainte role mise à jour
-- ✅ RLS activé sur toutes les tables
-- ✅ Intégrité référentielle respectée
-- ============================================================================

SELECT '=== VALIDATION TERMINÉE ===' as validation_type;
