-- =============================================================================
-- SCRIPT UNIQUE MINIMAL POUR MODULE RH - VERSION ULTRA-SIMPLIFIÉE
-- =============================================================================
-- Ce script crée uniquement les données essentielles pour tester le module RH
-- Il évite toutes les colonnes optionnelles qui pourraient causer des conflits
-- =============================================================================

-- Nettoyage préventif
DELETE FROM employees WHERE employee_number LIKE 'EMP%';
DELETE FROM positions WHERE code LIKE 'POS_%';
DELETE FROM departments WHERE code LIKE 'DEPT_%';
DELETE FROM branches WHERE code LIKE 'BR_%';

-- ============================================================================
-- 1. CRÉATION DES BRANCHES (minimum viable)
-- ============================================================================
INSERT INTO branches (name, code, city, country, status) VALUES
('Siège Social', 'BR_HQ', 'Dakar', 'Sénégal', 'active'),
('Filiale Casablanca', 'BR_CASA', 'Casablanca', 'Maroc', 'active'),
('Bureau Abidjan', 'BR_ABJ', 'Abidjan', 'Côte d''Ivoire', 'active');

-- ============================================================================
-- 2. CRÉATION DES DÉPARTEMENTS (minimum viable)
-- ============================================================================
INSERT INTO departments (name, code, branch_id, annual_budget, status) VALUES
('Développement', 'DEPT_DEV', 
 (SELECT id FROM branches WHERE code = 'BR_HQ'), 
 500000.00, 'active'),
('Ressources Humaines', 'DEPT_RH', 
 (SELECT id FROM branches WHERE code = 'BR_HQ'), 
 200000.00, 'active'),
('Commercial', 'DEPT_COM', 
 (SELECT id FROM branches WHERE code = 'BR_CASA'), 
 300000.00, 'active');

-- ============================================================================
-- 3. CRÉATION DES POSITIONS (minimum viable)
-- ============================================================================
INSERT INTO positions (title, code, branch_id, department_id, level) VALUES
('Développeur Senior', 'POS_DEV_SR', 
 (SELECT id FROM branches WHERE code = 'BR_HQ'),
 (SELECT id FROM departments WHERE code = 'DEPT_DEV'),
 3),
('Responsable RH', 'POS_RH_MGR', 
 (SELECT id FROM branches WHERE code = 'BR_HQ'),
 (SELECT id FROM departments WHERE code = 'DEPT_RH'),
 4),
('Commercial Junior', 'POS_COM_JR', 
 (SELECT id FROM branches WHERE code = 'BR_CASA'),
 (SELECT id FROM departments WHERE code = 'DEPT_COM'),
 1);

-- ============================================================================
-- 4. CRÉATION DES EMPLOYÉS (colonnes essentielles uniquement)
-- ============================================================================
INSERT INTO employees (
    employee_number, 
    first_name, 
    last_name, 
    work_email,
    branch_id, 
    department_id, 
    position_id,
    hire_date, 
    start_date, 
    employment_status, 
    employment_type
) VALUES 

-- Employé 1
('EMP001', 'Jean', 'Dupont', 'jean.dupont@company.com',
 (SELECT id FROM branches WHERE code = 'BR_HQ'),
 (SELECT id FROM departments WHERE code = 'DEPT_DEV'),
 (SELECT id FROM positions WHERE code = 'POS_DEV_SR'),
 '2023-01-15', '2023-01-15', 'active', 'full_time'),

-- Employé 2  
('EMP002', 'Marie', 'Diallo', 'marie.diallo@company.com',
 (SELECT id FROM branches WHERE code = 'BR_HQ'),
 (SELECT id FROM departments WHERE code = 'DEPT_RH'),
 (SELECT id FROM positions WHERE code = 'POS_RH_MGR'),
 '2022-06-01', '2022-06-01', 'active', 'full_time'),

-- Employé 3
('EMP003', 'Ahmed', 'Ben Ali', 'ahmed.benali@company.com',
 (SELECT id FROM branches WHERE code = 'BR_CASA'),
 (SELECT id FROM departments WHERE code = 'DEPT_COM'),
 (SELECT id FROM positions WHERE code = 'POS_COM_JR'),
 '2024-01-01', '2024-01-01', 'active', 'full_time');

-- ============================================================================
-- 5. VÉRIFICATION DES DONNÉES CRÉÉES
-- ============================================================================
SELECT 'BRANCHES' as table_name, count(*) as count FROM branches WHERE code LIKE 'BR_%'
UNION ALL
SELECT 'DEPARTMENTS', count(*) FROM departments WHERE code LIKE 'DEPT_%'
UNION ALL  
SELECT 'POSITIONS', count(*) FROM positions WHERE code LIKE 'POS_%'
UNION ALL
SELECT 'EMPLOYEES', count(*) FROM employees WHERE employee_number LIKE 'EMP%';

-- ============================================================================
-- TERMINÉ - DONNÉES DE TEST MINIMALES CRÉÉES
-- ============================================================================
-- Ce script crée :
-- ✅ 3 branches de test
-- ✅ 3 départements de test  
-- ✅ 3 positions de test
-- ✅ 3 employés de test
-- 
-- Toutes les données utilisent des codes préfixés pour faciliter 
-- l'identification et la suppression si nécessaire.
-- ============================================================================
