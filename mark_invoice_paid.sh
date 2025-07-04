#!/bin/bash

# Script pour marquer manuellement une facture comme payée
# Usage: ./mark_invoice_paid.sh <invoice_id>

INVOICE_ID=$1

if [ -z "$INVOICE_ID" ]; then
    echo "❌ Usage: $0 <invoice_id>"
    echo "Exemple: $0 01943c21-3cf7-77f8-8b04-7dd0ae1e9cf7"
    exit 1
fi

echo "🔄 Marquage de la facture $INVOICE_ID comme payée..."

# Utiliser psql pour se connecter directement à Supabase
# URL de connexion depuis le tableau de bord Supabase
DB_URL="postgresql://postgres.qlqgyrfqiflnqknbtycw:BG6KeDaUo8rM7MhY@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Mettre à jour la facture
psql "$DB_URL" -c "
UPDATE invoices 
SET 
    status = 'paid',
    paid_at = NOW(),
    dexchange_transaction_id = 'manual-' || extract(epoch from now())::bigint
WHERE id = '$INVOICE_ID'
RETURNING id, status, paid_at;
"

if [ $? -eq 0 ]; then
    echo "✅ Facture $INVOICE_ID marquée comme payée avec succès!"
else
    echo "❌ Erreur lors de la mise à jour de la facture"
fi
