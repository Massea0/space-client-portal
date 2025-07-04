-- VÉRIFICATION PRÉALABLE AVANT INSERTION EMPLOYÉS
-- ============================================
-- À exécuter AVANT le script INSERTION_EMPLOYES_TEST.sql

-- Vérifier la structure RH nécessaire
SELECT 
    'État des tables RH' as check_type,
    (SELECT COUNT(*) FROM branches) as branches_count,
    (SELECT COUNT(*) FROM departments) as departments_count,
    (SELECT COUNT(*) FROM positions) as positions_count,
    (SELECT COUNT(*) FROM employees) as employees_count;

-- Vérifier les données nécessaires
SELECT 
    'Branches disponibles' as data_type,
    id, name
FROM branches;

SELECT 
    'Départements disponibles' as data_type,
    id, name, description
FROM departments 
WHERE name IN ('Développement', 'Marketing', 'Support Client');

SELECT 
    'Positions disponibles' as data_type,
    id, title, department_id
FROM positions 
WHERE title IN ('Développeur Senior', 'Manager Marketing', 'Agent Support');

-- Si les données ci-dessus sont vides, exécuter d'abord le script de données de base
-- Sinon, vous pouvez procéder avec INSERTION_EMPLOYES_TEST.sql
