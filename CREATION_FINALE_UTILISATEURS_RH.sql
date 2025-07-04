-- ============================================================================
-- CRÉATION FINALE DES UTILISATEURS RH - MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer les utilisateurs RH administrateurs
-- Prérequis: Contrainte users.role corrigée
-- À copier-coller après avoir obtenu un company_id valide
-- ============================================================================

-- ÉTAPE 1: Obtenir un company_id valide
SELECT 
    id as company_id, 
    name as company_name,
    created_at
FROM companies 
ORDER BY created_at;

-- ÉTAPE 2: Créer hr.admin@myspace.com
-- Remplacez 'VOTRE_COMPANY_ID_ICI' par un ID de l'étape 1
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
SELECT 
    gen_random_uuid(),
    'Administrateur',
    'RH',
    'hr.admin@myspace.com',
    'hr_admin',
    'VOTRE_COMPANY_ID_ICI'::uuid,  -- ⚠️ REMPLACER ICI
    '+221 77 123 45 67',
    NOW(),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'hr.admin@myspace.com'
);

-- ÉTAPE 3: Créer hr.manager@myspace.com
-- Utilisez le même company_id que ci-dessus
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
SELECT 
    gen_random_uuid(),
    'Manager',
    'RH',
    'hr.manager@myspace.com',
    'hr_manager',
    'VOTRE_COMPANY_ID_ICI'::uuid,  -- ⚠️ REMPLACER ICI
    '+221 77 123 45 68',
    NOW(),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'hr.manager@myspace.com'
);

-- ÉTAPE 4: Vérifier les utilisateurs créés
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

-- ÉTAPE 5: Validation finale du module RH
SELECT 
    '🎯 VALIDATION FINALE MODULE RH' as validation,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) as tables_rh,
    (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') as users_rh,
    (SELECT COUNT(*) FROM companies) as companies_total,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_name IN ('branches', 'departments', 'positions', 'employees')) = 4
             AND (SELECT COUNT(*) FROM users WHERE role LIKE 'hr_%') >= 2
        THEN '🎉 MODULE RH OPÉRATIONNEL!'
        ELSE '⚠️ Finalisation en cours...'
    END as status_final;

-- ============================================================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- ============================================================================

SELECT '
🎉 COMPTES RH MYSPACE CRÉÉS:

📧 hr.admin@myspace.com
   → Rôle: hr_admin (Administrateur RH)
   → Permissions: Gestion complète du module RH
   → Accès: Interface admin + création employés

📧 hr.manager@myspace.com  
   → Rôle: hr_manager (Manager RH)
   → Permissions: Gestion équipes et rapports
   → Accès: Dashboards RH + gestion employés

🔗 ACCÈS MYSPACE:
   • Application: https://myspace.arcadis.tech
   • Admin Supabase: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw

🎯 PROCHAINES ÉTAPES:
   1. Tester la connexion avec ces comptes
   2. Explorer l''interface RH
   3. Ajouter vos premiers employés
   4. Configurer l''onboarding automatisé

🚀 MODULE RH MYSPACE OPÉRATIONNEL!
' as instructions_finales;

-- ============================================================================
-- 🎉 CRÉATION UTILISATEURS RH TERMINÉE
-- ============================================================================
