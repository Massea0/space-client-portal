-- ============================================================================
-- CORRECTION LIAISON BRANCHES-COMPANIES
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Ajouter la liaison manquante entre branches et companies
-- Problème: La table branches n'a pas de company_id
-- ============================================================================

-- ÉTAPE 1: Vérifier la structure actuelle de la table branches
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'branches'
ORDER BY ordinal_position;

-- ÉTAPE 2: Ajouter la colonne company_id si elle n'existe pas
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- ÉTAPE 3: Mettre à jour les branches existantes avec une company_id
-- Assigner toutes les branches à la première company disponible
UPDATE public.branches 
SET company_id = (SELECT id FROM companies ORDER BY created_at LIMIT 1)
WHERE company_id IS NULL;

-- ÉTAPE 4: Rendre la contrainte obligatoire
ALTER TABLE public.branches 
ALTER COLUMN company_id SET NOT NULL;

-- ÉTAPE 5: Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_branches_company ON public.branches(company_id);

-- ÉTAPE 6: Vérifier la liaison
SELECT 
    b.id,
    b.name as branch_name,
    b.code,
    c.id as company_id,
    c.name as company_name
FROM branches b
LEFT JOIN companies c ON b.company_id = c.id
ORDER BY c.name, b.name;

-- ÉTAPE 7: Vérifier les contraintes foreign key
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'branches'
ORDER BY tc.constraint_name;

-- ============================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Colonne company_id ajoutée à la table branches
-- ✅ Toutes les branches liées à une company existante
-- ✅ Contrainte foreign key fonctionnelle
-- ✅ Index de performance créé
-- ============================================================================
