-- Additional Features for SubFlow
-- Coupons, Customers, Invoices, Referrals

-- Coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(15, 2) NOT NULL CHECK (discount_value > 0),
    currency currency DEFAULT 'SSP',
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    min_amount DECIMAL(15, 2) DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    applies_to_products UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, code)
);

-- Coupon redemptions
CREATE TABLE coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    customer_phone TEXT NOT NULL,
    discount_applied DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers table (aggregated customer data)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    email TEXT,
    name TEXT,
    notes TEXT,
    tags TEXT[],
    total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_count INTEGER NOT NULL DEFAULT 0,
    first_payment_at TIMESTAMPTZ,
    last_payment_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, phone)
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(15, 2) NOT NULL,
    discount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    currency currency NOT NULL DEFAULT 'SSP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, invoice_number)
);

-- Referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referrer_phone TEXT NOT NULL,
    referrer_name TEXT,
    referral_code TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('percentage', 'fixed', 'free_month')),
    reward_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    referral_count INTEGER NOT NULL DEFAULT 0,
    total_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, referral_code)
);

-- Referral conversions
CREATE TABLE referral_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    referred_phone TEXT NOT NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    reward_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification logs
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'whatsapp', 'push')),
    recipient TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    provider TEXT,
    provider_message_id TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_coupons_merchant_id ON coupons(merchant_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_invoices_merchant_id ON invoices(merchant_id);
CREATE INDEX idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX idx_referrals_merchant_id ON referrals(merchant_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_notification_logs_merchant_id ON notification_logs(merchant_id);

-- Apply updated_at triggers
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage own coupons" ON coupons
    FOR ALL USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can view own coupon redemptions" ON coupon_redemptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM coupons WHERE id = coupon_redemptions.coupon_id AND merchant_id = auth.uid())
    );

CREATE POLICY "Merchants can manage own customers" ON customers
    FOR ALL USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can manage own invoices" ON invoices
    FOR ALL USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can manage own referrals" ON referrals
    FOR ALL USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can view own referral conversions" ON referral_conversions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM referrals WHERE id = referral_conversions.referral_id AND merchant_id = auth.uid())
    );

CREATE POLICY "Merchants can view own notification logs" ON notification_logs
    FOR SELECT USING (merchant_id = auth.uid());

-- Function to apply coupon
CREATE OR REPLACE FUNCTION apply_coupon(
    p_coupon_code TEXT,
    p_merchant_id UUID,
    p_amount DECIMAL,
    p_product_id UUID DEFAULT NULL
)
RETURNS TABLE (
    valid BOOLEAN,
    discount_amount DECIMAL,
    final_amount DECIMAL,
    coupon_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_coupon coupons;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon 
    FROM coupons 
    WHERE code = UPPER(p_coupon_code) 
      AND merchant_id = p_merchant_id
      AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check validity period
    IF v_coupon.valid_from > NOW() THEN
        RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 'Coupon not yet valid'::TEXT;
        RETURN;
    END IF;
    
    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 'Coupon has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check max uses
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
        RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 'Coupon usage limit reached'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum amount
    IF p_amount < v_coupon.min_amount THEN
        RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 
            ('Minimum amount of ' || v_coupon.min_amount || ' required')::TEXT;
        RETURN;
    END IF;
    
    -- Check product restriction
    IF v_coupon.applies_to_products IS NOT NULL AND array_length(v_coupon.applies_to_products, 1) > 0 THEN
        IF p_product_id IS NULL OR NOT (p_product_id = ANY(v_coupon.applies_to_products)) THEN
            RETURN QUERY SELECT false, 0::DECIMAL, p_amount, NULL::UUID, 'Coupon not valid for this product'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        RETURN QUERY SELECT 
            true,
            ROUND(p_amount * v_coupon.discount_value / 100, 2),
            ROUND(p_amount - (p_amount * v_coupon.discount_value / 100), 2),
            v_coupon.id,
            NULL::TEXT;
    ELSE
        RETURN QUERY SELECT 
            true,
            LEAST(v_coupon.discount_value, p_amount),
            GREATEST(p_amount - v_coupon.discount_value, 0),
            v_coupon.id,
            NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem coupon (after payment)
CREATE OR REPLACE FUNCTION redeem_coupon(
    p_coupon_id UUID,
    p_payment_id UUID,
    p_customer_phone TEXT,
    p_discount_applied DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Insert redemption record
    INSERT INTO coupon_redemptions (coupon_id, payment_id, customer_phone, discount_applied)
    VALUES (p_coupon_id, p_payment_id, p_customer_phone, p_discount_applied);
    
    -- Update coupon usage count
    UPDATE coupons SET current_uses = current_uses + 1, updated_at = NOW()
    WHERE id = p_coupon_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert customer
CREATE OR REPLACE FUNCTION upsert_customer(
    p_merchant_id UUID,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_name TEXT DEFAULT NULL,
    p_amount DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    INSERT INTO customers (merchant_id, phone, email, name, total_spent, payment_count, first_payment_at, last_payment_at)
    VALUES (p_merchant_id, p_phone, p_email, p_name, p_amount, 1, NOW(), NOW())
    ON CONFLICT (merchant_id, phone) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, customers.email),
        name = COALESCE(EXCLUDED.name, customers.name),
        total_spent = customers.total_spent + p_amount,
        payment_count = customers.payment_count + 1,
        last_payment_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO v_customer_id;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_merchant_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_count INTEGER;
    v_prefix TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO v_count FROM invoices WHERE merchant_id = p_merchant_id;
    v_prefix := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-';
    RETURN v_prefix || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Add cancelled_reason to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;

-- Add coupon_id and discount to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS original_amount DECIMAL(15, 2);

-- Add referral_code to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS referral_code TEXT;
