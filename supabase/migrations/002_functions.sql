-- SubFlow: Database Functions and Stored Procedures

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'merchant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique reference code
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'SF-';
    i INTEGER;
BEGIN
    -- Add timestamp component (base36)
    result := result || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT));
    result := result || '-';
    
    -- Add random component
    FOR i IN 1..6 LOOP
        result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to match payment with reference code
CREATE OR REPLACE FUNCTION match_payment(
    p_reference_code TEXT,
    p_amount DECIMAL,
    p_transaction_id TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
    payment_id UUID,
    match_score INTEGER,
    match_details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS payment_id,
        (
            CASE WHEN p.reference_code = p_reference_code THEN 40 ELSE 0 END +
            CASE WHEN p.amount = p_amount THEN 30 ELSE 0 END +
            CASE WHEN p_phone IS NOT NULL AND p.customer_phone = p_phone THEN 20 ELSE 0 END +
            CASE WHEN p_transaction_id IS NOT NULL AND p.transaction_id = p_transaction_id THEN 10 ELSE 0 END
        )::INTEGER AS match_score,
        jsonb_build_object(
            'reference_match', p.reference_code = p_reference_code,
            'amount_match', p.amount = p_amount,
            'phone_match', p_phone IS NOT NULL AND p.customer_phone = p_phone,
            'transaction_match', p_transaction_id IS NOT NULL AND p.transaction_id = p_transaction_id
        ) AS match_details
    FROM payments p
    WHERE p.status = 'pending'
        AND p.expires_at > NOW()
        AND (
            p.reference_code = p_reference_code
            OR (p.amount = p_amount AND p_phone IS NOT NULL AND p.customer_phone = p_phone)
        )
    ORDER BY match_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm payment and activate subscription
CREATE OR REPLACE FUNCTION confirm_payment(
    p_payment_id UUID,
    p_confirmed_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_payment payments;
    v_subscription_id UUID;
BEGIN
    -- Get payment details
    SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;
    
    IF v_payment.status != 'pending' AND v_payment.status != 'matched' THEN
        RAISE EXCEPTION 'Payment cannot be confirmed in current status: %', v_payment.status;
    END IF;
    
    -- Update payment status
    UPDATE payments SET
        status = 'confirmed',
        confirmed_at = NOW(),
        confirmed_by = p_confirmed_by,
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Use subscription engine to create/renew subscription
    v_subscription_id := create_subscription_from_payment(p_payment_id);
    
    -- Log the action
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (
        p_confirmed_by,
        'payment_confirmed',
        'payment',
        p_payment_id::TEXT,
        jsonb_build_object(
            'subscription_id', v_subscription_id,
            'period_start', v_period_start,
            'period_end', v_period_end
        )
    );
    
    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription access
CREATE OR REPLACE FUNCTION check_subscription_access(
    p_product_id UUID,
    p_customer_phone TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    has_access BOOLEAN,
    subscription_id UUID,
    subscription_status subscription_status,
    expires_at TIMESTAMPTZ
) AS $$
DECLARE
    v_subscription_id UUID;
    v_subscription_status subscription_status;
    v_current_period_end TIMESTAMPTZ;
    v_grace_period INTEGER;
    v_access_granted BOOLEAN;
BEGIN
    -- Find active subscription
    SELECT s.id, s.status, s.current_period_end, p.grace_period_days 
    INTO v_subscription_id, v_subscription_status, v_current_period_end, v_grace_period
    FROM subscriptions s
    JOIN prices p ON s.price_id = p.id
    WHERE s.product_id = p_product_id
        AND s.customer_phone = p_customer_phone
        AND s.status IN ('active', 'past_due')
    ORDER BY s.current_period_end DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Log access attempt
        INSERT INTO access_logs (subscription_id, customer_phone, access_granted, ip_address, user_agent)
        SELECT id, p_customer_phone, false, p_ip_address, p_user_agent
        FROM subscriptions
        WHERE product_id = p_product_id AND customer_phone = p_customer_phone
        LIMIT 1;
        
        RETURN QUERY SELECT false, NULL::UUID, NULL::subscription_status, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;
    
    -- Check if within grace period
    v_access_granted := v_current_period_end + (COALESCE(v_grace_period, 0) || ' days')::INTERVAL >= NOW();
    
    -- Log access
    INSERT INTO access_logs (subscription_id, customer_phone, access_granted, ip_address, user_agent)
    VALUES (v_subscription_id, p_customer_phone, v_access_granted, p_ip_address, p_user_agent);
    
    RETURN QUERY SELECT 
        v_access_granted,
        v_subscription_id,
        v_subscription_status,
        v_current_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old payments
CREATE OR REPLACE FUNCTION expire_old_payments()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE payments
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending'
        AND expires_at < NOW();
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update subscription statuses
CREATE OR REPLACE FUNCTION update_subscription_statuses()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Mark subscriptions as past_due
    UPDATE subscriptions s
    SET status = 'past_due', updated_at = NOW()
    FROM prices p
    WHERE s.price_id = p.id
        AND s.status = 'active'
        AND s.current_period_end < NOW()
        AND s.current_period_end + (p.grace_period_days || ' days')::INTERVAL >= NOW();
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    affected_count := affected_count + temp_count;
    
    -- Mark subscriptions as expired
    UPDATE subscriptions s
    SET status = 'expired', updated_at = NOW()
    FROM prices p
    WHERE s.price_id = p.id
        AND s.status IN ('active', 'past_due')
        AND s.current_period_end + (p.grace_period_days || ' days')::INTERVAL < NOW();
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    affected_count := affected_count + temp_count;
    
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get merchant analytics
CREATE OR REPLACE FUNCTION get_merchant_analytics(
    p_merchant_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_payments INTEGER,
    confirmed_payments INTEGER,
    pending_payments INTEGER,
    active_subscriptions INTEGER,
    total_customers INTEGER,
    new_customers INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN pay.status = 'confirmed' THEN pay.amount ELSE 0 END), 0) AS total_revenue,
        COUNT(pay.id)::INTEGER AS total_payments,
        COUNT(CASE WHEN pay.status = 'confirmed' THEN 1 END)::INTEGER AS confirmed_payments,
        COUNT(CASE WHEN pay.status = 'pending' THEN 1 END)::INTEGER AS pending_payments,
        (SELECT COUNT(*)::INTEGER FROM subscriptions WHERE merchant_id = p_merchant_id AND status = 'active') AS active_subscriptions,
        (SELECT COUNT(DISTINCT customer_phone)::INTEGER FROM subscriptions WHERE merchant_id = p_merchant_id) AS total_customers,
        (SELECT COUNT(DISTINCT customer_phone)::INTEGER FROM subscriptions WHERE merchant_id = p_merchant_id AND created_at >= p_start_date) AS new_customers
    FROM payments pay
    WHERE pay.merchant_id = p_merchant_id
        AND pay.created_at >= p_start_date
        AND pay.created_at <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_merchants INTEGER,
    active_merchants INTEGER,
    total_revenue DECIMAL,
    total_payments INTEGER,
    total_subscriptions INTEGER,
    active_subscriptions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'merchant') AS total_merchants,
        (SELECT COUNT(DISTINCT merchant_id)::INTEGER FROM payments WHERE created_at >= p_start_date) AS active_merchants,
        COALESCE(SUM(CASE WHEN pay.status = 'confirmed' THEN pay.amount ELSE 0 END), 0) AS total_revenue,
        COUNT(pay.id)::INTEGER AS total_payments,
        (SELECT COUNT(*)::INTEGER FROM subscriptions) AS total_subscriptions,
        (SELECT COUNT(*)::INTEGER FROM subscriptions WHERE status = 'active') AS active_subscriptions
    FROM payments pay
    WHERE pay.created_at >= p_start_date
        AND pay.created_at <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUBSCRIPTION ENGINE - Core Subscription Management
-- =====================================================

-- Function to create subscription after payment confirmation
CREATE OR REPLACE FUNCTION create_subscription_from_payment(
    p_payment_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_payment RECORD;
    v_price RECORD;
    v_product RECORD;
    v_subscription_id UUID;
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
    v_trial_end TIMESTAMPTZ;
BEGIN
    -- Get payment details
    SELECT * INTO v_payment FROM payments WHERE id = p_payment_id AND status = 'confirmed';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or not confirmed';
    END IF;
    
    -- Get price details
    SELECT * INTO v_price FROM prices WHERE id = v_payment.price_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Price not found';
    END IF;
    
    -- Get product details
    SELECT * INTO v_product FROM products WHERE id = v_price.product_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
    END IF;
    
    -- Set period start
    v_period_start := NOW();
    
    -- Handle trial period
    IF v_price.trial_days > 0 THEN
        v_trial_end := v_period_start + (v_price.trial_days || ' days')::INTERVAL;
        v_period_end := v_trial_end;
    ELSE
        v_trial_end := NULL;
        -- Calculate period end based on billing cycle
        CASE v_price.billing_cycle
            WHEN 'monthly' THEN
                v_period_end := v_period_start + INTERVAL '1 month';
            WHEN 'yearly' THEN
                v_period_end := v_period_start + INTERVAL '1 year';
            WHEN 'one_time' THEN
                v_period_end := v_period_start + INTERVAL '100 years'; -- Lifetime
        END CASE;
    END IF;
    
    -- Check for existing subscription to update (renewal)
    SELECT id INTO v_subscription_id 
    FROM subscriptions 
    WHERE customer_phone = v_payment.customer_phone 
        AND product_id = v_product.id
        AND status IN ('active', 'past_due', 'expired')
    ORDER BY current_period_end DESC
    LIMIT 1;
    
    IF v_subscription_id IS NOT NULL THEN
        -- Renewal: extend existing subscription
        UPDATE subscriptions SET
            price_id = v_price.id,
            payment_id = p_payment_id,
            status = 'active',
            current_period_start = v_period_start,
            current_period_end = v_period_end,
            trial_end = v_trial_end,
            updated_at = NOW()
        WHERE id = v_subscription_id;
    ELSE
        -- New subscription
        INSERT INTO subscriptions (
            merchant_id,
            product_id,
            price_id,
            payment_id,
            customer_phone,
            customer_email,
            status,
            current_period_start,
            current_period_end,
            trial_end
        ) VALUES (
            v_payment.merchant_id,
            v_product.id,
            v_price.id,
            p_payment_id,
            v_payment.customer_phone,
            v_payment.customer_email,
            'active',
            v_period_start,
            v_period_end,
            v_trial_end
        ) RETURNING id INTO v_subscription_id;
    END IF;
    
    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(
    p_subscription_id UUID
)
RETURNS subscription_status AS $$
DECLARE
    v_subscription RECORD;
    v_price RECORD;
    v_new_status subscription_status;
    v_grace_end TIMESTAMPTZ;
BEGIN
    -- Get subscription
    SELECT * INTO v_subscription FROM subscriptions WHERE id = p_subscription_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found';
    END IF;
    
    -- Get price for grace period
    SELECT * INTO v_price FROM prices WHERE id = v_subscription.price_id;
    
    -- Calculate grace period end
    v_grace_end := v_subscription.current_period_end + (COALESCE(v_price.grace_period_days, 0) || ' days')::INTERVAL;
    
    -- Determine status
    IF v_subscription.cancelled_at IS NOT NULL THEN
        v_new_status := 'cancelled';
    ELSIF v_subscription.current_period_end > NOW() THEN
        v_new_status := 'active';
    ELSIF v_grace_end > NOW() THEN
        v_new_status := 'past_due';
    ELSE
        v_new_status := 'expired';
    END IF;
    
    -- Update if status changed
    IF v_subscription.status != v_new_status THEN
        UPDATE subscriptions SET 
            status = v_new_status,
            updated_at = NOW()
        WHERE id = p_subscription_id;
    END IF;
    
    RETURN v_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process all subscriptions (called by cron)
CREATE OR REPLACE FUNCTION process_subscription_statuses()
RETURNS TABLE (
    processed INTEGER,
    expired INTEGER,
    past_due INTEGER,
    expiring_soon INTEGER
) AS $$
DECLARE
    v_processed INTEGER := 0;
    v_expired INTEGER := 0;
    v_past_due INTEGER := 0;
    v_expiring_soon INTEGER := 0;
    v_sub RECORD;
    v_new_status subscription_status;
BEGIN
    -- Process all non-cancelled subscriptions
    FOR v_sub IN 
        SELECT s.*, p.grace_period_days, p.billing_cycle
        FROM subscriptions s
        JOIN prices p ON s.price_id = p.id
        WHERE s.status NOT IN ('cancelled', 'expired')
    LOOP
        v_new_status := check_subscription_status(v_sub.id);
        v_processed := v_processed + 1;
        
        IF v_new_status = 'expired' THEN
            v_expired := v_expired + 1;
        ELSIF v_new_status = 'past_due' THEN
            v_past_due := v_past_due + 1;
        END IF;
        
        -- Check if expiring in 3 days
        IF v_sub.current_period_end BETWEEN NOW() AND NOW() + INTERVAL '3 days' 
           AND v_new_status = 'active' THEN
            v_expiring_soon := v_expiring_soon + 1;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT v_processed, v_expired, v_past_due, v_expiring_soon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscriptions needing renewal reminder
CREATE OR REPLACE FUNCTION get_expiring_subscriptions(
    p_days_ahead INTEGER DEFAULT 3
)
RETURNS TABLE (
    subscription_id UUID,
    merchant_id UUID,
    product_id UUID,
    product_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    current_period_end TIMESTAMPTZ,
    amount DECIMAL,
    currency currency,
    billing_cycle billing_cycle
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS subscription_id,
        s.merchant_id,
        s.product_id,
        prod.name AS product_name,
        s.customer_phone,
        s.customer_email,
        s.current_period_end,
        pr.amount,
        pr.currency,
        pr.billing_cycle
    FROM subscriptions s
    JOIN products prod ON s.product_id = prod.id
    JOIN prices pr ON s.price_id = pr.id
    WHERE s.status = 'active'
        AND s.current_period_end BETWEEN NOW() AND NOW() + (p_days_ahead || ' days')::INTERVAL
        AND pr.billing_cycle != 'one_time';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expired subscriptions needing follow-up
CREATE OR REPLACE FUNCTION get_expired_subscriptions()
RETURNS TABLE (
    subscription_id UUID,
    merchant_id UUID,
    product_id UUID,
    product_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    expired_at TIMESTAMPTZ,
    days_expired INTEGER,
    amount DECIMAL,
    currency currency
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS subscription_id,
        s.merchant_id,
        s.product_id,
        prod.name AS product_name,
        s.customer_phone,
        s.customer_email,
        s.current_period_end AS expired_at,
        EXTRACT(DAY FROM NOW() - s.current_period_end)::INTEGER AS days_expired,
        pr.amount,
        pr.currency
    FROM subscriptions s
    JOIN products prod ON s.product_id = prod.id
    JOIN prices pr ON s.price_id = pr.id
    WHERE s.status IN ('past_due', 'expired')
        AND pr.billing_cycle != 'one_time';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create renewal payment for subscription
CREATE OR REPLACE FUNCTION create_renewal_payment(
    p_subscription_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_subscription RECORD;
    v_price RECORD;
    v_payment_id UUID;
    v_reference_code TEXT;
BEGIN
    -- Get subscription
    SELECT * INTO v_subscription FROM subscriptions WHERE id = p_subscription_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found';
    END IF;
    
    -- Get price
    SELECT * INTO v_price FROM prices WHERE id = v_subscription.price_id;
    
    -- Generate reference code (10 digits)
    v_reference_code := '';
    FOR i IN 1..10 LOOP
        v_reference_code := v_reference_code || FLOOR(RANDOM() * 10)::TEXT;
    END LOOP;
    
    -- Create renewal payment
    INSERT INTO payments (
        merchant_id,
        price_id,
        customer_phone,
        customer_email,
        reference_code,
        amount,
        currency,
        payment_method,
        status,
        expires_at,
        metadata
    ) VALUES (
        v_subscription.merchant_id,
        v_subscription.price_id,
        v_subscription.customer_phone,
        v_subscription.customer_email,
        v_reference_code,
        v_price.amount,
        v_price.currency,
        'mtn_momo',
        'pending',
        NOW() + INTERVAL '7 days',
        jsonb_build_object('renewal_for', p_subscription_id)
    ) RETURNING id INTO v_payment_id;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if customer has active access
CREATE OR REPLACE FUNCTION has_active_access(
    p_product_id UUID,
    p_customer_phone TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription RECORD;
    v_price RECORD;
    v_grace_end TIMESTAMPTZ;
BEGIN
    -- Find subscription
    SELECT s.*, p.grace_period_days INTO v_subscription
    FROM subscriptions s
    JOIN prices p ON s.price_id = p.id
    WHERE s.product_id = p_product_id
        AND s.customer_phone = p_customer_phone
        AND s.status IN ('active', 'past_due')
    ORDER BY s.current_period_end DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate grace period
    v_grace_end := v_subscription.current_period_end + 
                   (COALESCE(v_subscription.grace_period_days, 0) || ' days')::INTERVAL;
    
    RETURN v_grace_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription details with access info
CREATE OR REPLACE FUNCTION get_subscription_access_info(
    p_product_id UUID,
    p_customer_phone TEXT
)
RETURNS TABLE (
    subscription_id UUID,
    status subscription_status,
    has_access BOOLEAN,
    current_period_end TIMESTAMPTZ,
    grace_period_end TIMESTAMPTZ,
    days_remaining INTEGER,
    is_renewable BOOLEAN,
    product_type product_type
) AS $$
DECLARE
    v_sub RECORD;
    v_grace_end TIMESTAMPTZ;
BEGIN
    -- Find subscription with product info
    SELECT s.*, p.grace_period_days, p.billing_cycle, prod.product_type AS p_type
    INTO v_sub
    FROM subscriptions s
    JOIN prices p ON s.price_id = p.id
    JOIN products prod ON s.product_id = prod.id
    WHERE s.product_id = p_product_id
        AND s.customer_phone = p_customer_phone
    ORDER BY s.current_period_end DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    v_grace_end := v_sub.current_period_end + (COALESCE(v_sub.grace_period_days, 0) || ' days')::INTERVAL;
    
    RETURN QUERY SELECT
        v_sub.id,
        v_sub.status,
        (v_grace_end > NOW()) AS has_access,
        v_sub.current_period_end,
        v_grace_end,
        GREATEST(0, EXTRACT(DAY FROM v_sub.current_period_end - NOW()))::INTEGER AS days_remaining,
        (v_sub.billing_cycle != 'one_time') AS is_renewable,
        v_sub.p_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
