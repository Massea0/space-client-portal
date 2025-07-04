// Script de débogage pour la création de facture
// Ce script simule les données qui seraient envoyées depuis le formulaire

const testInvoiceData = {
  companyId: "test-company-id",
  issueDate: "2025-06-27",
  dueDate: "2025-07-27",
  notes: "Test de facture",
  items: [
    {
      description: "Article test 1",
      quantity: 2,
      unitPrice: 1500,
      total: 3000
    },
    {
      description: "Article test 2", 
      quantity: 1,
      unitPrice: 2500,
      total: 2500
    }
  ]
};

console.log("=== TEST DE VALIDATION DES DONNÉES DE FACTURE ===");
console.log("Données d'entrée:", JSON.stringify(testInvoiceData, null, 2));

// Simulation de la fonction validateAndFormatInvoiceData
function simulateValidation(data) {
  console.log('\n🔍 Début de validation...');
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Au moins un article est requis pour créer une facture.');
  }

  let totalAmount = 0;
  const processedItems = data.items.map(item => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unitPrice)) || 0;
    
    console.log(`📝 Article: "${item.description}"`);
    console.log(`   - Quantité: ${quantity} (type: ${typeof item.quantity}, valeur originale: ${item.quantity})`);
    console.log(`   - Prix unitaire: ${unitPrice} (type: ${typeof item.unitPrice}, valeur originale: ${item.unitPrice})`);
    
    if (quantity <= 0) {
      throw new Error(`La quantité pour l'article "${item.description}" doit être supérieure à zéro.`);
    }
    
    if (unitPrice < 0) {
      throw new Error(`Le prix unitaire pour l'article "${item.description}" ne peut pas être négatif.`);
    }
    
    const itemTotal = quantity * unitPrice;
    totalAmount += itemTotal;
    
    console.log(`   - Total article: ${itemTotal}`);
    
    return {
      description: item.description.trim(),
      quantity: quantity,
      unitPrice: unitPrice,
    };
  });

  console.log(`💰 Montant total calculé: ${totalAmount}`);

  if (totalAmount <= 0) {
    throw new Error('Le montant total de la facture doit être supérieur à zéro.');
  }

  return {
    totalAmount,
    processedItems
  };
}

try {
  const result = simulateValidation(testInvoiceData);
  console.log("\n✅ VALIDATION RÉUSSIE");
  console.log("Résultat:", JSON.stringify(result, null, 2));
} catch (error) {
  console.log("\n❌ ERREUR DE VALIDATION");
  console.error("Erreur:", error.message);
}

// Test avec des valeurs problématiques
console.log("\n=== TEST AVEC VALEURS ZÉRO ===");
const testZeroData = {
  ...testInvoiceData,
  items: [
    {
      description: "Article avec prix zéro",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]
};

try {
  const result = simulateValidation(testZeroData);
  console.log("✅ Validation avec zéro réussie (ne devrait pas arriver)");
} catch (error) {
  console.log("❌ Erreur attendue avec prix zéro:", error.message);
}

// Test avec des valeurs string
console.log("\n=== TEST AVEC VALEURS STRING ===");
const testStringData = {
  ...testInvoiceData,
  items: [
    {
      description: "Article avec valeurs string",
      quantity: "2",
      unitPrice: "1500.50",
      total: "3001"
    }
  ]
};

try {
  const result = simulateValidation(testStringData);
  console.log("✅ Validation avec strings réussie");
  console.log("Résultat:", JSON.stringify(result, null, 2));
} catch (error) {
  console.log("❌ Erreur avec strings:", error.message);
}
