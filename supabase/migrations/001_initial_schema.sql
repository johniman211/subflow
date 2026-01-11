-- SubFlow: Subscription Management SaaS Platform
-- Database Schema for South Sudan & East Africa

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('merchant', 'admin');
CREATE TYPE currency AS ENUM ('SSP', 'USD');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'matched', 'confirmed', 'rejected', 'expired');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'past_due', 'expired', 'cancelled');
CREATE TYPE billing_cycle AS ENUM ('one_time', 'monthly', 'yearly');
CREATE TYPE product_type AS ENUM ('subscription', 'digital_product', 'one_time');

-- Users table (merchants and admins)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'merchant',
    phone TEXT,
    business_name TEXT,
    mtn_momo_number TEXT,
    bank_name_ssp TEXT,
    bank_account_number_ssp TEXT,
    bank_account_name_ssp TEXT,
    bank_name_usd TEXT,
    bank_account_number_usd TEXT,
    bank_account_name_usd TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    product_type product_type NOT NULL DEFAULT 'subscription',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prices/Plans table
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    currency currency NOT NULL DEFAULT 'SSP',
    billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
    trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
    grace_period_days INTEGER NOT NULL DEFAULT 3 CHECK (grace_period_days >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_id UUID NOT NULL REFERENCES prices(id) ON DELETE RESTRICT,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    reference_code TEXT NOT NULL UNIQUE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency currency NOT NULL DEFAULT 'SSP',
    payment_method payment_method NOT NULL DEFAULT 'mtn_momo',
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    proof_url TEXT,
    matched_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    price_id UUID NOT NULL REFERENCES prices(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    status subscription_status NOT NULL DEFAULT 'pending',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    secret_key_hash TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Deliveries table
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Access Logs table
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    customer_phone TEXT NOT NULL,
    access_granted BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Payments table (for Android SMS parser)
CREATE TABLE sms_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_sms TEXT NOT NULL,
    parsed_amount DECIMAL(15, 2),
    parsed_sender TEXT,
    parsed_reference TEXT,
    parsed_transaction_id TEXT,
    matched_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    is_processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_prices_is_active ON prices(is_active);
CREATE INDEX idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX idx_payments_reference_code ON payments(reference_code);
CREATE INDEX idx_payments_customer_phone ON payments(customer_phone);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_expires_at ON payments(expires_at);
CREATE INDEX idx_subscriptions_merchant_id ON subscriptions(merchant_id);
CREATE INDEX idx_subscriptions_customer_phone ON subscriptions(customer_phone);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_api_keys_merchant_id ON api_keys(merchant_id);
CREATE INDEX idx_api_keys_public_key ON api_keys(public_key);
CREATE INDEX idx_webhooks_merchant_id ON webhooks(merchant_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_access_logs_subscription_id ON access_logs(subscription_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_sms_payments_merchant_id ON sms_payments(merchant_id);
CREATE INDEX idx_sms_payments_is_processed ON sms_payments(is_processed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Products policies
CREATE POLICY "Merchants can view own products" ON products
    FOR SELECT USING (merchant_id = auth.uid());
CREATE POLICY "Merchants can insert own products" ON products
    FOR INSERT WITH CHECK (merchant_id = auth.uid());
CREATE POLICY "Merchants can update own products" ON products
    FOR UPDATE USING (merchant_id = auth.uid());
CREATE POLICY "Merchants can delete own products" ON products
    FOR DELETE USING (merchant_id = auth.uid());
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Prices policies
CREATE POLICY "Merchants can manage own prices" ON prices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM products WHERE id = prices.product_id AND merchant_id = auth.uid())
    );
CREATE POLICY "Public can view active prices" ON prices
    FOR SELECT USING (is_active = true);

-- Payments policies
CREATE POLICY "Merchants can view own payments" ON payments
    FOR SELECT USING (merchant_id = auth.uid());
CREATE POLICY "Merchants can update own payments" ON payments
    FOR UPDATE USING (merchant_id = auth.uid());
CREATE POLICY "Anyone can insert payments" ON payments
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Subscriptions policies
CREATE POLICY "Merchants can view own subscriptions" ON subscriptions
    FOR SELECT USING (merchant_id = auth.uid());
CREATE POLICY "Merchants can manage own subscriptions" ON subscriptions
    FOR ALL USING (merchant_id = auth.uid());

-- API Keys policies
CREATE POLICY "Merchants can manage own API keys" ON api_keys
    FOR ALL USING (merchant_id = auth.uid());

-- Webhooks policies
CREATE POLICY "Merchants can manage own webhooks" ON webhooks
    FOR ALL USING (merchant_id = auth.uid());

-- Webhook deliveries policies
CREATE POLICY "Merchants can view own webhook deliveries" ON webhook_deliveries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM webhooks WHERE id = webhook_deliveries.webhook_id AND merchant_id = auth.uid())
    );

-- Access logs policies
CREATE POLICY "Merchants can view own access logs" ON access_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM subscriptions WHERE id = access_logs.subscription_id AND merchant_id = auth.uid())
    );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- SMS payments policies
CREATE POLICY "Merchants can manage own SMS payments" ON sms_payments
    FOR ALL USING (merchant_id = auth.uid());
