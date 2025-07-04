// Test de création de facture pour détecter le problème de montant zéro

// Ce script simule exactement ce qui se passe dans FactureForm.tsx
function simulateFormSubmission() {
    console.log('🚀 SIMULATION DE SOUMISSION DU FORMULAIRE');
    
    // Simulation des données comme elles arrivent du formulaire React Hook Form
    const formData = {
        companyId: "test-company-123",
        issueDate: new Date("2025-06-27"),
        dueDate: new Date("2025-07-27"),
        notes: "Test facture",
        items: [
            {
                id: "item-1",
                description: "Service de consultation",
                quantity: 2,      // Nombre
                unitPrice: 1500,  // Nombre
                total: 3000       // Calculé automatiquement
            },
            {
                id: "item-2", 
                description: "Formation",
                quantity: 1,      // Nombre
                unitPrice: 2500,  // Nombre
                total: 2500       // Calculé automatiquement
            }
        ]
    };

    console.log('🔍 Données brutes du formulaire:', JSON.stringify(formData, null, 2));
    
    // Recalculer les totaux pour s'assurer qu'ils sont à jour
    const itemsWithUpdatedTotals = formData.items.map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const total = parseFloat((quantity * unitPrice).toFixed(2));
        
        console.log(`📋 Item ${index + 1}:`, {
            description: item.description,
            quantity: {
                original: item.quantity,
                converted: quantity,
                type: typeof item.quantity
            },
            unitPrice: {
                original: item.unitPrice,
                converted: unitPrice,
                type: typeof item.unitPrice
            },
            total: {
                original: item.total,
                calculated: total
            }
        });
        
        return {
            description: item.description,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
        };
    });

    const totalGeneral = itemsWithUpdatedTotals.reduce((sum, item) => sum + item.total, 0);
    console.log('💰 Total général calculé:', totalGeneral);

    const submitData = {
        ...formData,
        issueDate: formData.issueDate.toISOString().split('T')[0],
        dueDate: formData.dueDate.toISOString().split('T')[0],
        items: itemsWithUpdatedTotals,
    };
    
    console.log('📤 Données finales envoyées à AdminFactures:', JSON.stringify(submitData, null, 2));
    
    return submitData;
}

// Test avec des valeurs qui pourraient causer des problèmes
function simulateProblematicData() {
    console.log('\n🚨 SIMULATION AVEC DONNÉES PROBLÉMATIQUES');
    
    const problematicData = {
        companyId: "test-company-123",
        issueDate: new Date("2025-06-27"),
        dueDate: new Date("2025-07-27"),
        notes: "Test facture problématique",
        items: [
            {
                id: "item-1",
                description: "Service avec prix zéro",
                quantity: 1,
                unitPrice: 0,  // Prix zéro !
                total: 0
            }
        ]
    };

    console.log('🔍 Données problématiques:', JSON.stringify(problematicData, null, 2));
    
    const itemsWithUpdatedTotals = problematicData.items.map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const total = parseFloat((quantity * unitPrice).toFixed(2));
        
        return {
            description: item.description,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
        };
    });

    const totalGeneral = itemsWithUpdatedTotals.reduce((sum, item) => sum + item.total, 0);
    console.log('💰 Total général avec données problématiques:', totalGeneral);
    
    return {
        ...problematicData,
        issueDate: problematicData.issueDate.toISOString().split('T')[0],
        dueDate: problematicData.dueDate.toISOString().split('T')[0],
        items: itemsWithUpdatedTotals,
    };
}

// Test avec des valeurs undefined/null
function simulateNullData() {
    console.log('\n🚨 SIMULATION AVEC VALEURS NULL/UNDEFINED');
    
    const nullData = {
        companyId: "test-company-123",
        issueDate: new Date("2025-06-27"),
        dueDate: new Date("2025-07-27"),
        notes: "Test facture avec null",
        items: [
            {
                id: "item-1",
                description: "Service avec valeurs null",
                quantity: null,      // Null !
                unitPrice: undefined, // Undefined !
                total: 0
            }
        ]
    };

    console.log('🔍 Données avec null/undefined:', JSON.stringify(nullData, null, 2));
    
    const itemsWithUpdatedTotals = nullData.items.map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const total = parseFloat((quantity * unitPrice).toFixed(2));
        
        console.log(`📋 Conversion null/undefined:`, {
            quantity: {
                original: item.quantity,
                converted: quantity,
                numberResult: Number(item.quantity),
                isNaN: isNaN(Number(item.quantity))
            },
            unitPrice: {
                original: item.unitPrice,
                converted: unitPrice,
                numberResult: Number(item.unitPrice),
                isNaN: isNaN(Number(item.unitPrice))
            }
        });
        
        return {
            description: item.description,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
        };
    });

    const totalGeneral = itemsWithUpdatedTotals.reduce((sum, item) => sum + item.total, 0);
    console.log('💰 Total général avec null/undefined:', totalGeneral);
    
    return totalGeneral;
}

// Exécution des tests
try {
    const normalData = simulateFormSubmission();
    console.log('\n✅ Test normal réussi');
    
    const problematicData = simulateProblematicData();
    console.log('\n⚠️ Test problématique terminé (montant zéro attendu)');
    
    const nullResult = simulateNullData();
    console.log('\n⚠️ Test null/undefined terminé, total:', nullResult);
    
} catch (error) {
    console.log('\n❌ Erreur lors des tests:', error.message);
}
