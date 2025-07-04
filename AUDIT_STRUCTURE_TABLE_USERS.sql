-- ============================================================================
-- AUDIT STRUCTURE TABLE USERS - MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Identifier la structure exacte de la table users
-- ============================================================================

-- 1. Structure complète de la table users
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Contraintes existantes sur users
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Index sur la table users
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'users'
ORDER BY indexname;

-- 4. Échantillon de données existantes
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    company_id,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Analyse des rôles actuels
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- 6. Vérifier les colonnes communes manquantes
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') 
        THEN 'EXISTE' 
        ELSE 'MANQUANTE' 
    END as colonne_is_active,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') 
        THEN 'EXISTE' 
        ELSE 'MANQUANTE' 
    END as colonne_updated_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') 
        THEN 'EXISTE' 
        ELSE 'MANQUANTE' 
    END as colonne_phone;

-- ============================================================================
-- CE SCRIPT VA RÉVÉLER:
-- - La structure exacte de la table users
-- - Les colonnes disponibles (is_active, updated_at, phone, etc.)
-- - Les contraintes actuelles
-- - Les données existantes pour adapter les requêtes suivantes
-- ============================================================================
