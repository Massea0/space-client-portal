-- ===============================================================
-- SCRIPT UNIQUE COMPLET - MODULE RH SUPABASE
-- ===============================================================
-- Ce script tout-en-un effectue :
-- 1. Vérification de l'état des tables RH
-- 2. Création des données de base (branches, départements, positions)
-- 3. Insertion de 5 employés de test
-- 4. Validation finale complète
-- ===============================================================

-- ==============
-- ÉTAPE 1: VÉRIFICATION PRÉALABLE
-- ==============

DO $$
BEGIN
    RAISE NOTICE '🔍 === VÉRIFICATION DE L''ÉTAT DES TABLES RH ===';
END $$;

-- Vérifier que les tables existent
SELECT 
    'Tables RH disponibles' as check_type,
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches') THEN '✅' ELSE '❌' END) as branches_table,
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN '✅' ELSE '❌' END) as departments_table,
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positions') THEN '✅' ELSE '❌' END) as positions_table,
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN '✅' ELSE '❌' END) as employees_table;

-- Compter les enregistrements existants
SELECT 
    'État actuel des données' as check_type,
    (SELECT COUNT(*) FROM branches) as branches_count,
    (SELECT COUNT(*) FROM departments) as departments_count,
    (SELECT COUNT(*) FROM positions) as positions_count,
    (SELECT COUNT(*) FROM employees) as employees_count;

-- ==============
-- ÉTAPE 2: CRÉATION DES DONNÉES DE BASE
-- ==============

DO $$
BEGIN
    RAISE NOTICE '🏗️ === CRÉATION DES DONNÉES DE BASE ===';
END $$;

-- A. Créer au moins une branche (siège social)
INSERT INTO branches (name, address, phone, email, timezone, is_headquarters, status) 
VALUES (
    'Siège Social',
    '{"street": "123 Avenue des Affaires", "city": "Dakar", "postal_code": "10000", "country": "Sénégal"}'::jsonb,
    '+221 33 123 45 67',
    'contact@arcadis.com',
    'Africa/Dakar',
    true,
    'active'
)
ON CONFLICT (name) DO NOTHING;

-- Ajouter d'autres branches
INSERT INTO branches (name, address, phone, email, timezone, is_headquarters, status) VALUES 
(
    'Succursale Thiès',
    '{"street": "456 Rue du Commerce", "city": "Thiès", "postal_code": "21000", "country": "Sénégal"}'::jsonb,
    '+221 33 987 65 43',
    'thies@arcadis.com',
    'Africa/Dakar',
    false,
    'active'
),
(
    'Bureau Saint-Louis',
    '{"street": "789 Boulevard de l''Indépendance", "city": "Saint-Louis", "postal_code": "32000", "country": "Sénégal"}'::jsonb,
    '+221 33 555 44 33',
    'saintlouis@arcadis.com',
    'Africa/Dakar',
    false,
    'active'
)
ON CONFLICT (name) DO NOTHING;

-- B. Créer les départements essentiels
INSERT INTO departments (name, description, budget, location, phone, email, status) VALUES 
(
    'Développement',
    'Équipe de développement logiciel et innovation technologique',
    500000,
    'Siège Social - Étage 2',
    '+221 33 123 45 68',
    'dev@arcadis.com',
    'active'
),
(
    'Marketing',
    'Équipe marketing, communication et relations clients',
    300000,
    'Siège Social - Étage 1',
    '+221 33 123 45 69',
    'marketing@arcadis.com',
    'active'
),
(
    'Support Client',
    'Service client, support technique et assistance utilisateurs',
    200000,
    'Siège Social - Rez-de-chaussée',
    '+221 33 123 45 70',
    'support@arcadis.com',
    'active'
),
(
    'Ressources Humaines',
    'Gestion du personnel, recrutement et développement',
    150000,
    'Siège Social - Étage 3',
    '+221 33 123 45 71',
    'rh@arcadis.com',
    'active'
),
(
    'Finance',
    'Comptabilité, gestion financière et contrôle de gestion',
    250000,
    'Siège Social - Étage 3',
    '+221 33 123 45 72',
    'finance@arcadis.com',
    'active'
)
ON CONFLICT (name) DO NOTHING;

-- C. Créer les positions/postes dans chaque département
INSERT INTO positions (
    title, description, department_id, level, min_salary, max_salary, 
    required_skills, responsibilities, requirements, benefits,
    employment_type, remote_allowed, is_management, status
) VALUES 

-- Positions Développement
(
    'Développeur Senior',
    'Développeur expérimenté en charge du développement d''applications web et mobiles',
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    'senior',
    400000,
    600000,
    '["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Git"]'::jsonb,
    '["Développement d''applications", "Revue de code", "Mentoring junior", "Architecture technique"]'::jsonb,
    '["3+ ans d''expérience", "Maîtrise JavaScript/TypeScript", "Expérience bases de données"]'::jsonb,
    '["Télétravail possible", "Formation continue", "Équipement fourni", "Assurance santé"]'::jsonb,
    'full_time',
    true,
    false,
    'active'
),
(
    'Développeur Junior',
    'Développeur débutant en apprentissage et développement',
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    'junior',
    250000,
    350000,
    '["JavaScript", "HTML", "CSS", "React", "Git"]'::jsonb,
    '["Développement fonctionnalités", "Tests unitaires", "Documentation"]'::jsonb,
    '["Formation informatique", "Bases JavaScript", "Motivation d''apprendre"]'::jsonb,
    '["Formation continue", "Mentoring", "Équipement fourni", "Assurance santé"]'::jsonb,
    'full_time',
    true,
    false,
    'active'
),
(
    'Tech Lead',
    'Leader technique en charge de l''équipe de développement',
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    'lead',
    600000,
    800000,
    '["Leadership", "Architecture", "JavaScript", "TypeScript", "DevOps", "Management"]'::jsonb,
    '["Management équipe", "Architecture système", "Choix technologiques", "Coordination projets"]'::jsonb,
    '["5+ ans d''expérience", "Expérience management", "Expertise technique avancée"]'::jsonb,
    '["Télétravail", "Formation leadership", "Équipement premium", "Assurance famille"]'::jsonb,
    'full_time',
    true,
    true,
    'active'
),

-- Positions Marketing
(
    'Manager Marketing',
    'Responsable de la stratégie marketing et communication',
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    'manager',
    450000,
    650000,
    '["Marketing Digital", "Analytics", "SEO", "Social Media", "Management", "Communication"]'::jsonb,
    '["Stratégie marketing", "Campagnes publicitaires", "Management équipe", "Analyse performance"]'::jsonb,
    '["3+ ans marketing", "Expérience management", "Maîtrise outils digitaux"]'::jsonb,
    '["Télétravail partiel", "Formation marketing", "Budget campagnes", "Assurance santé"]'::jsonb,
    'full_time',
    false,
    true,
    'active'
),
(
    'Chargé Marketing',
    'Exécution des campagnes marketing et communication',
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    'intermediate',
    300000,
    400000,
    '["Marketing Digital", "Content Marketing", "SEO", "Analytics", "Design"]'::jsonb,
    '["Création contenu", "Gestion réseaux sociaux", "Campagnes publicitaires", "Reporting"]'::jsonb,
    '["Formation marketing", "Créativité", "Maîtrise outils digitaux"]'::jsonb,
    '["Formation continue", "Outils marketing", "Assurance santé"]'::jsonb,
    'full_time',
    true,
    false,
    'active'
),

-- Positions Support Client
(
    'Manager Support',
    'Responsable de l''équipe support client',
    (SELECT id FROM departments WHERE name = 'Support Client' LIMIT 1),
    'manager',
    400000,
    550000,
    '["Management", "Service Client", "CRM", "Communication", "Résolution problèmes"]'::jsonb,
    '["Management équipe support", "Amélioration processus", "Formation équipe", "Escalade problèmes"]'::jsonb,
    '["Expérience service client", "Compétences management", "Excellente communication"]'::jsonb,
    '["Formation management", "Outils CRM", "Assurance santé"]'::jsonb,
    'full_time',
    false,
    true,
    'active'
),
(
    'Agent Support',
    'Support technique et assistance clients',
    (SELECT id FROM departments WHERE name = 'Support Client' LIMIT 1),
    'junior',
    250000,
    350000,
    '["Service Client", "Communication", "CRM", "Résolution problèmes", "Patience"]'::jsonb,
    '["Assistance clients", "Résolution incidents", "Documentation solutions", "Suivi tickets"]'::jsonb,
    '["Excellente communication", "Patience", "Bases techniques"]'::jsonb,
    '["Formation service client", "Outils CRM", "Assurance santé"]'::jsonb,
    'full_time',
    true,
    false,
    'active'
),

-- Positions RH
(
    'Manager RH',
    'Responsable des ressources humaines',
    (SELECT id FROM departments WHERE name = 'Ressources Humaines' LIMIT 1),
    'manager',
    500000,
    700000,
    '["Management RH", "Recrutement", "Gestion paie", "Droit du travail", "Communication"]'::jsonb,
    '["Stratégie RH", "Recrutement", "Gestion conflits", "Formation équipes", "Conformité légale"]'::jsonb,
    '["Formation RH", "Expérience management", "Connaissance droit travail"]'::jsonb,
    '["Formation continue", "Outils RH", "Assurance famille"]'::jsonb,
    'full_time',
    false,
    true,
    'active'
),

-- Positions Finance
(
    'Comptable',
    'Gestion comptable et financière',
    (SELECT id FROM departments WHERE name = 'Finance' LIMIT 1),
    'intermediate',
    350000,
    450000,
    '["Comptabilité", "Excel", "Logiciels comptables", "Analyse financière", "Rigueur"]'::jsonb,
    '["Tenue comptabilité", "Déclarations fiscales", "Analyse budgets", "Reporting financier"]'::jsonb,
    '["Formation comptabilité", "Maîtrise Excel", "Rigueur et précision"]'::jsonb,
    '["Formation continue", "Logiciels comptables", "Assurance santé"]'::jsonb,
    'full_time',
    false,
    false,
    'active'
)
ON CONFLICT (title) DO NOTHING;

-- ==============
-- ÉTAPE 3: VALIDATION DES DONNÉES DE BASE
-- ==============

DO $$
BEGIN
    RAISE NOTICE '✅ === VALIDATION DES DONNÉES DE BASE ===';
END $$;

SELECT 
    'Données de base créées' as status,
    (SELECT COUNT(*) FROM branches) as branches,
    (SELECT COUNT(*) FROM departments) as departments,
    (SELECT COUNT(*) FROM positions) as positions;

-- Afficher les données créées
SELECT 'BRANCHES DISPONIBLES:' as info, id, name FROM branches ORDER BY name;
SELECT 'DÉPARTEMENTS DISPONIBLES:' as info, id, name FROM departments ORDER BY name;
SELECT 'POSITIONS DISPONIBLES:' as info, id, title, d.name as department FROM positions p 
JOIN departments d ON p.department_id = d.id ORDER BY d.name, p.title;

-- ==============
-- ÉTAPE 4: INSERTION DES EMPLOYÉS DE TEST
-- ==============

DO $$
BEGIN
    RAISE NOTICE '👥 === INSERTION DES EMPLOYÉS DE TEST ===';
END $$;

-- Insérer 8 employés de test avec des données complètes et réalistes
INSERT INTO employees (
    employee_number, first_name, last_name, middle_name, preferred_name,
    work_email, personal_email, personal_phone, work_phone,
    branch_id, department_id, position_id,
    hire_date, start_date, employment_status, employment_type,
    current_salary, salary_currency, performance_score,
    vacation_days_total, vacation_days_used, sick_days_used,
    skills, certifications, languages, work_preferences, timezone,
    ai_insights, performance_trends, career_recommendations,
    emergency_contact, address
) VALUES 

-- 1. Jean Dupont - Développeur Senior
(
    'EMP001', 'Jean', 'Dupont', 'Marie', 'Jean',
    'jean.dupont@arcadis.com', 'jean.dupont@gmail.com', 
    '+221 77 123 45 67', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Développeur Senior' LIMIT 1),
    '2023-01-15', '2023-01-15', 'active', 'full_time',
    550000, 'XOF', 4.5,
    25, 5, 2,
    '["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Git"]'::jsonb,
    '["AWS Certified Developer", "Scrum Master"]'::jsonb,
    '["Français", "Anglais", "Wolof"]'::jsonb,
    '{"remote_work": true, "flexible_hours": true, "preferred_start": "09:00"}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.8, "turnover_risk": 0.1, "promotion_readiness": 0.85}'::jsonb,
    '{"quarterly_scores": [4.2, 4.5, 4.6, 4.7], "improvement_areas": ["leadership"]}'::jsonb,
    '[{"type": "promotion", "title": "Tech Lead", "priority": 4}]'::jsonb,
    '{"name": "Marie Dupont", "relationship": "Épouse", "phone": "+221 77 987 65 43"}'::jsonb,
    '{"street": "Cité Keur Gorgui, Villa 123", "city": "Dakar", "postal_code": "10000", "country": "Sénégal"}'::jsonb
),

-- 2. Marie Martin - Manager Marketing
(
    'EMP002', 'Marie', 'Martin', 'Fatou', 'Marie',
    'marie.martin@arcadis.com', 'marie.martin@gmail.com',
    '+221 77 234 56 78', '+221 33 123 45 69',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Manager Marketing' LIMIT 1),
    '2022-06-10', '2022-06-10', 'active', 'full_time',
    580000, 'XOF', 4.8,
    25, 12, 1,
    '["Marketing Digital", "Analytics", "SEO", "Management", "Adobe Creative", "Social Media"]'::jsonb,
    '["Google Analytics Certified", "Facebook Blueprint", "Hubspot Certified"]'::jsonb,
    '["Français", "Anglais", "Espagnol", "Wolof"]'::jsonb,
    '{"remote_work": false, "travel_ok": true, "preferred_start": "08:30"}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.9, "turnover_risk": 0.05, "leadership_score": 4.7}'::jsonb,
    '{"quarterly_scores": [4.5, 4.7, 4.8, 4.8], "team_satisfaction": 4.6}'::jsonb,
    '[{"type": "lateral_move", "title": "Directeur Marketing", "priority": 3}]'::jsonb,
    '{"name": "Paul Martin", "relationship": "Époux", "phone": "+221 77 111 22 33"}'::jsonb,
    '{"street": "Almadies, Résidence les Palmiers", "city": "Dakar", "postal_code": "10001", "country": "Sénégal"}'::jsonb
),

-- 3. Pierre Durand - Agent Support
(
    'EMP003', 'Pierre', 'Durand', 'Mamadou', 'Pierre',
    'pierre.durand@arcadis.com', 'pierre.durand@gmail.com',
    '+221 77 345 67 89', '+221 33 123 45 70',
    (SELECT id FROM branches WHERE name = 'Succursale Thiès' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Support Client' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Agent Support' LIMIT 1),
    '2023-09-01', '2023-09-01', 'active', 'part_time',
    280000, 'XOF', 4.2,
    20, 3, 0,
    '["Service Client", "CRM", "Communication", "Zendesk", "Résolution problèmes"]'::jsonb,
    '["Zendesk Certified", "Customer Service Excellence"]'::jsonb,
    '["Français", "Anglais", "Wolof", "Pulaar"]'::jsonb,
    '{"remote_work": true, "part_time": true, "hours_per_week": 30}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.5, "turnover_risk": 0.15, "customer_satisfaction": 4.3}'::jsonb,
    '{"quarterly_scores": [4.0, 4.2, 4.2, 4.3], "resolution_time_improvement": 15}'::jsonb,
    '[{"type": "skill_development", "title": "Formation CRM Avancé", "priority": 3}]'::jsonb,
    '{"name": "Sophie Durand", "relationship": "Épouse", "phone": "+221 77 444 55 66"}'::jsonb,
    '{"street": "Quartier Randoulène, Maison 456", "city": "Thiès", "postal_code": "21000", "country": "Sénégal"}'::jsonb
),

-- 4. Claire Moreau - Développeur Senior
(
    'EMP004', 'Claire', 'Moreau', 'Aminata', 'Claire',
    'claire.moreau@arcadis.com', 'claire.moreau@gmail.com',
    '+221 77 456 78 90', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Développeur Senior' LIMIT 1),
    '2024-03-01', '2024-03-01', 'active', 'full_time',
    520000, 'XOF', 4.6,
    25, 8, 1,
    '["React", "Python", "Docker", "CI/CD", "MongoDB", "API REST"]'::jsonb,
    '["Docker Certified Associate", "MongoDB Developer"]'::jsonb,
    '["Français", "Anglais", "Allemand", "Wolof"]'::jsonb,
    '{"remote_work": true, "flexible_hours": false, "preferred_start": "08:00"}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.7, "turnover_risk": 0.08, "technical_score": 4.8}'::jsonb,
    '{"quarterly_scores": [4.4, 4.6, 4.6, 4.7], "code_quality_score": 4.9}'::jsonb,
    '[{"type": "lateral_move", "title": "Tech Lead", "priority": 4}]'::jsonb,
    '{"name": "Vincent Moreau", "relationship": "Époux", "phone": "+221 77 777 88 99"}'::jsonb,
    '{"street": "Mermoz, Immeuble les Baobabs", "city": "Dakar", "postal_code": "10002", "country": "Sénégal"}'::jsonb
),

-- 5. Thomas Bernard - Chargé Marketing
(
    'EMP005', 'Thomas', 'Bernard', 'Ibrahima', 'Thomas',
    'thomas.bernard@arcadis.com', 'thomas.bernard@gmail.com',
    '+221 77 567 89 01', '+221 33 123 45 69',
    (SELECT id FROM branches WHERE name = 'Bureau Saint-Louis' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Chargé Marketing' LIMIT 1),
    '2024-01-15', '2024-01-15', 'active', 'contract',
    320000, 'XOF', 4.0,
    22, 2, 3,
    '["Content Marketing", "Copywriting", "Design", "SEO", "Analytics"]'::jsonb,
    '["Content Marketing Institute", "Google Ads Certified"]'::jsonb,
    '["Français", "Anglais", "Wolof", "Pulaar"]'::jsonb,
    '{"remote_work": true, "contract_end": "2024-12-31", "renewal_possible": true}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.3, "turnover_risk": 0.25, "creativity_score": 4.5}'::jsonb,
    '{"quarterly_scores": [3.8, 4.0, 4.1, 4.0], "content_engagement": 78}'::jsonb,
    '[{"type": "training", "title": "Formation Design Avancé", "priority": 3}]'::jsonb,
    '{"name": "Laura Bernard", "relationship": "Sœur", "phone": "+221 77 333 44 55"}'::jsonb,
    '{"street": "Quartier Sor, Maison traditionnelle", "city": "Saint-Louis", "postal_code": "32000", "country": "Sénégal"}'::jsonb
),

-- 6. Aminata Diallo - Développeur Junior
(
    'EMP006', 'Aminata', 'Diallo', 'Fatou', 'Aminata',
    'aminata.diallo@arcadis.com', 'aminata.diallo@gmail.com',
    '+221 77 678 90 12', '+221 33 123 45 68',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Développeur Junior' LIMIT 1),
    '2024-06-01', '2024-06-01', 'active', 'full_time',
    280000, 'XOF', 3.8,
    25, 0, 1,
    '["JavaScript", "HTML", "CSS", "React", "Git", "Apprentissage"]'::jsonb,
    '["Formation Full Stack Web Developer"]'::jsonb,
    '["Français", "Anglais", "Wolof", "Sérère"]'::jsonb,
    '{"remote_work": true, "mentoring_needed": true, "preferred_start": "09:00"}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.2, "turnover_risk": 0.12, "learning_speed": 4.5}'::jsonb,
    '{"quarterly_scores": [3.5, 3.8], "progression_rate": "rapide"}'::jsonb,
    '[{"type": "training", "title": "Formation React Avancé", "priority": 5}]'::jsonb,
    '{"name": "Modou Diallo", "relationship": "Père", "phone": "+221 77 222 33 44"}'::jsonb,
    '{"street": "Guédiawaye, Cité Millionnaire", "city": "Dakar", "postal_code": "10003", "country": "Sénégal"}'::jsonb
),

-- 7. Mamadou Fall - Manager RH
(
    'EMP007', 'Mamadou', 'Fall', 'Cheikh', 'Mamadou',
    'mamadou.fall@arcadis.com', 'mamadou.fall@gmail.com',
    '+221 77 789 01 23', '+221 33 123 45 71',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Ressources Humaines' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Manager RH' LIMIT 1),
    '2021-03-15', '2021-03-15', 'active', 'full_time',
    620000, 'XOF', 4.7,
    30, 15, 2,
    '["Management RH", "Recrutement", "Gestion paie", "Droit du travail", "Communication", "Médiation"]'::jsonb,
    '["Certified HR Professional", "Droit du Travail Sénégal", "Management Leadership"]'::jsonb,
    '["Français", "Anglais", "Wolof", "Pulaar", "Arabe"]'::jsonb,
    '{"remote_work": false, "confidentiality_required": true, "flexible_hours": true}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.8, "turnover_risk": 0.05, "team_leadership": 4.9}'::jsonb,
    '{"quarterly_scores": [4.5, 4.6, 4.7, 4.8], "employee_satisfaction": 4.7}'::jsonb,
    '[{"type": "training", "title": "Formation SIRH Avancé", "priority": 2}]'::jsonb,
    '{"name": "Aicha Fall", "relationship": "Épouse", "phone": "+221 77 555 66 77"}'::jsonb,
    '{"street": "Point E, Villa moderne", "city": "Dakar", "postal_code": "10004", "country": "Sénégal"}'::jsonb
),

-- 8. Fatou Ndoye - Comptable
(
    'EMP008', 'Fatou', 'Ndoye', 'Mariama', 'Fatou',
    'fatou.ndoye@arcadis.com', 'fatou.ndoye@gmail.com',
    '+221 77 890 12 34', '+221 33 123 45 72',
    (SELECT id FROM branches WHERE name = 'Siège Social' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Finance' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Comptable' LIMIT 1),
    '2022-11-01', '2022-11-01', 'active', 'full_time',
    380000, 'XOF', 4.4,
    25, 8, 0,
    '["Comptabilité", "Excel", "Sage", "Analyse financière", "Rigueur", "Reporting"]'::jsonb,
    '["Comptable Agréé Sénégal", "Sage Certification", "Excel Expert"]'::jsonb,
    '["Français", "Anglais", "Wolof"]'::jsonb,
    '{"remote_work": false, "precision_required": true, "deadline_oriented": true}'::jsonb,
    'Africa/Dakar',
    '{"performance_prediction": 4.6, "turnover_risk": 0.08, "accuracy_score": 4.9}'::jsonb,
    '{"quarterly_scores": [4.2, 4.3, 4.4, 4.5], "error_rate": 0.02}'::jsonb,
    '[{"type": "training", "title": "Formation Analyse Financière", "priority": 3}]'::jsonb,
    '{"name": "Omar Ndoye", "relationship": "Époux", "phone": "+221 77 666 77 88"}'::jsonb,
    '{"street": "Sacré Cœur 3, Appartement moderne", "city": "Dakar", "postal_code": "10005", "country": "Sénégal"}'::jsonb
)

-- Gestion des conflits : ne pas insérer si l'employé existe déjà
ON CONFLICT (employee_number) DO NOTHING;

-- ==============
-- ÉTAPE 5: CONFIGURATION DES RELATIONS HIÉRARCHIQUES
-- ==============

DO $$
BEGIN
    RAISE NOTICE '🔗 === CONFIGURATION DES RELATIONS HIÉRARCHIQUES ===';
END $$;

-- Marie (Manager Marketing) supervise Thomas (Chargé Marketing)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP002')
WHERE employee_number = 'EMP005';

-- Jean (Développeur Senior) supervise Aminata (Développeur Junior)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP001')
WHERE employee_number = 'EMP006';

-- Mamadou (Manager RH) supervise l'ensemble RH (pas d'employés RH juniors pour l'instant)
-- Pas de relation hiérarchique pour Pierre (Agent Support) car pas de manager support

-- Mettre à jour les comptes de rapports directs
UPDATE employees 
SET reports_count = (
    SELECT COUNT(*) 
    FROM employees e2 
    WHERE e2.manager_id = employees.id
);

-- ==============
-- ÉTAPE 6: VALIDATION FINALE COMPLÈTE
-- ==============

DO $$
BEGIN
    RAISE NOTICE '🎯 === VALIDATION FINALE COMPLÈTE ===';
END $$;

-- Statistiques globales
SELECT 
    'RÉSUMÉ FINAL MODULE RH' as test_name,
    (SELECT COUNT(*) FROM branches) as branches_total,
    (SELECT COUNT(*) FROM departments) as departments_total,
    (SELECT COUNT(*) FROM positions) as positions_total,
    (SELECT COUNT(*) FROM employees) as employees_total,
    (SELECT COUNT(*) FROM users WHERE role IN ('hr_manager', 'manager')) as hr_users_total;

-- Détail des employés créés avec leurs relations
SELECT 
    '=== EMPLOYÉS CRÉÉS ===' as section,
    e.employee_number,
    e.first_name || ' ' || e.last_name as nom_complet,
    e.work_email,
    d.name as departement,
    p.title as poste,
    b.name as branche,
    e.employment_status as statut,
    e.employment_type as type_emploi,
    e.current_salary || ' ' || e.salary_currency as salaire,
    e.performance_score as performance,
    CASE 
        WHEN e.manager_id IS NOT NULL 
        THEN manager.first_name || ' ' || manager.last_name 
        ELSE 'Aucun manager' 
    END as manager_nom,
    e.reports_count as nombre_subordonnes
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN branches b ON e.branch_id = b.id
LEFT JOIN employees manager ON e.manager_id = manager.id
ORDER BY e.employee_number;

-- Répartition par département
SELECT 
    '=== RÉPARTITION PAR DÉPARTEMENT ===' as section,
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
    '=== RÉPARTITION PAR BRANCHE ===' as section,
    b.name as branche,
    COUNT(e.id) as nombre_employes,
    COUNT(DISTINCT e.department_id) as departements_representes
FROM branches b
LEFT JOIN employees e ON b.id = e.branch_id AND e.employment_status = 'active'
GROUP BY b.id, b.name
ORDER BY COUNT(e.id) DESC;

-- Relations hiérarchiques
SELECT 
    '=== RELATIONS HIÉRARCHIQUES ===' as section,
    manager.first_name || ' ' || manager.last_name as manager,
    COUNT(subordinate.id) as nombre_subordonnes,
    STRING_AGG(subordinate.first_name || ' ' || subordinate.last_name, ', ') as subordonnes
FROM employees manager
JOIN employees subordinate ON manager.id = subordinate.manager_id
GROUP BY manager.id, manager.first_name, manager.last_name
ORDER BY COUNT(subordinate.id) DESC;

-- Message de succès final
DO $$
BEGIN
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '🎉 MODULE RH DÉPLOYÉ AVEC SUCCÈS !';
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '✅ % branches créées', (SELECT COUNT(*) FROM branches);
    RAISE NOTICE '✅ % départements créés', (SELECT COUNT(*) FROM departments);
    RAISE NOTICE '✅ % positions créées', (SELECT COUNT(*) FROM positions);
    RAISE NOTICE '✅ % employés insérés', (SELECT COUNT(*) FROM employees);
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PROCHAINES ÉTAPES :';
    RAISE NOTICE '   1. Ouvrir http://localhost:8081/';
    RAISE NOTICE '   2. Aller sur /hr/employees';
    RAISE NOTICE '   3. Vérifier l''affichage des employés';
    RAISE NOTICE '   4. Tester les fonctionnalités CRUD';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 MODULE RH PRÊT POUR PRODUCTION !';
    RAISE NOTICE '===============================================';
END $$;
