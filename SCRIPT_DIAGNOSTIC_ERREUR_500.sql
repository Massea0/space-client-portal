-- ===============================================================
-- SCRIPT DE DIAGNOSTIC POUR MODULE RH - ERREUR 500
-- ===============================================================
-- Ce script teste chaque table individuellement pour identifier 
-- où se trouve le problème qui cause l'erreur 500
-- ===============================================================

-- Test 1: Vérifier l'accès à la table employees
SELECT COUNT(*) as total_employees FROM employees;

-- Test 2: Vérifier l'accès à la table branches  
SELECT COUNT(*) as total_branches FROM branches;

-- Test 3: Vérifier l'accès à la table departments
SELECT COUNT(*) as total_departments FROM departments;

-- Test 4: Vérifier l'accès à la table positions
SELECT COUNT(*) as total_positions FROM positions;

-- Test 5: Test simple des employés sans jointures
SELECT 
    id, 
    employee_number, 
    first_name, 
    last_name, 
    work_email,
    employment_status
FROM employees 
WHERE employee_number LIKE 'EMP%'
LIMIT 5;

-- Test 6: Test des jointures une par une
-- Test employees + branches
SELECT 
    e.id,
    e.first_name,
    e.last_name,
    b.name as branch_name
FROM employees e
LEFT JOIN branches b ON e.branch_id = b.id
WHERE e.employee_number LIKE 'EMP%'
LIMIT 3;

-- Test 7: Test employees + departments
SELECT 
    e.id,
    e.first_name,
    e.last_name,
    d.name as department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.employee_number LIKE 'EMP%'
LIMIT 3;

-- Test 8: Test employees + positions
SELECT 
    e.id,
    e.first_name,
    e.last_name,
    p.title as position_title
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
WHERE e.employee_number LIKE 'EMP%'
LIMIT 3;

-- Test 9: Vérifier les permissions RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('employees', 'branches', 'departments', 'positions');

-- Test 10: Vérifier les colonnes manquantes ou problématiques
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'employees'
AND column_name IN ('reports_count', 'sick_days_used', 'certifications', 'skills')
ORDER BY column_name;

-- ===============================================================
-- RÉSULTATS ATTENDUS POUR DIAGNOSTIC :
-- ===============================================================
-- Si un test échoue, cela indique où se trouve le problème :
-- - Tests 1-4 : Problème d'accès aux tables (permissions/RLS)
-- - Test 5 : Problème avec la table employees elle-même
-- - Tests 6-8 : Problème avec les jointures spécifiques
-- - Test 9 : Problème de Row Level Security
-- - Test 10 : Colonnes manquantes ou types incompatibles
-- ===============================================================
