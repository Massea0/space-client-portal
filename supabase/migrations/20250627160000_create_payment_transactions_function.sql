-- Création de la table payment_transactions et de la fonction helper
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

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_transactions_select_policy" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_insert_policy" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_update_policy" ON public.payment_transactions;

CREATE POLICY "payment_transactions_select_policy" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "payment_transactions_insert_policy" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "payment_transactions_update_policy" ON public.payment_transactions
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON public.payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- Fonction helper pour les Edge Functions
CREATE OR REPLACE FUNCTION create_payment_transactions_table()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'payment_transactions table already exists';
END;
$$;
