-- ===============================================================
-- CORRECTION URGENTE - ERREUR RLS RÉCURSION INFINIE
-- ===============================================================
-- Erreur: 'infinite recursion detected in policy for relation "employees"'
-- Solution: Désactiver et reconfigurer les politiques RLS
-- ===============================================================

-- 🚨 ÉTAPE 1: DÉSACTIVER TEMPORAIREMENT RLS
-- ===============================================================
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;  
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- 🧹 ÉTAPE 2: SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ===============================================================
-- Supprimer les politiques employees s'il y en a
DROP POLICY IF EXISTS "employees_policy" ON employees;
DROP POLICY IF EXISTS "employees_select_policy" ON employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON employees;
DROP POLICY IF EXISTS "employees_update_policy" ON employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON employees;
DROP POLICY IF EXISTS "Enable update for users based on email" ON employees;

-- Supprimer les politiques branches
DROP POLICY IF EXISTS "branches_policy" ON branches;
DROP POLICY IF EXISTS "Enable read access for all users" ON branches;

-- Supprimer les politiques departments  
DROP POLICY IF EXISTS "departments_policy" ON departments;
DROP POLICY IF EXISTS "Enable read access for all users" ON departments;

-- Supprimer les politiques positions
DROP POLICY IF EXISTS "positions_policy" ON positions;
DROP POLICY IF EXISTS "Enable read access for all users" ON positions;

-- 🔧 ÉTAPE 3: CRÉER DES POLITIQUES SIMPLES ET SÛRES
-- ===============================================================

-- Réactiver RLS avec des politiques simples
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY; 
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Politique SIMPLE pour employees (lecture pour tous les utilisateurs authentifiés)
CREATE POLICY "employees_read_authenticated" ON employees
    FOR SELECT 
    TO authenticated
    USING (true);

-- Politique SIMPLE pour employees (écriture pour les admins et RH seulement)
CREATE POLICY "employees_write_admin_hr" ON employees
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'hr_manager', 'hr_specialist')
        )
    );

-- Politiques SIMPLES pour les autres tables (lecture libre)
CREATE POLICY "branches_read_all" ON branches
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "departments_read_all" ON departments  
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "positions_read_all" ON positions
    FOR SELECT TO authenticated USING (true);

-- ✅ ÉTAPE 4: VÉRIFICATION
-- ===============================================================
-- Test simple pour vérifier que ça marche
SELECT 'TEST RLS' as test, COUNT(*) as total_employees 
FROM employees 
WHERE employee_number LIKE 'EMP%';

-- ===============================================================
-- 🎉 CORRECTION TERMINÉE !
-- ===============================================================
-- ✅ RLS configuré avec des politiques simples et non-récursives
-- ✅ Lecture autorisée pour tous les utilisateurs authentifiés  
-- ✅ Écriture limitée aux admins et RH
-- ✅ Plus de récursion infinie
--
-- PROCHAINES ÉTAPES :
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Recharger l'application frontend  
-- 3. Tester l'accès aux employés
-- 4. Si ça marche, laisser en l'état
-- 5. Si problème persiste, désactiver complètement RLS temporairement
-- ===============================================================
