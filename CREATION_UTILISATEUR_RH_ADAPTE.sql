-- ============================================================================
-- CRÉATION UTILISATEUR RH ADAPTÉ À LA STRUCTURE RÉELLE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer l'utilisateur RH avec la structure existante de users
-- Prérequis: Avoir exécuté CORRECTION_DEFINITIVE_CONTRAINTE_ROLE.sql
-- ============================================================================

-- ÉTAPE 1: Vérifier la contrainte role corrigée
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK';

-- ÉTAPE 2: Obtenir une company_id valide
SELECT id, name 
FROM companies 
ORDER BY created_at 
LIMIT 3;

-- ÉTAPE 3: Créer l'utilisateur RH administrateur
-- Version adaptée aux colonnes existantes de users
INSERT INTO users (
    email,
    role,
    first_name,
    last_name,
    company_id,
    created_at
) VALUES (
    'hr.admin@myspace.com',
    'hr_admin',
    'Administrateur',
    'RH',
    (SELECT id FROM companies ORDER BY created_at LIMIT 1),
    NOW()
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 4: Créer un manager RH également
INSERT INTO users (
    email,
    role,
    first_name,
    last_name,
    company_id,
    created_at
) VALUES (
    'hr.manager@myspace.com',
    'hr_manager',
    'Manager',
    'RH',
    (SELECT id FROM companies ORDER BY created_at LIMIT 1),
    NOW()
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 5: Vérifier les utilisateurs RH créés
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    created_at
FROM users 
WHERE role LIKE 'hr_%'
OR role IN ('hr_admin', 'hr_manager', 'hr_employee')
ORDER BY created_at DESC;

-- ÉTAPE 6: Compter tous les utilisateurs par rôle
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY role;

-- ============================================================================
-- VALIDATION FINALE:
-- ✅ Contrainte users.role permet les rôles RH
-- ✅ 2 utilisateurs RH créés (hr_admin, hr_manager)
-- ✅ Assignation automatique à la première company
-- ✅ Prêt pour l'utilisation du module RH
-- ============================================================================
