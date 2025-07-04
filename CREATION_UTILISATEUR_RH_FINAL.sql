-- ============================================================================
-- CRÉATION UTILISATEUR RH - VERSION FINALE CORRIGÉE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Créer les utilisateurs RH avec la structure exacte de users
-- Structure confirmée: id, first_name, last_name, email, role, company_id, phone, created_at, is_active, deleted_at
-- ============================================================================

-- ÉTAPE 1: Vérifier que la contrainte role a été corrigée
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'CHECK';

-- ÉTAPE 2: Obtenir les company_id disponibles
SELECT id, name, created_at 
FROM companies 
ORDER BY created_at 
LIMIT 3;

-- ÉTAPE 3: Créer l'utilisateur RH administrateur
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
) VALUES (
    gen_random_uuid(),
    'Administrateur',
    'RH',
    'hr.admin@myspace.com',
    'hr_admin',
    (SELECT id FROM companies ORDER BY created_at LIMIT 1),
    '+221 77 123 45 67',
    NOW(),
    true
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 4: Créer un manager RH
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
) VALUES (
    gen_random_uuid(),
    'Manager',
    'RH',
    'hr.manager@myspace.com',
    'hr_manager',
    (SELECT id FROM companies ORDER BY created_at LIMIT 1),
    '+221 77 123 45 68',
    NOW(),
    true
) RETURNING id, email, role, first_name, last_name, company_id;

-- ÉTAPE 5: Ajouter company_id à la table branches (si manquante)
DO $$
BEGIN
    -- Vérifier si la colonne company_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branches' AND column_name = 'company_id'
    ) THEN
        -- Ajouter la colonne
        ALTER TABLE branches ADD COLUMN company_id UUID;
        RAISE NOTICE 'Colonne company_id ajoutée à la table branches';
        
        -- Mettre à jour toutes les branches avec la première company
        UPDATE branches 
        SET company_id = (SELECT id FROM companies ORDER BY created_at LIMIT 1)
        WHERE company_id IS NULL;
        
        -- Ajouter la contrainte foreign key
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_company 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Contrainte foreign key ajoutée entre branches et companies';
    ELSE
        RAISE NOTICE 'Colonne company_id existe déjà dans branches';
    END IF;
END $$;

-- ÉTAPE 6: Vérifier les utilisateurs RH créés
SELECT 
    u.id,
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

-- ÉTAPE 7: Compter tous les utilisateurs par rôle
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM users
GROUP BY role
ORDER BY role;

-- ÉTAPE 8: Vérifier la liaison branches-companies
SELECT 
    b.id,
    b.name as branch_name,
    b.code,
    c.name as company_name,
    c.id as company_id
FROM branches b
LEFT JOIN companies c ON b.company_id = c.id
ORDER BY c.name, b.name;

-- ============================================================================
-- RÉSULTAT ATTENDU:
-- ✅ 2 utilisateurs RH créés avec UUID générés automatiquement
-- ✅ Colonne company_id ajoutée aux branches si nécessaire
-- ✅ Contrainte foreign key fonctionnelle
-- ✅ Toutes les liaisons tables correctes
-- ============================================================================
