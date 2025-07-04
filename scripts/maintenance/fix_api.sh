#!/bin/bash

# Chemin du fichier source
SOURCE_FILE="/Users/a00/myspace/src/services/api.ts.original"
# Chemin du fichier temporaire
TMP_FILE="/Users/a00/myspace/src/services/api.ts.tmp"
# Chemin du fichier de destination
DEST_FILE="/Users/a00/myspace/src/services/api.ts"

# Vérifier si le fichier source existe
if [ ! -f "$SOURCE_FILE" ]; then
  echo "Le fichier source n'existe pas."
  exit 1
fi

# Copier le fichier source vers un fichier temporaire
cp "$SOURCE_FILE" "$TMP_FILE"

# Rechercher la ligne qui contient initiateDexchangePayment
LINE_NUM=$(grep -n "initiateDexchangePayment" "$TMP_FILE" | head -1 | cut -d':' -f1)

if [ -z "$LINE_NUM" ]; then
  echo "Fonction initiateDexchangePayment non trouvée."
  exit 1
fi

# Trouver la ligne de début de la fonction (ligne qui contient initiateDexchangePayment:)
START_LINE=$LINE_NUM

# Trouver la ligne de fin de la fonction (la ligne avec le premier }, après START_LINE)
END_LINE=$(tail -n +$START_LINE "$TMP_FILE" | grep -n "};" | head -1 | cut -d':' -f1)
END_LINE=$((START_LINE + END_LINE - 1))

# Créer un nouveau contenu pour la fonction
NEW_FUNCTION="    initiateDexchangePayment: async (invoiceId: string, paymentMethod: string, phoneNumber: string): Promise<{ paymentUrl?: string, transactionId: string, paymentCode?: string, paymentInstructions?: string }> => {
        const { data, error } = await supabase.functions.invoke('initiate-payment', {
            body: {
                invoice_id: invoiceId,
                payment_method: paymentMethod,
                phone_number: phoneNumber,
            },
        });
        
        if (error) throw new Error(error.message || \"Erreur lors de l'appel à la fonction de paiement\");
        if (data.error) throw new Error(data.error);
        
        // URL de paiement requise uniquement pour certaines méthodes (pas pour Orange Money)
        if (!data.paymentUrl && paymentMethod !== 'orange_money') {
            console.warn(\`[API] Aucune URL de paiement retournée pour la méthode \${paymentMethod}\`);
        }
        
        return { 
            paymentUrl: data.paymentUrl, 
            transactionId: data.transactionId,
            paymentCode: data.paymentCode || null,
            paymentInstructions: data.paymentInstructions || null
        };"

# Remplacer la fonction dans le fichier temporaire
head -n $((START_LINE - 1)) "$TMP_FILE" > "$DEST_FILE"
echo "$NEW_FUNCTION" >> "$DEST_FILE"
tail -n +$((END_LINE + 1)) "$TMP_FILE" >> "$DEST_FILE"

echo "Fonction remplacée avec succès."
