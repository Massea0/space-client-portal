-- ===============================================================
-- ANALYSE COMPLÈTE DE LA BASE DE DONNÉES RH
-- ===============================================================
-- Script pour analyser l'état complet de la base de données
-- À exécuter dans Supabase SQL Editor pour générer le rapport technique
-- ===============================================================

-- 🏗️ SECTION 1: STRUCTURE DES TABLES
-- ===============================================================
SELECT 
    'STRUCTURE TABLES' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('employees', 'branches', 'departments', 'positions')
ORDER BY table_name, ordinal_position;

-- 🔗 SECTION 2: CONTRAINTES ET RELATIONS
-- ===============================================================
SELECT 
    'CONTRAINTES' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('employees', 'branches', 'departments', 'positions')
ORDER BY tc.table_name, tc.constraint_type;

-- 📊 SECTION 3: STATISTIQUES DES DONNÉES
-- ===============================================================
SELECT 'STATS BRANCHES' as section, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active_branches,
       COUNT(CASE WHEN is_headquarters = true THEN 1 END) as headquarters_count
FROM branches;

SELECT 'STATS DEPARTMENTS' as section,
       COUNT(*) as total_records,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active_departments,
       COUNT(DISTINCT branch_id) as branches_with_departments,
       ROUND(AVG(annual_budget), 2) as avg_budget
FROM departments;

SELECT 'STATS POSITIONS' as section,
       COUNT(*) as total_records,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active_positions,
       MIN(level) as min_level,
       MAX(level) as max_level,
       COUNT(CASE WHEN remote_work_allowed = true THEN 1 END) as remote_positions
FROM positions;

SELECT 'STATS EMPLOYEES' as section,
       COUNT(*) as total_records,
       COUNT(CASE WHEN employment_status = 'active' THEN 1 END) as active_employees,
       COUNT(CASE WHEN employment_type = 'full_time' THEN 1 END) as full_time_employees,
       COUNT(CASE WHEN manager_id IS NOT NULL THEN 1 END) as employees_with_manager,
       ROUND(AVG(current_salary), 2) as avg_salary,
       ROUND(AVG(performance_score), 2) as avg_performance
FROM employees;

-- 🔐 SECTION 4: ÉTAT DES POLITIQUES RLS
-- ===============================================================
SELECT 
    'POLITIQUES RLS' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    LENGTH(qual) as policy_complexity
FROM pg_policies 
WHERE tablename IN ('employees', 'branches', 'departments', 'positions')
ORDER BY tablename, policyname;

-- 🏢 SECTION 5: HIÉRARCHIE ORGANISATIONNELLE
-- ===============================================================
SELECT 
    'HIÉRARCHIE' as section,
    b.name as branche,
    d.name as departement,
    p.title as position,
    COUNT(e.id) as nombre_employes,
    STRING_AGG(CONCAT(e.first_name, ' ', e.last_name), ', ') as employes
FROM branches b
LEFT JOIN departments d ON b.id = d.branch_id
LEFT JOIN positions pos ON d.id = pos.department_id
LEFT JOIN employees e ON pos.id = e.position_id AND e.employment_status = 'active'
GROUP BY b.id, b.name, d.id, d.name, pos.id, pos.title
ORDER BY b.name, d.name, pos.title;

-- 📈 SECTION 6: ANALYSES MÉTIER
-- ===============================================================
-- Répartition par type d'emploi
SELECT 
    'RÉPARTITION EMPLOI' as section,
    employment_type,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees WHERE employment_status = 'active'), 2) as pourcentage
FROM employees 
WHERE employment_status = 'active'
GROUP BY employment_type;

-- Répartition salariale par niveau
SELECT 
    'SALAIRES PAR NIVEAU' as section,
    p.level,
    COUNT(e.id) as nombre_employes,
    MIN(e.current_salary) as salaire_min,
    ROUND(AVG(e.current_salary), 2) as salaire_moyen,
    MAX(e.current_salary) as salaire_max
FROM employees e
JOIN positions p ON e.position_id = p.id
WHERE e.employment_status = 'active' AND e.current_salary IS NOT NULL
GROUP BY p.level
ORDER BY p.level;

-- Relations manager-subordinés
SELECT 
    'RELATIONS MANAGEMENT' as section,
    CONCAT(manager.first_name, ' ', manager.last_name) as manager,
    manager.employee_number as manager_number,
    COUNT(subordinate.id) as nombre_subordonnes,
    STRING_AGG(CONCAT(subordinate.first_name, ' ', subordinate.last_name), ', ') as subordonnes
FROM employees manager
JOIN employees subordinate ON manager.id = subordinate.manager_id
WHERE manager.employment_status = 'active' AND subordinate.employment_status = 'active'
GROUP BY manager.id, manager.first_name, manager.last_name, manager.employee_number
ORDER BY COUNT(subordinate.id) DESC;

-- 🎯 SECTION 7: QUALITÉ DES DONNÉES
-- ===============================================================
SELECT 
    'QUALITÉ DONNÉES EMPLOYEES' as section,
    COUNT(*) as total_records,
    COUNT(CASE WHEN first_name IS NULL OR first_name = '' THEN 1 END) as missing_first_name,
    COUNT(CASE WHEN last_name IS NULL OR last_name = '' THEN 1 END) as missing_last_name,
    COUNT(CASE WHEN work_email IS NULL OR work_email = '' THEN 1 END) as missing_work_email,
    COUNT(CASE WHEN personal_phone IS NULL OR personal_phone = '' THEN 1 END) as missing_personal_phone,
    COUNT(CASE WHEN emergency_contact IS NULL THEN 1 END) as missing_emergency_contact,
    COUNT(CASE WHEN address IS NULL THEN 1 END) as missing_address,
    COUNT(CASE WHEN current_salary IS NULL THEN 1 END) as missing_salary,
    COUNT(CASE WHEN performance_score IS NULL THEN 1 END) as missing_performance_score
FROM employees;

-- 🔍 SECTION 8: EXEMPLES DE DONNÉES
-- ===============================================================
-- Échantillon d'employés avec relations complètes
SELECT 
    'ÉCHANTILLON EMPLOYÉS' as section,
    e.employee_number,
    CONCAT(e.first_name, ' ', e.last_name) as nom_complet,
    e.work_email,
    b.name as branche,
    d.name as departement,
    p.title as position,
    e.employment_status,
    e.employment_type,
    e.current_salary,
    e.performance_score,
    CASE 
        WHEN m.id IS NOT NULL 
        THEN CONCAT(m.first_name, ' ', m.last_name)
        ELSE 'Aucun manager' 
    END as manager
FROM employees e
LEFT JOIN branches b ON e.branch_id = b.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN employees m ON e.manager_id = m.id
WHERE e.employee_number LIKE 'EMP%'
ORDER BY e.employee_number;

-- ===============================================================
-- 📋 RÉSUMÉ FINAL
-- ===============================================================
SELECT 
    'RÉSUMÉ ARCHITECTURE' as section,
    (SELECT COUNT(*) FROM branches) as total_branches,
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(*) FROM positions) as total_positions,
    (SELECT COUNT(*) FROM employees) as total_employees,
    (SELECT COUNT(*) FROM employees WHERE employment_status = 'active') as active_employees,
    (SELECT COUNT(DISTINCT manager_id) FROM employees WHERE manager_id IS NOT NULL) as managers_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('employees', 'branches', 'departments', 'positions')) as total_rls_policies;

-- ===============================================================
-- 🎯 MÉTADONNÉES POUR LOVABLE DEV
-- ===============================================================
SELECT 
    'MÉTADONNÉES SUPABASE' as section,
    schemaname,
    tablename,
    attname as column_name,
    typname as data_type,
    attnotnull as not_null,
    atthasdef as has_default
FROM pg_attribute 
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE pg_namespace.nspname = 'public' 
AND pg_class.relname IN ('employees', 'branches', 'departments', 'positions')
AND pg_attribute.attnum > 0 
AND pg_attribute.attisdropped = false
ORDER BY pg_class.relname, pg_attribute.attnum;
