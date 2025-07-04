-- ============================================================================
-- SCRIPT DE TEST AUTOMATISÉ - MODULE RH MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer des données de test pour valider toutes les fonctionnalités RH
-- À exécuter dans Supabase SQL Editor après le déploiement RH
-- ============================================================================

-- ÉTAPE 1: DIAGNOSTIC AVANT TEST
-- ============================================================================

SELECT '🔍 DIAGNOSTIC INITIAL' as section;

-- Vérifier l'état actuel
SELECT 
    'État actuel' as test_type,
    (SELECT COUNT(*) FROM companies) as companies,
    (SELECT COUNT(*) FROM branches) as branches,
    (SELECT COUNT(*) FROM departments) as departments,
    (SELECT COUNT(*) FROM positions) as positions,
    (SELECT COUNT(*) FROM employees) as employees,
    (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') as hr_users;

-- ÉTAPE 2: NETTOYAGE DES DONNÉES DE TEST EXISTANTES
-- ============================================================================

-- Supprimer les employés de test existants
DELETE FROM employees WHERE employee_number LIKE 'TEST%' OR employee_number LIKE 'DEMO%';

SELECT '🧹 Données de test nettoyées' as status;

-- ÉTAPE 3: CRÉATION DE DONNÉES DE TEST RÉALISTES
-- ============================================================================

-- Créer 10 employés de test avec données réalistes
INSERT INTO employees (
    employee_number, badge_number, first_name, last_name, 
    work_email, personal_email, personal_phone, work_phone,
    hire_date, start_date, 
    branch_id, department_id, position_id,
    employment_status, employment_type,
    current_salary, salary_currency,
    gender, nationality, date_of_birth,
    emergency_contact, address, skills
) VALUES 

-- EMPLOYÉ 1: Responsable RH Senior
('DEMO001', 'RH001', 'Aminata', 'Diallo', 
 'aminata.diallo@myspace.com', 'aminata.diallo@gmail.com', '+221 77 555 0001', '+221 33 123 4567',
 '2023-01-15', '2023-01-15',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'RH' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'RH001' LIMIT 1),
 'active', 'full_time',
 3500000, 'XOF',
 'F', 'SN', '1985-03-20',
 '{"name": "Mamadou Diallo", "phone": "+221 77 888 0001", "relationship": "époux"}',
 '{"street": "Rue 10, Almadies", "city": "Dakar", "postal_code": "12500", "country": "SN"}',
 '["Gestion RH", "Recrutement", "Formation", "Droit du travail"]'),

-- EMPLOYÉ 2: Développeur Full-Stack Senior
('DEMO002', 'IT001', 'Ousmane', 'Kane', 
 'ousmane.kane@myspace.com', 'ousmane.dev@gmail.com', '+221 77 555 0002', '+221 33 123 4568',
 '2022-06-01', '2022-06-01',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'active', 'full_time',
 2800000, 'XOF',
 'M', 'SN', '1990-11-15',
 '{"name": "Fatou Kane", "phone": "+221 77 888 0002", "relationship": "épouse"}',
 '{"street": "Cité Keur Gorgui", "city": "Dakar", "postal_code": "11000", "country": "SN"}',
 '["React", "TypeScript", "Node.js", "PostgreSQL", "Supabase"]'),

-- EMPLOYÉ 3: Assistante Direction
('DEMO003', 'DG001', 'Fatima', 'Sow', 
 'fatima.sow@myspace.com', 'fatima.sow@yahoo.fr', '+221 77 555 0003', '+221 33 123 4569',
 '2024-02-10', '2024-02-10',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'DG' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'DG001' LIMIT 1),
 'active', 'full_time',
 1800000, 'XOF',
 'F', 'SN', '1988-07-12',
 '{"name": "Ibrahima Sow", "phone": "+221 77 888 0003", "relationship": "frère"}',
 '{"street": "Médina, Rue 25", "city": "Dakar", "postal_code": "11200", "country": "SN"}',
 '["Secrétariat", "Organisation", "Communication", "Office 365"]'),

-- EMPLOYÉ 4: Développeur Junior
('DEMO004', 'IT002', 'Mamadou', 'Fall', 
 'mamadou.fall@myspace.com', 'mamadou.coder@gmail.com', '+221 77 555 0004', '+221 33 123 4570',
 '2024-09-01', '2024-09-01',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'active', 'full_time',
 1500000, 'XOF',
 'M', 'SN', '1995-04-22',
 '{"name": "Awa Fall", "phone": "+221 77 888 0004", "relationship": "mère"}',
 '{"street": "Parcelles Assainies U10", "city": "Dakar", "postal_code": "12000", "country": "SN"}',
 '["JavaScript", "Python", "HTML/CSS", "Git"]'),

-- EMPLOYÉ 5: Chargée de Recrutement
('DEMO005', 'RH002', 'Aissatou', 'Ndiaye', 
 'aissatou.ndiaye@myspace.com', 'aissatou.rh@outlook.com', '+221 77 555 0005', '+221 33 123 4571',
 '2023-11-20', '2023-11-20',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'RH' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'RH001' LIMIT 1),
 'active', 'full_time',
 2200000, 'XOF',
 'F', 'SN', '1987-09-05',
 '{"name": "Modou Ndiaye", "phone": "+221 77 888 0005", "relationship": "époux"}',
 '{"street": "Sicap Liberté 6", "city": "Dakar", "postal_code": "10700", "country": "SN"}',
 '["Recrutement", "Entretiens", "LinkedIn", "Assessment"]'),

-- EMPLOYÉ 6: DevOps Engineer
('DEMO006', 'IT003', 'Cheikh', 'Mbaye', 
 'cheikh.mbaye@myspace.com', 'cheikh.devops@gmail.com', '+221 77 555 0006', '+221 33 123 4572',
 '2023-03-15', '2023-03-15',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'active', 'full_time',
 3200000, 'XOF',
 'M', 'SN', '1986-12-08',
 '{"name": "Marieme Mbaye", "phone": "+221 77 888 0006", "relationship": "épouse"}',
 '{"street": "Point E, Rue 1", "city": "Dakar", "postal_code": "11500", "country": "SN"}',
 '["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"]'),

-- EMPLOYÉ 7: Stagiaire IT
('DEMO007', 'ST001', 'Mame', 'Ba', 
 'mame.ba@myspace.com', 'mame.student@esp.sn', '+221 77 555 0007', '+221 33 123 4573',
 '2025-06-01', '2025-06-01',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'active', 'intern',
 500000, 'XOF',
 'F', 'SN', '2000-02-18',
 '{"name": "Penda Ba", "phone": "+221 77 888 0007", "relationship": "mère"}',
 '{"street": "Université Cheikh Anta Diop", "city": "Dakar", "postal_code": "10000", "country": "SN"}',
 '["React", "Next.js", "Figma", "UI/UX"]'),

-- EMPLOYÉ 8: Responsable Formation
('DEMO008', 'RH003', 'Abdou', 'Sarr', 
 'abdou.sarr@myspace.com', 'abdou.formation@gmail.com', '+221 77 555 0008', '+221 33 123 4574',
 '2022-10-01', '2022-10-01',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'RH' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'RH001' LIMIT 1),
 'active', 'full_time',
 2600000, 'XOF',
 'M', 'SN', '1983-06-30',
 '{"name": "Rama Sarr", "phone": "+221 77 888 0008", "relationship": "épouse"}',
 '{"street": "Grand Yoff", "city": "Dakar", "postal_code": "12700", "country": "SN"}',
 '["Formation", "E-learning", "Pédagogie", "Évaluation"]'),

-- EMPLOYÉ 9: Développeuse Frontend (Télétravail)
('DEMO009', 'IT004', 'Khady', 'Diouf', 
 'khady.diouf@myspace.com', 'khady.frontend@gmail.com', '+221 77 555 0009', NULL,
 '2024-01-08', '2024-01-08',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'active', 'full_time',
 2400000, 'XOF',
 'F', 'SN', '1992-10-25',
 '{"name": "Omar Diouf", "phone": "+221 77 888 0009", "relationship": "époux"}',
 '{"street": "Thiès, Quartier Randoulène", "city": "Thiès", "postal_code": "21000", "country": "SN"}',
 '["Vue.js", "Angular", "Tailwind CSS", "Figma", "UX Design"]'),

-- EMPLOYÉ 10: Ancien employé (Test statut inactif)
('DEMO010', 'EX001', 'Alioune', 'Gueye', 
 'alioune.gueye@myspace.com', 'alioune.ex@gmail.com', '+221 77 555 0010', NULL,
 '2022-01-01', '2022-01-01',
 (SELECT id FROM branches LIMIT 1),
 (SELECT id FROM departments WHERE code = 'IT' LIMIT 1),
 (SELECT id FROM positions WHERE code = 'IT001' LIMIT 1),
 'terminated', 'full_time',
 2000000, 'XOF',
 'M', 'SN', '1985-08-14',
 '{"name": "Binta Gueye", "phone": "+221 77 888 0010", "relationship": "épouse"}',
 '{"street": "Rufisque Centre", "city": "Rufisque", "postal_code": "19000", "country": "SN"}',
 '["PHP", "MySQL", "WordPress", "Laravel"]');

-- ÉTAPE 4: MISE À JOUR DES DATES DE FIN DE PROBATION
-- ============================================================================

UPDATE employees 
SET probation_end_date = start_date + INTERVAL '3 months'
WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active';

-- ÉTAPE 5: VALIDATION DES DONNÉES CRÉÉES
-- ============================================================================

SELECT '✅ DONNÉES DE TEST CRÉÉES' as section;

-- Compter les employés créés
SELECT 
    'Employés de test créés' as metric,
    COUNT(*) as count
FROM employees 
WHERE employee_number LIKE 'DEMO%';

-- Répartition par département
SELECT 
    'Répartition par département' as section,
    d.name as department,
    COUNT(e.id) as employee_count,
    ROUND(AVG(e.current_salary), 0) as avg_salary
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id 
    AND e.employee_number LIKE 'DEMO%'
    AND e.employment_status = 'active'
GROUP BY d.id, d.name
ORDER BY employee_count DESC;

-- Répartition par statut
SELECT 
    'Répartition par statut' as section,
    employment_status,
    employment_type,
    COUNT(*) as count
FROM employees 
WHERE employee_number LIKE 'DEMO%'
GROUP BY employment_status, employment_type
ORDER BY count DESC;

-- ÉTAPE 6: TESTS DE PERFORMANCE ET INTÉGRITÉ
-- ============================================================================

SELECT '🚀 TESTS DE PERFORMANCE' as section;

-- Test des jointures complexes
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    e.employee_number,
    e.first_name || ' ' || e.last_name as full_name,
    e.work_email,
    d.name as department,
    p.title as position,
    b.name as branch,
    e.current_salary,
    e.hire_date,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) as years_of_service
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN positions p ON e.position_id = p.id
JOIN branches b ON e.branch_id = b.id
WHERE e.employment_status = 'active'
    AND e.employee_number LIKE 'DEMO%'
ORDER BY e.hire_date;

-- Test d'intégrité des données
SELECT 
    'Tests d\'intégrité' as section,
    'Employés sans département' as test_name,
    COUNT(*) as issues_count
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.employee_number LIKE 'DEMO%' AND d.id IS NULL

UNION ALL

SELECT 
    'Tests d\'intégrité' as section,
    'Employés sans position' as test_name,
    COUNT(*) as issues_count
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
WHERE e.employee_number LIKE 'DEMO%' AND p.id IS NULL

UNION ALL

SELECT 
    'Tests d\'intégrité' as section,
    'Employés sans branche' as test_name,
    COUNT(*) as issues_count
FROM employees e
LEFT JOIN branches b ON e.branch_id = b.id
WHERE e.employee_number LIKE 'DEMO%' AND b.id IS NULL;

-- ÉTAPE 7: GÉNÉRATION DE RAPPORTS DE TEST
-- ============================================================================

SELECT '📊 RAPPORTS DE TEST' as section;

-- Rapport démographique
SELECT 
    'Démographie' as category,
    gender,
    COUNT(*) as count,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))), 1) as avg_age,
    ROUND(AVG(current_salary), 0) as avg_salary
FROM employees 
WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active'
GROUP BY gender;

-- Rapport ancienneté
SELECT 
    'Ancienneté' as category,
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 1 THEN 'Moins d\'1 an'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 2 THEN '1-2 ans'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 5 THEN '2-5 ans'
        ELSE 'Plus de 5 ans'
    END as seniority_range,
    COUNT(*) as employee_count
FROM employees 
WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active'
GROUP BY seniority_range
ORDER BY MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)));

-- Rapport salarial
SELECT 
    'Salaires' as category,
    CASE 
        WHEN current_salary < 1000000 THEN 'Moins de 1M XOF'
        WHEN current_salary < 2000000 THEN '1-2M XOF'
        WHEN current_salary < 3000000 THEN '2-3M XOF'
        ELSE 'Plus de 3M XOF'
    END as salary_range,
    COUNT(*) as employee_count,
    ROUND(AVG(current_salary), 0) as avg_salary_in_range
FROM employees 
WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active'
GROUP BY salary_range
ORDER BY MIN(current_salary);

-- ÉTAPE 8: RÉSUMÉ FINAL DU TEST
-- ============================================================================

SELECT 
    '🎉 RÉSUMÉ FINAL' as section,
    'Module RH avec données de test' as description,
    (SELECT COUNT(*) FROM employees WHERE employee_number LIKE 'DEMO%') as total_employees_test,
    (SELECT COUNT(*) FROM employees WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active') as active_employees,
    (SELECT COUNT(DISTINCT department_id) FROM employees WHERE employee_number LIKE 'DEMO%') as departments_used,
    (SELECT COUNT(DISTINCT position_id) FROM employees WHERE employee_number LIKE 'DEMO%') as positions_used,
    (SELECT ROUND(AVG(current_salary), 0) FROM employees WHERE employee_number LIKE 'DEMO%' AND employment_status = 'active') as avg_salary;

-- ============================================================================
-- 🎯 INSTRUCTIONS POUR TEST FRONTEND
-- ============================================================================

SELECT '
🖥️ PROCHAINES ÉTAPES POUR TESTER LE FRONTEND:

1. 📊 DONNÉES DISPONIBLES:
   • 10 employés de test créés (DEMO001 à DEMO010)
   • Répartition: 5 IT, 3 RH, 1 DG, 1 ancien employé
   • Données réalistes: salaires, contacts, compétences
   • 1 stagiaire, 1 télétravail, 1 employé désactivé

2. 🔐 COMPTES DE TEST:
   • hr.admin@myspace.com (Administrateur RH)
   • hr.manager@myspace.com (Manager RH)

3. 🧪 TESTS À EFFECTUER:
   • Se connecter avec les comptes RH
   • Vérifier que les 10 employés apparaissent
   • Tester CRUD complet sur les employés
   • Valider les filtres et recherches
   • Exporter les données
   • Tester responsive design

4. 📱 URLS À TESTER:
   • /hr/dashboard (tableau de bord)
   • /hr/employees (liste employés)
   • /hr/departments (départements)
   • /hr/positions (postes)
   • /hr/reports (rapports)

5. ✅ CRITÈRES DE VALIDATION:
   • Interface affiche vraies données Supabase
   • CRUD fonctionne en temps réel
   • Filtres et recherche opérationnels
   • Permissions par rôle respectées
   • Performance satisfaisante

🎯 LE MODULE RH EST PRÊT POUR TESTS COMPLETS!
' as instructions_frontend;

-- ============================================================================
-- 🎉 SCRIPT DE TEST TERMINÉ
-- ============================================================================
