# 🚨 GUIDE COMPLET - RÉSOLUTION RÉCURSION RLS

## 📊 État Actuel
- **Problème identifié**: `infinite recursion detected in policy for relation "employees"`
- **Cause**: Politiques RLS mal configurées créant une boucle infinie
- **Impact**: Erreur 500 lors de l'accès aux données RH via l'API

## 🎯 Plan de Résolution

### 🔧 ÉTAPE 1: Correction RLS dans Supabase
```bash
# Exécuter le script PowerShell de guidage
.\EXECUTE_CORRECTION_RLS.ps1
```

**Action manuelle requise:**
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier/coller le contenu de `CORRECTION_URGENTE_RLS_RECURSION.sql`
4. Exécuter le script
5. Vérifier qu'il n'y a pas d'erreur

### 🧪 ÉTAPE 2: Validation côté Base
```sql
-- Exécuter dans Supabase SQL Editor
-- Copier le contenu de VERIFICATION_POST_CORRECTION_RLS.sql
```

**Résultats attendus:**
- ✅ RLS activé sur toutes les tables
- ✅ Politiques simples visibles (pas de récursion)
- ✅ Données lisibles sans erreur

### 🚀 ÉTAPE 3: Test côté Application
```bash
# Démarrer l'application
npm run dev

# Naviguer vers la page de test
http://localhost:3000/test/rls-validation
```

**Tests automatisés:**
- 🔌 Connexion Supabase
- 👥 Accès aux employés (critique)
- 📊 Structure des données

## 📁 Fichiers de Correction

### Scripts SQL
- `CORRECTION_URGENTE_RLS_RECURSION.sql` - Script principal de correction
- `VERIFICATION_POST_CORRECTION_RLS.sql` - Script de validation
- `DESACTIVER_RLS_URGENCE.sql` - Plan B si problème persiste

### Scripts PowerShell
- `EXECUTE_CORRECTION_RLS.ps1` - Guide d'exécution

### Composants de Test
- `RLSValidationComponent.tsx` - Interface de test React
- Route: `/test/rls-validation`

## 🔄 Processus de Test

### 1. Avant Correction
```
❌ Erreur: infinite recursion detected in policy
❌ API retourne 500
❌ Frontend ne peut pas charger les employés
```

### 2. Après Correction
```
✅ RLS configuré avec politiques simples
✅ API retourne données
✅ Frontend charge les employés
```

## 🛡️ Plan B - Désactivation Temporaire RLS

Si la correction échoue, désactiver temporairement RLS:

```sql
-- Exécuter DESACTIVER_RLS_URGENCE.sql
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
```

⚠️ **Attention**: Cette solution expose toutes les données. À utiliser uniquement en développement.

## 📋 Checklist de Validation

### Côté Supabase
- [ ] Script de correction exécuté sans erreur
- [ ] Test de lecture des employés réussi
- [ ] Politiques RLS visibles et non-récursives

### Côté Application
- [ ] Serveur démarre sans erreur
- [ ] Page `/test/rls-validation` accessible
- [ ] Test de connexion Supabase ✅
- [ ] Test d'accès employés ✅
- [ ] Test de structure données ✅

### Validation Fonctionnelle
- [ ] Page RH charge les employés
- [ ] Recherche fonctionne
- [ ] Pas d'erreur 500 dans la console

## 🎉 Résultat Attendu

Après cette correction:
1. **Module RH fonctionnel** - Plus d'erreur 500
2. **Données accessibles** - Employés, départements, etc.
3. **Sécurité maintenue** - RLS actif avec politiques simples
4. **Performance stable** - Plus de récursion infinie

## 📞 Prochaines Étapes

Une fois la correction validée:
1. Réactiver les fonctionnalités avancées (jointures, filtres)
2. Configurer des politiques RLS plus fines pour la production
3. Valider toute la checklist RH complète
4. Documenter la configuration finale

---

**🚀 Commencer par exécuter `.\EXECUTE_CORRECTION_RLS.ps1`**
