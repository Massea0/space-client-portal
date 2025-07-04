-- ===============================================================
-- SCRIPT DE VÉRIFICATION POST-CORRECTION RLS
-- ===============================================================
-- À exécuter APRÈS la correction RLS pour valider le résultat
-- ===============================================================

-- 🔍 TEST 1: Vérifier l'état RLS des tables
-- ===============================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    pg_class.relrowsecurity as rls_enforced
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE tablename IN ('employees', 'branches', 'departments', 'positions')
AND schemaname = 'public'
ORDER BY tablename;

-- 🔍 TEST 2: Lister les politiques actives
-- ===============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression
FROM pg_policies 
WHERE tablename IN ('employees', 'branches', 'departments', 'positions')
ORDER BY tablename, policyname;

-- 🔍 TEST 3: Test d'accès aux données (CRITIQUE)
-- ===============================================================
-- Ce test doit fonctionner SANS erreur de récursion
SELECT 'TEST EMPLOYEES' as table_test, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN employee_number LIKE 'EMP%' THEN 1 END) as test_records
FROM employees;

SELECT 'TEST BRANCHES' as table_test, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN code LIKE 'BR%' THEN 1 END) as test_records  
FROM branches;

SELECT 'TEST DEPARTMENTS' as table_test, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN code LIKE 'DEPT%' THEN 1 END) as test_records
FROM departments;

SELECT 'TEST POSITIONS' as table_test, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN code LIKE 'POS%' THEN 1 END) as test_records
FROM positions;

-- 🔍 TEST 4: Test de lecture spécifique (employé)
-- ===============================================================
SELECT 
    employee_number,
    first_name,
    last_name,
    email,
    status,
    created_at
FROM employees 
WHERE employee_number = 'EMP001';

-- 🔍 TEST 5: Test d'insertion (si vous avez les droits)
-- ===============================================================
-- Attention: ce test peut échouer si vous n'êtes pas admin/HR
-- C'est normal et attendu selon la configuration RLS
/*
INSERT INTO employees (
    employee_number, first_name, last_name, email, 
    status, company_id, branch_id, department_id, position_id
) VALUES (
    'TEST_RLS_001', 'Test', 'RLS', 'test.rls@example.com',
    'active', 1, 1, 1, 1
);
*/

-- ===============================================================
-- 🎯 RÉSULTATS ATTENDUS
-- ===============================================================
-- ✅ TEST 1: RLS activé sur toutes les tables
-- ✅ TEST 2: Politiques simples visibles (pas de récursion)
-- ✅ TEST 3: Données lisibles sans erreur
-- ✅ TEST 4: Employé spécifique accessible
-- ⚠️  TEST 5: Peut échouer si pas admin (normal)
--
-- ❌ SI ERREUR PERSISTE:
-- Exécuter DESACTIVER_RLS_URGENCE.sql immédiatement
-- ===============================================================
