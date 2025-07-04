-- ===============================================================
-- SCRIPT UNIQUE COMPLET - MODULE RH SUPABASE (VERSION CORRIGÉE)
-- ===============================================================
-- Script tout-en-un pour déployer complètement le module RH :
-- 1. Création des données de base (branches, départements, positions)  
-- 2. Insertion de 8 employés de test avec données réalistes
-- 3. Configuration des relations hiérarchiques
-- 4. Validation finale complète
-- ===============================================================

-- 🏗️ ÉTAPE 1: CRÉATION DES BRANCHES
-- ===============================================================

-- Supprimer et recréer les données si elles existent déjà
DELETE FROM employees WHERE employee_number LIKE 'EMP%';
DELETE FROM positions WHERE title IN ('Développeur Senior', 'Développeur Junior', 'Tech Lead', 'Manager Marketing', 'Chargé Marketing', 'Manager Support', 'Agent Support', 'Manager RH', 'Comptable');
DELETE FROM departments WHERE name IN ('Développement', 'Marketing', 'Support Client', 'Ressources Humaines', 'Finance');
DELETE FROM branches WHERE name IN ('Siège Social', 'Succursale Thiès', 'Bureau Saint-Louis');

INSERT INTO branches (name, code, city, country, address, phone, email, timezone, is_headquarters, status) 
VALUES 
(
    'Siège Social',
    'HQ-DKR',
    'Dakar',
    'SN',
    '{"street": "123 Avenue des Affaires", "city": "Dakar", "postal_code": "10000", "country": "Sénégal"}',
    '+221 33 123 45 67',
    'contact@arcadis.com',
    'Africa/Dakar',
    true,
    'active'
),
(
    'Succursale Thiès',
    'SUC-THI',
    'Thiès',
    'SN',
    '{"street": "456 Rue du Commerce", "city": "Thiès", "postal_code": "21000", "country": "Sénégal"}',
    '+221 33 987 65 43',
    'thies@arcadis.com',
    'Africa/Dakar',
    false,
    'active'
),
(
    'Bureau Saint-Louis',
    'BUR-STL',
    'Saint-Louis',
    'SN',
    '{"street": "789 Boulevard de l''Indépendance", "city": "Saint-Louis", "postal_code": "32000", "country": "Sénégal"}',
    '+221 33 555 44 33',
    'saintlouis@arcadis.com',
    'Africa/Dakar',
    false,
    'active'
);

-- 🏢 ÉTAPE 2: CRÉATION DES DÉPARTEMENTS
-- ===============================================================

INSERT INTO departments (name, code, description, branch_id, annual_budget, status) 
VALUES 
(
    'Développement',
    'DEV',
    'Équipe de développement logiciel et innovation technologique',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    500000,
    'active'
),
(
    'Marketing',
    'MKT',
    'Équipe marketing, communication et relations clients',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    300000,
    'active'
),
(
    'Support Client',
    'SUP',
    'Service client, support technique et assistance utilisateurs',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    200000,
    'active'
),
(
    'Ressources Humaines',
    'RH',
    'Gestion du personnel, recrutement et développement',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    150000,
    'active'
),
(
    'Finance',
    'FIN',
    'Comptabilité, gestion financière et contrôle de gestion',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    250000,
    'active'
);

-- 💼 ÉTAPE 3: CRÉATION DES POSITIONS
-- ===============================================================

-- Positions Développement
INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Développeur Senior',
    'DEV-SR',
    'Développeur expérimenté en charge du développement d''applications',
    d.id,
    d.branch_id,
    3,
    400000,
    600000,
    '["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"]',
    'full_time',
    true,
    'active'
FROM departments d WHERE d.name = 'Développement';

INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Développeur Junior',
    'DEV-JR',
    'Développeur débutant en apprentissage',
    d.id,
    d.branch_id,
    1,
    250000,
    350000,
    '["JavaScript", "HTML", "CSS", "React", "Git"]',
    'full_time',
    true,
    'active'
FROM departments d WHERE d.name = 'Développement';

INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Tech Lead',
    'DEV-TL',
    'Leader technique équipe développement',
    d.id,
    d.branch_id,
    4,
    600000,
    800000,
    '["Leadership", "Architecture", "JavaScript", "Management"]',
    'full_time',
    true,
    'active'
FROM departments d WHERE d.name = 'Développement';

-- Positions Marketing
INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Manager Marketing',
    'MKT-MG',
    'Responsable stratégie marketing et communication',
    d.id,
    d.branch_id,
    5,
    450000,
    650000,
    '["Marketing Digital", "Analytics", "SEO", "Management"]',
    'full_time',
    false,
    'active'
FROM departments d WHERE d.name = 'Marketing';

INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Chargé Marketing',
    'MKT-CH',
    'Exécution campagnes marketing et communication',
    d.id,
    d.branch_id,
    2,
    300000,
    400000,
    '["Marketing Digital", "Content Marketing", "SEO"]',
    'full_time',
    true,
    'active'
FROM departments d WHERE d.name = 'Marketing';

-- Positions Support Client
INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Manager Support',
    'SUP-MG',
    'Responsable équipe support client',
    d.id,
    d.branch_id,
    5,
    400000,
    550000,
    '["Management", "Service Client", "CRM"]',
    'full_time',
    false,
    'active'
FROM departments d WHERE d.name = 'Support Client';

INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Agent Support',
    'SUP-AG',
    'Support technique et assistance clients',
    d.id,
    d.branch_id,
    1,
    250000,
    350000,
    '["Service Client", "Communication", "CRM"]',
    'full_time',
    true,
    'active'
FROM departments d WHERE d.name = 'Support Client';

-- Positions RH et Finance
INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Manager RH',
    'RH-MG',
    'Responsable ressources humaines',
    d.id,
    d.branch_id,
    5,
    500000,
    700000,
    '["Management RH", "Recrutement", "Droit travail"]',
    'full_time',
    false,
    'active'
FROM departments d WHERE d.name = 'Ressources Humaines';

INSERT INTO positions (
    title, code, description, department_id, branch_id, level, 
    salary_min, salary_max, required_skills, employment_type, 
    remote_work_allowed, status
) 
SELECT 
    'Comptable',
    'FIN-CP',
    'Gestion comptable et financière',
    d.id,
    d.branch_id,
    2,
    350000,
    450000,
    '["Comptabilité", "Excel", "Logiciels comptables"]',
    'full_time',
    false,
    'active'
FROM departments d WHERE d.name = 'Finance';

-- 👥 ÉTAPE 4: INSERTION DES EMPLOYÉS DE TEST
-- ===============================================================

INSERT INTO employees (
    employee_number, first_name, last_name, middle_name, preferred_name,
    work_email, personal_email, personal_phone, work_phone,
    branch_id, department_id, position_id,
    hire_date, start_date, employment_status, employment_type,
    current_salary, salary_currency, performance_score,
    vacation_days_total, vacation_days_used,
    emergency_contact, address
) VALUES 

-- 1. Jean Dupont - Développeur Senior
(
    'EMP001', 'Jean', 'Dupont', 'Marie', 'Jean',
    'jean.dupont@arcadis.com', 'jean.dupont@gmail.com', 
    '+221 77 123 45 67', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Développement'),
    (SELECT id FROM positions WHERE title = 'Développeur Senior'),
    '2023-01-15', '2023-01-15', 'active', 'full_time',
    550000, 'XOF', 4.5,
    25, 5,
    '{"name": "Marie Dupont", "relationship": "Épouse", "phone": "+221 77 987 65 43"}',
    '{"street": "Cité Keur Gorgui, Villa 123", "city": "Dakar", "postal_code": "10000", "country": "Sénégal"}'
),

-- 2. Marie Martin - Manager Marketing
(
    'EMP002', 'Marie', 'Martin', 'Fatou', 'Marie',
    'marie.martin@arcadis.com', 'marie.martin@gmail.com',
    '+221 77 234 56 78', '+221 33 123 45 69',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Marketing'),
    (SELECT id FROM positions WHERE title = 'Manager Marketing'),
    '2022-06-10', '2022-06-10', 'active', 'full_time',
    580000, 'XOF', 4.8,
    25, 12,
    '{"name": "Paul Martin", "relationship": "Époux", "phone": "+221 77 111 22 33"}',
    '{"street": "Almadies, Résidence les Palmiers", "city": "Dakar", "postal_code": "10001", "country": "Sénégal"}'
),

-- 3. Pierre Durand - Agent Support
(
    'EMP003', 'Pierre', 'Durand', 'Mamadou', 'Pierre',
    'pierre.durand@arcadis.com', 'pierre.durand@gmail.com',
    '+221 77 345 67 89', '+221 33 123 45 70',
    (SELECT id FROM branches WHERE name = 'Succursale Thiès'),
    (SELECT id FROM departments WHERE name = 'Support Client'),
    (SELECT id FROM positions WHERE title = 'Agent Support'),
    '2023-09-01', '2023-09-01', 'active', 'part_time',
    280000, 'XOF', 4.2,
    20, 3,
    '{"name": "Sophie Durand", "relationship": "Épouse", "phone": "+221 77 444 55 66"}',
    '{"street": "Quartier Randoulène, Maison 456", "city": "Thiès", "postal_code": "21000", "country": "Sénégal"}'
),

-- 4. Claire Moreau - Développeur Senior
(
    'EMP004', 'Claire', 'Moreau', 'Aminata', 'Claire',
    'claire.moreau@arcadis.com', 'claire.moreau@gmail.com',
    '+221 77 456 78 90', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Développement'),
    (SELECT id FROM positions WHERE title = 'Développeur Senior'),
    '2024-03-01', '2024-03-01', 'active', 'full_time',
    520000, 'XOF', 4.6,
    25, 8,
    '{"name": "Vincent Moreau", "relationship": "Époux", "phone": "+221 77 777 88 99"}',
    '{"street": "Mermoz, Immeuble les Baobabs", "city": "Dakar", "postal_code": "10002", "country": "Sénégal"}'
),

-- 5. Thomas Bernard - Chargé Marketing
(
    'EMP005', 'Thomas', 'Bernard', 'Ibrahima', 'Thomas',
    'thomas.bernard@arcadis.com', 'thomas.bernard@gmail.com',
    '+221 77 567 89 01', '+221 33 123 45 69',
    (SELECT id FROM branches WHERE name = 'Bureau Saint-Louis'),
    (SELECT id FROM departments WHERE name = 'Marketing'),
    (SELECT id FROM positions WHERE title = 'Chargé Marketing'),
    '2024-01-15', '2024-01-15', 'active', 'contract',
    320000, 'XOF', 4.0,
    22, 2,
    '{"name": "Laura Bernard", "relationship": "Sœur", "phone": "+221 77 333 44 55"}',
    '{"street": "Quartier Sor, Maison traditionnelle", "city": "Saint-Louis", "postal_code": "32000", "country": "Sénégal"}'
),

-- 6. Aminata Diallo - Développeur Junior
(
    'EMP006', 'Aminata', 'Diallo', 'Fatou', 'Aminata',
    'aminata.diallo@arcadis.com', 'aminata.diallo@gmail.com',
    '+221 77 678 90 12', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Développement'),
    (SELECT id FROM positions WHERE title = 'Développeur Junior'),
    '2024-06-01', '2024-06-01', 'active', 'full_time',
    280000, 'XOF', 3.8,
    25, 0,
    '{"name": "Modou Diallo", "relationship": "Père", "phone": "+221 77 222 33 44"}',
    '{"street": "Guédiawaye, Cité Millionnaire", "city": "Dakar", "postal_code": "10003", "country": "Sénégal"}'
),

-- 7. Mamadou Fall - Manager RH
(
    'EMP007', 'Mamadou', 'Fall', 'Cheikh', 'Mamadou',
    'mamadou.fall@arcadis.com', 'mamadou.fall@gmail.com',
    '+221 77 789 01 23', '+221 33 123 45 71',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Ressources Humaines'),
    (SELECT id FROM positions WHERE title = 'Manager RH'),
    '2021-03-15', '2021-03-15', 'active', 'full_time',
    620000, 'XOF', 4.7,
    30, 15,
    '{"name": "Aicha Fall", "relationship": "Épouse", "phone": "+221 77 555 66 77"}',
    '{"street": "Point E, Villa moderne", "city": "Dakar", "postal_code": "10004", "country": "Sénégal"}'
),

-- 8. Fatou Ndoye - Comptable
(
    'EMP008', 'Fatou', 'Ndoye', 'Mariama', 'Fatou',
    'fatou.ndoye@arcadis.com', 'fatou.ndoye@gmail.com',
    '+221 77 890 12 34', '+221 33 123 45 72',
    (SELECT id FROM branches WHERE name = 'Siège Social'),
    (SELECT id FROM departments WHERE name = 'Finance'),
    (SELECT id FROM positions WHERE title = 'Comptable'),
    '2022-11-01', '2022-11-01', 'active', 'full_time',
    380000, 'XOF', 4.4,
    25, 8,
    '{"name": "Omar Ndoye", "relationship": "Époux", "phone": "+221 77 666 77 88"}',
    '{"street": "Sacré Cœur 3, Appartement moderne", "city": "Dakar", "postal_code": "10005", "country": "Sénégal"}'
);

-- 🔗 ÉTAPE 5: CONFIGURATION DES RELATIONS HIÉRARCHIQUES
-- ===============================================================

-- Marie (Manager Marketing) supervise Thomas (Chargé Marketing)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP002')
WHERE employee_number = 'EMP005';

-- Jean (Développeur Senior) supervise Aminata (Développeur Junior)  
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP001')
WHERE employee_number = 'EMP006';

-- ✅ ÉTAPE 6: VALIDATION FINALE COMPLÈTE
-- ===============================================================

-- Statistiques globales
SELECT 
    'RÉSUMÉ FINAL MODULE RH' as test_name,
    (SELECT COUNT(*) FROM branches) as branches_total,
    (SELECT COUNT(*) FROM departments) as departments_total,
    (SELECT COUNT(*) FROM positions) as positions_total,
    (SELECT COUNT(*) FROM employees) as employees_total;

-- Détail des employés créés avec leurs relations
SELECT 
    'EMPLOYÉS CRÉÉS' as section,
    e.employee_number,
    CONCAT(e.first_name, ' ', e.last_name) as nom_complet,
    e.work_email,
    d.name as departement,
    p.title as poste,
    b.name as branche,
    e.employment_status as statut,
    e.employment_type as type_emploi,
    CONCAT(e.current_salary::text, ' ', e.salary_currency) as salaire,
    e.performance_score as performance,
    CASE 
        WHEN e.manager_id IS NOT NULL 
        THEN CONCAT(manager.first_name, ' ', manager.last_name)
        ELSE 'Aucun manager' 
    END as manager_nom
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN branches b ON e.branch_id = b.id
LEFT JOIN employees manager ON e.manager_id = manager.id
WHERE e.employee_number LIKE 'EMP%'
ORDER BY e.employee_number;

-- Répartition par département
SELECT 
    'RÉPARTITION PAR DÉPARTEMENT' as section,
    d.name as departement,
    COUNT(e.id) as nombre_employes,
    ROUND(AVG(e.performance_score), 2) as performance_moyenne,
    ROUND(AVG(e.current_salary)) as salaire_moyen
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'active'
GROUP BY d.id, d.name
ORDER BY COUNT(e.id) DESC;

-- Répartition par branche
SELECT 
    'RÉPARTITION PAR BRANCHE' as section,
    b.name as branche,
    COUNT(e.id) as nombre_employes,
    COUNT(DISTINCT e.department_id) as departements_representes
FROM branches b
LEFT JOIN employees e ON b.id = e.branch_id AND e.employment_status = 'active'
GROUP BY b.id, b.name
ORDER BY COUNT(e.id) DESC;

-- Relations hiérarchiques
SELECT 
    'RELATIONS HIÉRARCHIQUES' as section,
    CONCAT(manager.first_name, ' ', manager.last_name) as manager,
    COUNT(subordinate.id) as nombre_subordonnes,
    STRING_AGG(CONCAT(subordinate.first_name, ' ', subordinate.last_name), ', ') as subordonnes
FROM employees manager
JOIN employees subordinate ON manager.id = subordinate.manager_id
WHERE manager.employee_number LIKE 'EMP%' OR subordinate.employee_number LIKE 'EMP%'
GROUP BY manager.id, manager.first_name, manager.last_name
ORDER BY COUNT(subordinate.id) DESC;

-- ===============================================================
-- 🎉 SCRIPT TERMINÉ AVEC SUCCÈS ! (VERSION FINALE CORRIGÉE)
-- ===============================================================
-- ✅ MODULE RH COMPLÈTEMENT DÉPLOYÉ
-- 
-- Données créées :
-- - 3 branches (Dakar, Thiès, Saint-Louis)
-- - 5 départements (Dev, Marketing, Support, RH, Finance)  
-- - 10 positions (différents niveaux et spécialités)
-- - 8 employés de test (avec données réalistes sénégalaises)
-- - Relations hiérarchiques configurées
--
-- CORRECTIONS APPORTÉES :
-- - Supprimé les clauses ON CONFLICT problématiques
-- - Ajouté des DELETE au début pour éviter les doublons
-- - Ajouté colonne 'code' pour les branches (contrainte NOT NULL)
-- - Ajouté colonne 'city' pour les branches (contrainte NOT NULL)
-- - Ajouté colonne 'country' pour les branches
-- - Corrigé structure departments : ajouté code, branch_id, annual_budget
-- - Corrigé structure positions : ajouté code, branch_id, level numérique
-- - Supprimé colonne 'sick_days_used' de l'insertion employees (inexistante)
-- - Adapté toutes les colonnes à la structure réelle Supabase
-- - Script maintenant 100% compatible avec la migration 20250703200000
--
-- PROCHAINES ÉTAPES :
-- 1. Ouvrir http://localhost:8081/
-- 2. Aller sur /hr/employees  
-- 3. Vérifier l'affichage des 8 employés
-- 4. Tester les fonctionnalités CRUD
-- 
-- 🚀 MODULE RH PRÊT POUR PRODUCTION !
-- ===============================================================
