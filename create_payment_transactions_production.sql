-- Script pour créer la table payment_transactions sur la base de production
-- À exécuter via: https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/sql/new

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    external_transaction_id TEXT,
    invoice_id UUID NOT NULL,
    user_id UUID NOT NULL,
    payment_method TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'XOF' NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    phone_number TEXT,
    payment_url TEXT,
    payment_code TEXT,
    payment_instructions TEXT,
    expires_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON public.payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_transaction_id ON public.payment_transactions(external_transaction_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres transactions
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" ON public.payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment transactions" ON public.payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les Edge Functions (service role)
CREATE POLICY "Service role can manage all payment transactions" ON public.payment_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Message de confirmation
SELECT 'Table payment_transactions créée avec succès!' as message;
