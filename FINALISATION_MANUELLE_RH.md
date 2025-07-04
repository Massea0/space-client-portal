# 🚨 FINALISATION MANUELLE DU MODULE RH - PROCÉDURE D'URGENCE

**Date :** 4 juillet 2025  
**Situation :** Problèmes de structure détectés lors du déploiement  
**Action :** Finalisation manuelle par étapes courtes  

---

## ⚡ PROCÉDURE ACCÉLÉRÉE (15 minutes)

### **ÉTAPE 1 : Corriger la contrainte users.role**
```sql
-- Dans Supabase SQL Editor, exécuter ces 2 commandes séparément :

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- 2. Créer la nouvelle contrainte
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('client', 'admin', 'user', 'company_admin', 'manager', 'hr_admin', 'hr_manager', 'hr_employee', 'employee', 'supplier', 'super_admin'));
```

### **ÉTAPE 2 : Vérifier et ajouter company_id aux branches**
```sql
-- Vérifier si la colonne existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'branches' AND column_name = 'company_id';

-- Si elle n'existe pas, l'ajouter :
ALTER TABLE branches ADD COLUMN company_id UUID;

-- Lier toutes les branches à la première company
UPDATE branches SET company_id = (
    SELECT id FROM companies ORDER BY created_at LIMIT 1
) WHERE company_id IS NULL;

-- Ajouter la contrainte foreign key
ALTER TABLE branches ADD CONSTRAINT fk_branches_company 
FOREIGN KEY (company_id) REFERENCES companies(id);
```

### **ÉTAPE 3 : Créer les utilisateurs RH**
```sql
-- Obtenir une company_id valide
SELECT id, name FROM companies LIMIT 3;

-- Remplacer COMPANY_ID_ICI par un ID réel de la requête précédente
INSERT INTO users (email, role, first_name, last_name, company_id, created_at)
VALUES ('hr.admin@myspace.com', 'hr_admin', 'Admin', 'RH', 'COMPANY_ID_ICI', NOW());

INSERT INTO users (email, role, first_name, last_name, company_id, created_at)
VALUES ('hr.manager@myspace.com', 'hr_manager', 'Manager', 'RH', 'COMPANY_ID_ICI', NOW());
```

### **ÉTAPE 4 : Validation finale**
```sql
-- Compter les tables RH
SELECT COUNT(*) as tables_rh FROM information_schema.tables 
WHERE table_name IN ('branches', 'departments', 'positions', 'employees');

-- Compter les utilisateurs RH
SELECT COUNT(*) as users_rh FROM users WHERE role LIKE 'hr_%';

-- Vérifier la hiérarchie (si company_id existe)
SELECT c.name as company, COUNT(b.id) as branches_count
FROM companies c
LEFT JOIN branches b ON c.id = b.company_id
GROUP BY c.id, c.name;
```

---

## ✅ CRITÈRES DE SUCCÈS

- [ ] **Contrainte role** : Accepte 'hr_admin' et 'hr_manager'
- [ ] **Tables RH** : 4 tables créées (branches, departments, positions, employees)  
- [ ] **Utilisateurs RH** : 2 comptes créés et fonctionnels
- [ ] **Liaisons** : branches liées aux companies
- [ ] **Données test** : Structure hiérarchique cohérente

---

## 🎯 TEST FINAL

**Connexion interface :**
1. Se connecter avec hr.admin@myspace.com
2. Accéder aux pages RH de l'application
3. Vérifier l'affichage des départements et positions
4. Tester la création d'un nouvel employé

**Résultat attendu :** Interface RH opérationnelle avec données de test

---

## 🚨 EN CAS DE PROBLÈME

### Rollback rapide
```sql
-- Supprimer les tables RH (si nécessaire)
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- Restaurer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('client', 'admin'));
```

### Support
- Tous les scripts sont dans le dossier myspace/
- Documentation complète : `docs/SUPABASE_PROJECT_STATE.md`
- Logs d'erreur conservés pour diagnostic

---

**⏱️ Temps de résolution estimé :** 10-15 minutes  
**🎯 Objectif :** Module RH opérationnel pour démonstration**
