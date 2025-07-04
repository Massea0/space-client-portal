-- ============================================================================
-- VÉRIFICATION DE LA CONTRAINTE ROLE SUR LA TABLE USERS
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Identifier et corriger la contrainte CHECK sur users.role
-- À exécuter dans l'interface web Supabase (SQL Editor)
-- ============================================================================

-- 1. Vérifier la structure de la table users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes CHECK existantes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK';

-- 3. Voir les rôles actuellement présents dans la base
SELECT DISTINCT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- 4. Afficher les contraintes complètes de la table users
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
    AND contype = 'c';
