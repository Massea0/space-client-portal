# RÉFÉRENCE - Données Réelles de Test

**Date de création :** 28 juin 2025  
**Usage :** Tests, validation, et référence pour les edge functions et l'interface

## 📊 Table `devis` - Structure et Données Réelles

### Structure de la table `devis`
```sql
-- Colonnes confirmées dans la table devis
id                UUID PRIMARY KEY
number            VARCHAR (format: DEV-YYYY-XXXXX)
company_id        UUID (FK vers companies)
object            TEXT (description du devis)
amount            NUMERIC(10,2)
status            VARCHAR (draft|sent|approved|validated|rejected)
created_at        TIMESTAMP WITH TIME ZONE
valid_until       DATE
notes             TEXT
rejection_reason  TEXT
validated_at      TIMESTAMP WITH TIME ZONE
```

### Données de Test Réelles

| ID | Numéro | Entreprise | Description | Montant | Statut | Notes |
|---|---|---|---|---|---|---|
| `6fc33114-04a4-4dcf-baa1-0c6bec1653aa` | DEV-2025-32986 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | iuh | 0.00 | validated | (vide) |
| `7ef4e9eb-7763-4f73-babc-b5daa7d436b9` | DEV-2025-95139 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | csqdcx | 200.00 | validated | wcx s |
| `8cfa7843-39f9-4ce3-aef1-3b1eec02d74f` | DEV-2025-36826 | 9990ffd4-82d5-43b3-9229-0a86eb54ae24 | Création maquette demo pour appli mobile Dekando | 800000.00 | draft | (vide) |
| `c5690414-d9ab-40d7-b089-dde69f93126f` | DEV-2025-29571 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | kang | 1000000.00 | sent | koung |
| `d5fe6eb3-0235-45ef-a721-b1e3acf9b154` | DEV-2025-04892 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | qzfcds | 200.00 | approved | vdfvd |
| `e43db7e8-f831-4055-8a97-9734d67429ff` | DEV-2025-53688 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | Mettre en avant le rapport qualité-prix exceptionnel | 700000.00 | sent | Conditions de paiement adaptées à la taille de Ameth - indépendant |
| `fad8c362-2cd4-4970-bdde-e91ebe277e07` | DEV-2025-25148 | f05de628-9f20-4289-9ea9-fc56ce5d1e46 | test3 | 200.00 | sent | (vide) |

## 🎯 IDs de Test Recommandés

### Pour les tests d'optimisation IA :
- **Devis avec montant élevé :** `c5690414-d9ab-40d7-b089-dde69f93126f` (1M FCFA)
- **Devis avec montant moyen :** `8cfa7843-39f9-4ce3-aef1-3b1eec02d74f` (800K FCFA)
- **Devis avec description complète :** `e43db7e8-f831-4055-8a97-9734d67429ff` (700K FCFA)
- **Devis draft (modifiable) :** `8cfa7843-39f9-4ce3-aef1-3b1eec02d74f`
- **Devis sent (optimisable) :** `e43db7e8-f831-4055-8a97-9734d67429ff`

### Entreprises principales :
- **Entreprise A :** `f05de628-9f20-4289-9ea9-fc56ce5d1e46` (5 devis)
- **Entreprise B :** `9990ffd4-82d5-43b3-9229-0a86eb54ae24` (1 devis)

## 🧪 Scripts de Test

### Test de l'edge function avec un vrai devis :
```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE" \
  -H "Content-Type: application/json" \
  -d '{"quoteId": "e43db7e8-f831-4055-8a97-9734d67429ff"}' \
  "https://qlqgyrfqiflnqknbtycw.supabase.co/functions/v1/ai-quote-optimization"
```

### Requête pour récupérer les devis réels :
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE" \
  "https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/devis?select=id,number,amount,status&limit=5"
```

## 📋 Table `devis_items` - Structure

### Structure confirmée :
```sql
-- Colonnes dans devis_items
id              UUID PRIMARY KEY
devis_id        UUID (FK vers devis.id)
description     TEXT
quantity        INTEGER
unit_price      NUMERIC(10,2)  -- ⚠️ PAS "price" !
total          NUMERIC(10,2)
```

## ⚠️ Points d'Attention

1. **Colonne `unit_price`** dans `devis_items` (pas `price`)
2. **Pas de colonne `items`** dans la table `devis`
3. **Pas de colonne `industry`** dans la table `companies`
4. **IDs réels disponibles** pour les tests d'optimisation IA

## 🔧 Configuration des Tests

### Variables d'environnement :
- **SUPABASE_URL :** `https://qlqgyrfqiflnqknbtycw.supabase.co`
- **ANON_KEY :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### URL de production :
- **Application :** `https://myspace.arcadis.tech`

## 📝 Recommandations

1. **Utiliser les IDs réels** pour tous les tests d'optimisation IA
2. **Tester avec différents montants** (200, 700K, 800K, 1M FCFA)
3. **Vérifier les différents statuts** (draft, sent, approved, validated)
4. **Utiliser l'entreprise f05de628...** qui a le plus d'historique (5 devis)
