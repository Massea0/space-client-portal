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

CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_transaction_id ON payment_transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
