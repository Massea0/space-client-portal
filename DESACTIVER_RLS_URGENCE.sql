-- ===============================================================
-- SOLUTION D'URGENCE - DÉSACTIVER COMPLÈTEMENT RLS  
-- ===============================================================
-- Si le script de correction RLS ne fonctionne pas,
-- cette solution désactive complètement RLS pour débloquer l'application
-- ===============================================================

-- Désactiver RLS sur toutes les tables RH
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;  
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- Test pour vérifier que ça marche
SELECT 'RLS DÉSACTIVÉ' as status, COUNT(*) as employees_count 
FROM employees;

-- ===============================================================
-- IMPORTANT: Cette solution est temporaire !
-- 
-- ✅ Avantages:
-- - Résout immédiatement le problème de récursion
-- - Permet de tester le module RH
-- - Simple et rapide
--
-- ⚠️ Inconvénients:
-- - Aucune sécurité au niveau des lignes
-- - Tous les utilisateurs voient toutes les données
-- - À reconfigurer plus tard en production
--
-- 📋 Prochaines étapes:
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Recharger l'application 
-- 3. Tester l'accès aux employés
-- 4. Une fois que ça marche, planifier la reconfiguration RLS
-- ===============================================================
