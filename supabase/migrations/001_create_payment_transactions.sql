-- Migration pour créer la table payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL,
    user_id UUID NOT NULL,
    external_transaction_id TEXT,
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'initiated',
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    phone_number TEXT,
    payment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_transaction_id ON payment_transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Politique RLS (Row Level Security)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de voir leurs propres transactions
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres transactions
CREATE POLICY "Users can create their own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres transactions
CREATE POLICY "Users can update their own payment transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour le service role (accès complet)
CREATE POLICY "Service role has full access to payment transactions" ON payment_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
