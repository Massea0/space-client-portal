-- ============================================================================
-- CORRECTION DÉFINITIVE DE LA CONTRAINTE USERS.ROLE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Corriger la contrainte existante pour inclure les rôles RH
-- PROBLÈME IDENTIFIÉ: Contrainte existante = CHECK ((role = ANY (ARRAY['client'::text, 'admin'::text])))
-- ============================================================================

-- ÉTAPE 1: Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- ÉTAPE 2: Créer la nouvelle contrainte avec tous les rôles nécessaires
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN (
    'client',
    'admin',
    'user',
    'company_admin',
    'manager',
    'hr_admin',
    'hr_manager',
    'hr_employee',
    'employee',
    'supplier',
    'super_admin'
));

-- ÉTAPE 3: Vérifier la nouvelle contrainte
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

-- ÉTAPE 4: Test d'insertion d'un utilisateur RH
-- Cette requête sera commentée par défaut
/*
INSERT INTO users (
    email,
    role,
    first_name,
    last_name,
    company_id
) VALUES (
    'test.hr@example.com',
    'hr_manager',
    'Test',
    'HR Manager',
    (SELECT id FROM companies LIMIT 1)
) RETURNING id, email, role, first_name, last_name;
*/

-- ÉTAPE 5: Vérifier la structure de la table users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Contrainte supprimée et recréée avec succès
-- ✅ Nouveau CHECK autorise: client, admin, user, company_admin, manager, 
--    hr_admin, hr_manager, hr_employee, employee, supplier, super_admin
-- ✅ Test d'insertion possible pour rôles RH
-- ============================================================================
