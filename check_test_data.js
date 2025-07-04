// Vérification rapide des factures disponibles pour test
// À exécuter dans la console navigateur

async function checkTestData() {
  console.log('🔍 Vérification des données de test...');
  
  try {
    // Vérifier la session
    const { data: session } = await window.supabase.auth.getSession();
    if (!session?.session) {
      console.error('❌ Aucune session utilisateur');
      return;
    }
    
    console.log('✅ Utilisateur connecté:', session.session.user.email);
    
    // Récupérer les factures de l'utilisateur
    const { data: invoices, error } = await window.supabase
      .from('invoices')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur récupération factures:', error);
      return;
    }
    
    console.log('📋 Factures disponibles:', invoices);
    
    // Chercher une facture avec un statut payable
    const payableStatuses = ['sent', 'pending', 'late', 'overdue', 'partially_paid', 'pending_payment'];
    const payableInvoice = invoices.find(inv => payableStatuses.includes(inv.status));
    
    if (payableInvoice) {
      console.log('✅ Facture testable trouvée:', {
        id: payableInvoice.id,
        status: payableInvoice.status,
        amount: payableInvoice.amount,
        number: payableInvoice.number
      });
      
      // Stocker l'ID pour le test
      window.TEST_INVOICE_ID = payableInvoice.id;
      console.log('💾 ID stocké dans window.TEST_INVOICE_ID');
    } else {
      console.warn('⚠️ Aucune facture avec statut payable trouvée');
      console.log('📊 Statuts disponibles:', invoices.map(inv => inv.status));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkTestData();
