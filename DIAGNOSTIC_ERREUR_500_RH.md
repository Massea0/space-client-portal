# 🚨 DIAGNOSTIC ET SOLUTION - ERREUR 500 MODULE RH

## 📋 **Problème identifié**
- **Erreur 500** sur toutes les requêtes vers `/rest/v1/employees`
- **Cause probable**: Problème de structure de base de données ou permissions RLS
- **Impact**: Impossible d'afficher les employés dans l'interface

## 🔧 **Solutions appliquées**

### 1. **API simplifiée** ✅
- Créé `supabaseApiSimple.ts` avec requêtes de base
- Supprimé les jointures complexes qui causaient l'erreur
- Mapping simplifié sans colonnes problématiques

### 2. **Composant de test** ✅  
- Créé `EmployeeTestComponent` pour diagnostiquer
- Tests progressifs : requête basique → avec filtres
- Logs détaillés pour identifier le problème exact

### 3. **Routes de test** ✅
- `/test/employees` - Test API employés
- `/test/scroll` - Test barre navigation fixe

## 🧪 **Plan de diagnostic**

### **Étape 1 : Test des données**
```sql
-- Exécuter dans Supabase SQL Editor
SELECT COUNT(*) FROM employees WHERE employee_number LIKE 'EMP%';
```

### **Étape 2 : Test de l'API simple**
1. Aller sur `http://localhost:8081/test/employees`
2. Cliquer sur "Test Requête Basique"
3. Analyser les résultats dans la console

### **Étape 3 : Identifier la cause**

#### **Si Test Basique échoue** ❌
- **Problème**: Permissions RLS ou structure de table
- **Solution**: Désactiver RLS temporairement ou ajuster permissions

#### **Si Test Basique réussit** ✅ 
- **Problème**: Colonnes manquantes ou jointures
- **Solution**: Identifier les colonnes problématiques

## 🛠️ **Actions immédiates**

### **1. Exécuter le diagnostic SQL**
```sql
-- Dans Supabase SQL Editor
SELECT 
    employee_number,
    first_name,
    last_name,
    work_email
FROM employees 
WHERE employee_number LIKE 'EMP%';
```

### **2. Tester l'API simplifiée**
- Naviguer vers `/test/employees`
- Tester les deux boutons
- Noter les erreurs dans la console

### **3. Si problème de permissions**
```sql
-- Désactiver temporairement RLS
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
```

## 📱 **Corrections déjà appliquées**

### **Navigation mobile** ✅
- Barre de navigation maintenant **fixe** avec `sticky top-0 z-50`
- Plus de disparition lors du scroll

### **API robuste** ✅
- Gestion d'erreur améliorée
- Logs détaillés pour debugging
- Fallbacks pour colonnes manquantes

## 🎯 **Prochaines étapes**

1. **Exécuter** `TEST_SIMPLE_RH.sql` dans Supabase
2. **Tester** l'API via `/test/employees` 
3. **Analyser** les logs pour identifier la cause exacte
4. **Appliquer** la solution appropriée selon les résultats
5. **Réactiver** l'API complète une fois le problème résolu

## 📞 **Support**
Si les tests échouent toujours, partager :
- Screenshots des erreurs console
- Résultats du test SQL
- Messages d'erreur exacts de Supabase

---
**Status**: 🔄 En diagnostic - Solutions temporaires appliquées
