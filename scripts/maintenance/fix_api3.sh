#!/bin/bash

# Création d'un fichier temporaire pour reconstruire api.ts
FILE="/Users/a00/myspace/src/services/api.ts"
TMP_FILE="${FILE}.fixed"

# Sauvegarde du fichier original
cp "$FILE" "${FILE}.orig"

# Extraire la partie avant la fonction corrompue
sed -n '1,/initiateDexchangePayment:/p' "$FILE" > "$TMP_FILE"

# Ajouter manuellement la fonction corrigée
cat >> "$TMP_FILE" << 'EOT'
    initiateDexchangePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ paymentUrl?: string, transactionId: string, paymentCode?: string, paymentInstructions?: string }> => {
        const { data, error } = await supabase.functions.invoke('initiate-payment', {
            body: {
                invoice_id: invoiceId,
                payment_method: paymentMethod,
                phone_number: phoneNumber,
            },
        });
        
        if (error) throw new Error(error.message || "Erreur lors de l'appel à la fonction de paiement");
        if (data.error) throw new Error(data.error);

        // URL de paiement requise uniquement pour certaines méthodes (pas pour Orange Money)
        if (!data.paymentUrl && paymentMethod !== 'orange_money') {
            console.warn(`[API] Aucune URL de paiement retournée pour la méthode ${paymentMethod}`);
        }

        return {
            paymentUrl: data.paymentUrl,
            transactionId: data.transactionId,
            paymentCode: data.paymentCode,
            paymentInstructions: data.paymentInstructions
        };
EOT

# Ajouter la partie après la fonction corrompue
grep -A 1000 "export const ticketsApi" "$FILE" >> "$TMP_FILE"

# Remplacer le fichier original par le fichier temporaire
mv "$TMP_FILE" "$FILE"

echo "Fichier api.ts réparé avec succès."
