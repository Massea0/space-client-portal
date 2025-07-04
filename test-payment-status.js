// Test simple pour vérifier l'API payment-status depuis le navigateur
// Exécuter dans la console du navigateur de l'app

async function testPaymentStatus() {
    const SUPABASE_URL = "https://qlqgyrfqiflnqknbtycw.supabase.co";
    const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc";
    
    try {
        console.log('🧪 Test payment-status API...');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
                invoiceId: "33350dca-5512-44fa-82fb-3f2e47dfdad2",
                transactionId: "TIDWD0OX5TQY6G"
            })
        });
        
        console.log('📡 Statut HTTP:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur HTTP:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ Réponse API:', data);
        
        // Test de la condition du frontend
        if (data.status === 'paid') {
            console.log('✅ Le paiement est confirmé comme payé');
        } else {
            console.log('⚠️ Le paiement n\'est pas encore payé, statut:', data.status);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Lancer le test
testPaymentStatus();
