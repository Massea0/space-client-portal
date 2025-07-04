#!/bin/bash

# Création d'un fichier temporaire pour reconstruire api.ts
FILE="/Users/a00/myspace/src/services/api.ts"
TMP_FILE="${FILE}.new"

# Sauvegarde du fichier original
cp "$FILE" "${FILE}.backup"

# Début du fichier
cat > "$TMP_FILE" << 'EOT'
// src/services/api.ts
import {supabase} from '@/lib/supabaseClient';
import {
    Devis,
    DevisItem,
    Invoice,
    InvoiceItem,
    Ticket,
    TicketMessage,
    Company,
    TicketCategory
} from '@/types';
import type {User as AuthUserType} from '@/types/auth';

// --- Définitions des types pour les données brutes de la base de données (snake_case) ---

interface DbCompany {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    created_at: string;
}
EOT

# Lire le reste du fichier à partir de la ligne 45 et ajouter au fichier temporaire
tail -n +45 "$FILE" >> "$TMP_FILE"

# Remplacer la fonction initiateDexchangePayment dans le fichier temporaire
sed -i '' 's/initiateDexchangePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ paymentUrl: string, transactionId: string }> => {/initiateDexchangePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ paymentUrl?: string, transactionId: string, paymentCode?: string, paymentInstructions?: string }> => {/' "$TMP_FILE"

# Remplacer le corps de la fonction pour gérer le cas Orange Money
awk '
/initiateDexchangePayment: async.*/ {
    print;
    getline;
    print;
    getline;
    print;
    getline;
    print;
    getline;
    print;
    getline;
    print;
    # Remplacer les lignes suivantes avec notre nouvelle logique
    printf "        if (error) throw new Error(error.message || \"Erreur lors de l'\''appel à la fonction de paiement\");\n";
    printf "        if (data.error) throw new Error(data.error);\n\n";
    printf "        // URL de paiement requise uniquement pour certaines méthodes (pas pour Orange Money)\n";
    printf "        if (!data.paymentUrl && paymentMethod !== '\''orange_money'\'') {\n";
    printf "            console.warn(`[API] Aucune URL de paiement retournée pour la méthode ${paymentMethod}`);\n";
    printf "        }\n\n";
    printf "        return {\n";
    printf "            paymentUrl: data.paymentUrl,\n";
    printf "            transactionId: data.transactionId,\n";
    printf "            paymentCode: data.paymentCode,\n";
    printf "            paymentInstructions: data.paymentInstructions\n";
    printf "        };\n";
    next;
}
{ print }
' "$TMP_FILE" > "${TMP_FILE}.tmp" && mv "${TMP_FILE}.tmp" "$TMP_FILE"

# Remplacer le fichier original par le fichier temporaire
mv "$TMP_FILE" "$FILE"

echo "Fichier api.ts réparé avec succès."
