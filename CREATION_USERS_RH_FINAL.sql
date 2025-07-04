-- ============================================================================
-- CRÉATION FINALE UTILISATEURS RH - ULTRA SIMPLE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer les utilisateurs RH sans contraintes FK
-- Prérequis: Avoir exécuté FINALISATION_SIMPLIFIEE_RH.sql
-- ============================================================================

-- ÉTAPE 1: Obtenir les company_id disponibles
SELECT 
    id,
    name,
    created_at,
    '👆 Copiez un de ces IDs pour remplacer dans les INSERT ci-dessous' as instruction
FROM companies 
ORDER BY created_at;

-- ÉTAPE 2: Créer hr.admin@myspace.com
-- REMPLACEZ 'VOTRE_COMPANY_ID_ICI' par un ID de la requête précédente
INSERT INTO users (
    id, 
    first_name, 
    last_name, 
    email, 
    role, 
    company_id, 
    phone, 
    created_at, 
    is_active
) 
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,  -- ID fixe pour éviter les conflits
    'Administrateur',
    'RH',
    'hr.admin@myspace.com',
    'hr_admin',
    'VOTRE_COMPANY_ID_ICI'::uuid,  -- 👈 REMPLACEZ PAR UN VRAI ID
    '+221 77 123 45 67',
    NOW(),
    true
) 
ON CONFLICT (email) DO NOTHING;  -- Évite les doublons

-- ÉTAPE 3: Créer hr.manager@myspace.com  
-- REMPLACEZ 'VOTRE_COMPANY_ID_ICI' par le même ID que ci-dessus
INSERT INTO users (
    id, 
    first_name, 
    last_name, 
    email, 
    role, 
    company_id, 
    phone, 
    created_at, 
    is_active
) 
VALUES (
    'b2c3d4e5-f6g7-8901-bcde-f12345678901'::uuid,  -- ID fixe différent
    'Manager',
    'RH',
    'hr.manager@myspace.com',
    'hr_manager',
    'VOTRE_COMPANY_ID_ICI'::uuid,  -- 👈 REMPLACEZ PAR LE MÊME ID
    '+221 77 123 45 68',
    NOW(),
    true
) 
ON CONFLICT (email) DO NOTHING;  -- Évite les doublons

-- ÉTAPE 4: Vérifier la création
SELECT 
    '✅ UTILISATEURS RH CRÉÉS' as status,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.is_active,
    c.name as company_name,
    u.created_at
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.role LIKE 'hr_%'
ORDER BY u.created_at DESC;

-- ÉTAPE 5: Validation finale complète
SELECT 
    '🎉 VALIDATION FINALE MODULE RH' as title,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) as tables_rh_count,
    (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') as users_rh_count,
    (SELECT COUNT(*) FROM companies) as companies_count,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables;

-- ÉTAPE 6: Test de la contrainte role
SELECT 
    'TEST CONTRAINTE ROLE' as test,
    constraint_name,
    check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users' AND tc.constraint_type = 'CHECK';

-- ============================================================================
-- CONFIRMATION FINALE
-- ============================================================================

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') >= 2
        THEN '🎉 SUCCÈS COMPLET! Module RH MySpace opérationnel avec utilisateurs RH créés!'
        ELSE '⚠️ Remplacez VOTRE_COMPANY_ID_ICI par un vrai ID et relancez'
    END as resultat_final,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) = 4
        THEN '✅ Tables RH: 4/4 déployées'
        ELSE '❌ Tables RH manquantes - exécutez d''abord SCRIPT_MIGRATION_RH_COMPLET_AVEC_TESTS.sql'
    END as status_tables,
    
    'hr.admin@myspace.com et hr.manager@myspace.com' as comptes_crees,
    'https://myspace.arcadis.tech' as url_application;

-- ============================================================================
-- 🎯 INSTRUCTIONS D'UTILISATION:
-- 1. Regardez la première requête pour obtenir un company_id
-- 2. Remplacez 'VOTRE_COMPANY_ID_ICI' par ce company_id dans les 2 INSERT
-- 3. Exécutez le script complet
-- 4. Vérifiez le résultat final qui doit indiquer "SUCCÈS COMPLET"
-- ============================================================================
