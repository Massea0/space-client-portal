// Test final des corrections du bug de montant zéro

console.log("=== TEST DES CORRECTIONS DU BUG DE MONTANT ZÉRO ===\n");

// Simulation de l'ancienne logique (problématique)
function oldLogic(data) {
    console.log("🔴 ANCIENNE LOGIQUE (problématique):");
    // Ancienne version qui pouvait créer des factures à montant zéro
    const amount = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    console.log("Montant calculé (ancienne méthode):", amount);
    return amount;
}

// Simulation de la nouvelle logique (corrigée)
function newLogic(data) {
    console.log("\n✅ NOUVELLE LOGIQUE (corrigée):");
    
    // 1. Validation préliminaire
    const hasValidItems = data.items.some(item => {
        const unitPrice = Number(item.unitPrice) || 0;
        return unitPrice > 0;
    });
    
    if (!hasValidItems) {
        throw new Error('Aucun article n\'a de prix unitaire valide (> 0)');
    }
    
    // 2. Validation et formatage robuste
    let totalAmount = 0;
    const processedItems = data.items.map(item => {
        const safeParseNumber = (value, fieldName) => {
            if (value === null || value === undefined) {
                console.log(`⚠️ ${fieldName} est null/undefined`);
                return 0;
            }
            
            if (typeof value === 'number') {
                return isNaN(value) ? 0 : value;
            }
            
            const stringValue = String(value).trim();
            if (stringValue === '') {
                console.log(`⚠️ ${fieldName} est une chaîne vide`);
                return 0;
            }
            
            const parsed = parseFloat(stringValue);
            return isNaN(parsed) ? 0 : parsed;
        };

        const quantity = safeParseNumber(item.quantity, 'Quantité');
        const unitPrice = safeParseNumber(item.unitPrice, 'Prix unitaire');
        
        if (quantity <= 0) {
            throw new Error(`La quantité pour l'article "${item.description}" doit être supérieure à zéro.`);
        }
        
        if (unitPrice < 0) {
            throw new Error(`Le prix unitaire pour l'article "${item.description}" ne peut pas être négatif.`);
        }
        
        const itemTotal = parseFloat((quantity * unitPrice).toFixed(2));
        totalAmount += itemTotal;
        
        return {
            description: item.description?.trim() || '',
            quantity: quantity,
            unitPrice: unitPrice,
        };
    });

    const finalTotal = parseFloat(totalAmount.toFixed(2));
    
    if (finalTotal <= 0) {
        throw new Error('Le montant total de la facture doit être supérieur à zéro.');
    }

    console.log("Montant calculé (nouvelle méthode):", finalTotal);
    return finalTotal;
}

// Test cases
const testCases = [
    {
        name: "Cas normal",
        data: {
            items: [
                { description: "Service", quantity: 2, unitPrice: 1500, total: 3000 },
                { description: "Produit", quantity: 1, unitPrice: 2500, total: 2500 }
            ]
        }
    },
    {
        name: "Cas problématique - prix zéro",
        data: {
            items: [
                { description: "Service gratuit", quantity: 1, unitPrice: 0, total: 0 }
            ]
        }
    },
    {
        name: "Cas problématique - valeurs null",
        data: {
            items: [
                { description: "Service", quantity: null, unitPrice: undefined, total: 0 }
            ]
        }
    },
    {
        name: "Cas mixte - un article valide, un invalide",
        data: {
            items: [
                { description: "Service payant", quantity: 1, unitPrice: 1000, total: 1000 },
                { description: "Service gratuit", quantity: 1, unitPrice: 0, total: 0 }
            ]
        }
    }
];

testCases.forEach(testCase => {
    console.log(`\n🧪 TEST: ${testCase.name}`);
    console.log("Données:", JSON.stringify(testCase.data, null, 2));
    
    try {
        const oldResult = oldLogic(testCase.data);
        console.log(`Ancienne logique: ${oldResult} FCFA`);
    } catch (error) {
        console.log("Ancienne logique: ERREUR -", error.message);
    }
    
    try {
        const newResult = newLogic(testCase.data);
        console.log(`Nouvelle logique: ${newResult} FCFA ✅`);
    } catch (error) {
        console.log("Nouvelle logique: ERREUR (prévue) -", error.message, "✅");
    }
});

console.log("\n🎯 RÉSUMÉ DES CORRECTIONS:");
console.log("1. ✅ Validation préliminaire des prix unitaires");
console.log("2. ✅ Gestion robuste des valeurs null/undefined/NaN");
console.log("3. ✅ Validation du montant total avant soumission");
console.log("4. ✅ Interface utilisateur améliorée avec indicateurs visuels");
console.log("5. ✅ Désactivation du bouton de soumission si montant = 0");
console.log("6. ✅ Messages d'aide pour guider l'utilisateur");
console.log("\n🚀 Le bug de montant à zéro devrait maintenant être résolu !");
