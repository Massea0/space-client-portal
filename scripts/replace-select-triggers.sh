#!/bin/bash
# Script pour remplacer SelectTrigger par SafeSelectTrigger dans toutes les pages admin

# Ajouter l'import SafeSelectTrigger dans les fichiers qui utilisent SelectTrigger
grep -l "SelectTrigger" src/pages/admin/*.tsx | xargs -I{} sed -i '' 's/import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '\''@\/components\/ui\/select'\'';/import { Select, SelectContent, SelectItem, SelectValue } from '\''@\/components\/ui\/select'\'';\nimport { SafeSelectTrigger } from '\''@\/components\/ui\/safe-triggers'\'';/g' {}

# Remplacer SelectTrigger par SafeSelectTrigger dans tous les fichiers admin
grep -l "SelectTrigger" src/pages/admin/*.tsx | xargs -I{} sed -i '' 's/<SelectTrigger/<SafeSelectTrigger/g' {}
grep -l "SelectTrigger" src/pages/admin/*.tsx | xargs -I{} sed -i '' 's/<\/SelectTrigger>/<\/SafeSelectTrigger>/g' {}

echo "Conversion de SelectTrigger vers SafeSelectTrigger terminée !"
