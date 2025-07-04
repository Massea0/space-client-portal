-- ===============================================================
-- TEST SIMPLE POUR VÉRIFIER LES DONNÉES RH
-- ===============================================================
-- Script de test minimal pour voir si les données existent
-- ===============================================================

-- Test 1: Compter les employés
SELECT 'EMPLOYÉS' as table_name, COUNT(*) as total 
FROM employees 
WHERE employee_number LIKE 'EMP%';

-- Test 2: Lister les employés basiques
SELECT 
    employee_number,
    first_name,
    last_name,
    work_email,
    employment_status
FROM employees 
WHERE employee_number LIKE 'EMP%'
ORDER BY employee_number;

-- Test 3: Vérifier les branches
SELECT 'BRANCHES' as table_name, COUNT(*) as total FROM branches;

-- Test 4: Vérifier les départements  
SELECT 'DÉPARTEMENTS' as table_name, COUNT(*) as total FROM departments;

-- Test 5: Vérifier les positions
SELECT 'POSITIONS' as table_name, COUNT(*) as total FROM positions;

-- ===============================================================
-- Si ces requêtes fonctionnent, les données de base sont OK
-- Le problème vient des jointures ou des colonnes dans l'API
-- ===============================================================
