# 🚀 GUIDE D'EXÉCUTION - SCRIPTS SQL SUPABASE RH

## 📋 Vue d'ensemble

Ce guide vous explique comment utiliser les scripts SQL pour auditer et déployer le module RH avancé dans votre projet MySpace via l'interface web Supabase.

## 📁 Fichiers fournis

1. **`AUDIT_ET_PREPARATION_RH_SUPABASE.sql`** - Script d'audit complet
2. **`MIGRATION_RH_SECURISEE_SUPABASE.sql`** - Script de migration sécurisée
3. **`GUIDE_EXECUTION_SUPABASE.md`** - Ce guide

## 🔍 ÉTAPE 1: Audit préliminaire

### Objectif
Évaluer l'état actuel de votre base de données et déterminer si la migration RH est nécessaire.

### Instructions
1. **Connexion à Supabase**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet MySpace (`qlqgyrfqiflnqknbtycw`)

2. **Accès au SQL Editor**
   - Cliquez sur "SQL Editor" dans la barre latérale
   - Créez une nouvelle requête

3. **Exécution de l'audit**
   ```sql
   -- Copiez-collez le contenu complet de AUDIT_ET_PREPARATION_RH_SUPABASE.sql
   -- Exécutez le script en cliquant sur "Run"
   ```

4. **Analyse des résultats**
   
   **✅ Si vous voyez:**
   ```
   VERIFICATION TABLES RH | ✅ Table RH existante | branches
   VERIFICATION TABLES RH | ✅ Table RH existante | departments
   VERIFICATION TABLES RH | ✅ Table RH existante | positions
   VERIFICATION TABLES RH | ✅ Table RH existante | employees
   ```
   → **Les tables RH existent déjà. Passez à l'ÉTAPE 3 (Configuration).**

   **⚠️ Si vous voyez:**
   ```
   VERIFICATION TABLES RH | ❌ Table RH manquante | branches
   VERIFICATION TABLES RH | ❌ Table RH manquante | departments
   VERIFICATION TABLES RH | ❌ Table RH manquante | positions
   VERIFICATION TABLES RH | ❌ Table RH manquante | employees
   ```
   → **Les tables RH n'existent pas. Passez à l'ÉTAPE 2 (Migration).**

## 🚧 ÉTAPE 2: Migration RH (si nécessaire)

### ⚠️ Prérequis importantes
- [ ] L'audit a confirmé que les tables RH n'existent pas
- [ ] Vous avez au moins un utilisateur administrateur actif
- [ ] Vous avez sauvegardé votre base de données (recommandé)

### Instructions
1. **Nouvelle requête SQL**
   - Créez une nouvelle requête dans le SQL Editor
   - Donnez-lui un nom: "Migration RH - MySpace"

2. **Exécution de la migration**
   ```sql
   -- Copiez-collez le contenu complet de MIGRATION_RH_SECURISEE_SUPABASE.sql
   -- Exécutez le script en cliquant sur "Run"
   ```

3. **Vérification du succès**
   
   **✅ Message de succès attendu:**
   ```
   ✅ Migration RH terminée avec succès!
   📊 Statistiques:
      - Branches créées: 1
      - Départements créés: 3
      - Positions créées: 0
      - Employés créés: 0
   ```

4. **En cas d'erreur**
   - Vérifiez que vous n'avez pas de conflits de noms
   - Assurez-vous que votre utilisateur a les permissions nécessaires
   - Consultez les logs détaillés dans Supabase

## ⚙️ ÉTAPE 3: Configuration post-migration

### A. Création d'un utilisateur RH administrateur

```sql
-- Créer un utilisateur RH (remplacez les valeurs par les vôtres)
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    role,
    company_id,
    is_active
) VALUES (
    gen_random_uuid(),
    'Admin',
    'RH',
    'admin.rh@votre-domaine.com',  -- ⚠️ REMPLACEZ PAR VOTRE EMAIL
    'hr_manager',
    (SELECT id FROM companies LIMIT 1),
    true
)
ON CONFLICT (email) DO NOTHING;
```

### B. Mise à jour d'un utilisateur existant

```sql
-- Transformer un utilisateur existant en RH Manager
UPDATE users 
SET role = 'hr_manager' 
WHERE email = 'votre.email@example.com'  -- ⚠️ REMPLACEZ PAR VOTRE EMAIL
    AND is_active = true;
```

### C. Création de positions de base

```sql
-- Ajouter quelques positions d'exemple
INSERT INTO positions (title, code, department_id, branch_id, level, salary_min, salary_max)
SELECT 
    'Directeur Général',
    'DG001',
    d.id,
    b.id,
    5,
    5000000,
    8000000
FROM departments d
JOIN branches b ON b.id = d.branch_id
WHERE d.code = 'DG' AND b.code = 'HQ'
ON CONFLICT (department_id, code) DO NOTHING;

INSERT INTO positions (title, code, department_id, branch_id, level, salary_min, salary_max)
SELECT 
    'Responsable RH',
    'RH001',
    d.id,
    b.id,
    4,
    2000000,
    3500000
FROM departments d
JOIN branches b ON b.id = d.branch_id
WHERE d.code = 'RH' AND b.code = 'HQ'
ON CONFLICT (department_id, code) DO NOTHING;

INSERT INTO positions (title, code, department_id, branch_id, level, salary_min, salary_max)
SELECT 
    'Développeur Senior',
    'IT001',
    d.id,
    b.id,
    3,
    1500000,
    2500000
FROM departments d
JOIN branches b ON b.id = d.branch_id
WHERE d.code = 'IT' AND b.code = 'HQ'
ON CONFLICT (department_id, code) DO NOTHING;
```

## 🧪 ÉTAPE 4: Tests et validation

### A. Test de l'API RH depuis l'application
1. **Redémarrez votre serveur de développement**
   ```bash
   npm run dev
   ```

2. **Accédez aux pages RH**
   - `http://localhost:8082/hr/dashboard`
   - `http://localhost:8082/hr/departments`
   - `http://localhost:8082/hr/employees`

### B. Test des politiques RLS
```sql
-- Vérifier que les politiques RLS sont actives
SELECT 
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('branches', 'departments', 'positions', 'employees')
ORDER BY tablename, policyname;
```

### C. Test des relations et contraintes
```sql
-- Vérifier l'intégrité des données
SELECT 
    'Branches' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM branches
UNION ALL
SELECT 
    'Departments' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM departments
UNION ALL
SELECT 
    'Positions' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM positions
UNION ALL
SELECT 
    'Employees' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN employment_status = 'active' THEN 1 END) as active_count
FROM employees;
```

## 🔧 ÉTAPE 5: Configuration avancée (optionnelle)

### A. Ajout de branches supplémentaires
```sql
-- Exemple: Ajouter une filiale à Abidjan
INSERT INTO branches (name, code, country, city, level, status, parent_branch_id)
SELECT 
    'Filiale Abidjan',
    'ABJ',
    'CI',
    'Abidjan',
    2,
    'active',
    b.id
FROM branches b 
WHERE b.code = 'HQ'
ON CONFLICT (code) DO NOTHING;
```

### B. Configuration des permissions avancées
```sql
-- Politique pour les managers de département
CREATE POLICY "Department managers can view their department" ON public.employees
    FOR SELECT TO authenticated
    USING (
        department_id IN (
            SELECT id FROM departments 
            WHERE manager_id = auth.uid()
        )
    );
```

## 🚨 Résolution des problèmes courants

### Erreur: "Tables déjà existantes"
**Solution:** Les tables RH existent déjà. Utilisez uniquement le script d'audit pour vérifier l'état.

### Erreur: "Permission denied"
**Solutions:**
1. Vérifiez que vous êtes connecté en tant qu'administrateur
2. Utilisez le service role key si nécessaire
3. Vérifiez les politiques RLS

### Erreur: "Foreign key constraint"
**Solution:** Assurez-vous que les tables `users` et `companies` existent et contiennent des données.

### Interface RH ne s'affiche pas
**Solutions:**
1. Redémarrez le serveur de développement
2. Vérifiez que les routes RH sont correctement configurées
3. Vérifiez la console du navigateur pour les erreurs

## 📞 Support et ressources

### Documentation
- **Checklist d'intégration:** `docs/hr-integration/CHECKLIST-INTEGRATION-RH.md`
- **Rapport de session:** `docs/hr-integration/SESSION-RAPPORT-4-JUILLET-2025.md`
- **État Supabase:** `docs/SUPABASE_PROJECT_STATE.md`

### Logs et monitoring
- **Supabase Dashboard:** Logs des Edge Functions
- **Application:** Console du navigateur
- **Base de données:** Logs SQL dans Supabase

### Contacts
- **Interface Supabase:** [Dashboard MySpace](https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw)
- **Application:** [MySpace.arcadis.tech](https://myspace.arcadis.tech)

---

## ✅ Checklist finale

- [ ] Audit exécuté avec succès
- [ ] Migration appliquée (si nécessaire)
- [ ] Utilisateur RH créé/configuré
- [ ] Positions de base créées
- [ ] Tests de l'interface RH réussis
- [ ] Politiques RLS vérifiées
- [ ] Documentation mise à jour

**🎉 Félicitations! Votre module RH est maintenant opérationnel!**

---

*Guide créé le 4 juillet 2025 - Version 1.0*
