-- CRÉATION DONNÉES DE BASE RH - Script Ultra-simplifié
-- ===================================================
-- Créer les données minimales nécessaires pour tester les employés

-- 1. S'assurer qu'il y a au moins une branche
INSERT INTO branches (name, address, is_headquarters, status) 
VALUES ('Siège Social', '{"city": "Dakar", "country": "Sénégal"}', true, 'active')
ON CONFLICT (name) DO NOTHING;

-- 2. Créer 3 départements de base
INSERT INTO departments (name, description, status) VALUES 
('Développement', 'Équipe de développement logiciel', 'active'),
('Marketing', 'Équipe marketing et communication', 'active'),
('Support Client', 'Service client et support technique', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. Créer quelques positions de base
INSERT INTO positions (
    title, department_id, level, min_salary, max_salary, is_management
) VALUES 
(
    'Développeur Senior', 
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    'senior', 50000, 70000, false
),
(
    'Manager Marketing', 
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    'manager', 60000, 80000, true
),
(
    'Agent Support', 
    (SELECT id FROM departments WHERE name = 'Support Client' LIMIT 1),
    'junior', 30000, 45000, false
)
ON CONFLICT (title) DO NOTHING;

-- Vérification
SELECT 
    'Données de base créées' as status,
    (SELECT COUNT(*) FROM branches) as branches,
    (SELECT COUNT(*) FROM departments) as departments,
    (SELECT COUNT(*) FROM positions) as positions;

-- Afficher les IDs créés pour référence
SELECT 'BRANCHES:' as table_name, id, name FROM branches;
SELECT 'DEPARTMENTS:' as table_name, id, name FROM departments;
SELECT 'POSITIONS:' as table_name, id, title FROM positions;
