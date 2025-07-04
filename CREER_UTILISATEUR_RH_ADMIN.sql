-- ============================================================================
-- CRÉATION UTILISATEUR RH ADMINISTRATEUR
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer l'utilisateur RH administrateur après correction des contraintes
-- Prérequis: Avoir exécuté CORRIGER_CONTRAINTE_ROLE_USERS.sql
-- À exécuter dans l'interface web Supabase (SQL Editor)
-- ============================================================================

-- ÉTAPE 1: Vérifier que la contrainte a été corrigée
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name = 'users_role_check';

-- ÉTAPE 2: Obtenir une company_id valide pour l'assignation
SELECT id, name 
FROM companies 
ORDER BY created_at 
LIMIT 3;

-- ÉTAPE 3: Créer l'utilisateur RH administrateur
-- ATTENTION: Remplacer company_id_here par un ID valide de l'étape 2
INSERT INTO users (
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    is_active,
    phone,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'hr.admin@myspace.com',
    'hr_admin',
    'Administrateur',
    'RH',
    'company_id_here', -- À remplacer par un ID valide
    true,
    '+33 1 00 00 00 00',
    now(),
    now()
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 4: Créer un manager RH également
INSERT INTO users (
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    is_active,
    phone,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'hr.manager@myspace.com',
    'hr_manager',
    'Manager',
    'RH',
    'company_id_here', -- À remplacer par le même ID
    true,
    '+33 1 00 00 00 01',
    now(),
    now()
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 5: Vérifier les utilisateurs RH créés
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    is_active,
    created_at
FROM users 
WHERE role LIKE 'hr_%'
ORDER BY created_at DESC;

-- ÉTAPE 6: Vérifier l'intégration avec les tables RH
SELECT 
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    c.name as company_name,
    COUNT(b.id) as branches_count,
    COUNT(d.id) as departments_count
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN branches b ON c.id = b.company_id
LEFT JOIN departments d ON c.id = d.company_id
WHERE u.role LIKE 'hr_%'
GROUP BY u.id, u.email, u.role, u.first_name, u.last_name, c.name
ORDER BY u.created_at DESC;

-- ============================================================================
-- VALIDATION FINALE DU MODULE RH
-- ============================================================================

-- Compter toutes les tables RH
SELECT 
    'branches' as table_name, COUNT(*) as records
FROM branches
UNION ALL
SELECT 
    'departments' as table_name, COUNT(*) as records
FROM departments
UNION ALL
SELECT 
    'positions' as table_name, COUNT(*) as records
FROM positions
UNION ALL
SELECT 
    'employees' as table_name, COUNT(*) as records
FROM employees
UNION ALL
SELECT 
    'users_rh' as table_name, COUNT(*) as records
FROM users 
WHERE role LIKE 'hr_%';

-- ============================================================================
-- INSTRUCTIONS D'EXÉCUTION:
-- 1. Exécuter d'abord VERIFIER_CONTRAINTE_ROLE_USERS.sql
-- 2. Puis CORRIGER_CONTRAINTE_ROLE_USERS.sql
-- 3. Enfin ce script
-- 4. Remplacer 'company_id_here' par un ID valide trouvé à l'étape 2
-- 5. Les utilisateurs RH auront accès aux fonctionnalités RH via l'interface
-- ============================================================================
