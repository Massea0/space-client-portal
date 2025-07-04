-- ============================================================================
-- CORRECTION DE LA CONTRAINTE ROLE SUR LA TABLE USERS
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Modifier la contrainte CHECK pour permettre les rôles RH
-- À exécuter dans l'interface web Supabase (SQL Editor)
-- ATTENTION: Exécuter d'abord VERIFIER_CONTRAINTE_ROLE_USERS.sql
-- ============================================================================

-- ÉTAPE 1: Supprimer l'ancienne contrainte CHECK (remplacer [NOM_CONTRAINTE] par le nom réel)
-- Cette commande sera à personnaliser selon le résultat de la vérification
-- ALTER TABLE users DROP CONSTRAINT [NOM_CONTRAINTE];

-- ÉTAPE 2: Ajouter la nouvelle contrainte CHECK avec les rôles RH
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN (
    'user',          -- Utilisateur standard
    'admin',         -- Administrateur système
    'company_admin', -- Administrateur d'entreprise
    'manager',       -- Manager/gestionnaire
    'hr_admin',      -- Administrateur RH
    'hr_manager',    -- Manager RH
    'hr_employee',   -- Employé RH
    'employee',      -- Employé standard
    'client',        -- Client
    'supplier'       -- Fournisseur
));

-- ÉTAPE 3: Vérifier que la nouvelle contrainte est active
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name = 'users_role_check';

-- ÉTAPE 4: Test d'insertion d'un utilisateur RH (facultatif)
-- Cette requête ne sera pas exécutée automatiquement
/*
INSERT INTO users (
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    created_at
) VALUES (
    gen_random_uuid(),
    'hr.test@example.com',
    'hr_manager',
    'Test',
    'HR Manager',
    (SELECT id FROM companies LIMIT 1),
    now()
);
*/

-- ============================================================================
-- NOTES D'EXÉCUTION:
-- 1. Vérifiez d'abord le nom de la contrainte existante avec le script de vérification
-- 2. Remplacez [NOM_CONTRAINTE] par le nom réel trouvé
-- 3. Si aucune contrainte n'existe, supprimez l'ÉTAPE 1
-- 4. Exécutez les étapes une par une pour éviter les erreurs
-- ============================================================================
