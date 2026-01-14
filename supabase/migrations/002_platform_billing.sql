-- Platform Billing Schema for Payssd SaaS
-- This handles billing for the platform itself (users paying to use Payssd)

-- Admin Settings table - stores platform admin's payment info
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Plans - the plans users can subscribe to (Free, Pro, Enterprise)
CREATE TABLE IF NOT EXISTS platform_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  trial_days INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Subscriptions - tracks which plan each user is on
CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES platform_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, trialing, past_due, canceled, expired
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Platform Payments - payment history for platform subscriptions
CREATE TABLE IF NOT EXISTS platform_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES platform_subscriptions(id),
  plan_id UUID NOT NULL REFERENCES platform_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL, -- mtn_momo, bank_transfer_ssp, bank_transfer_usd
  reference_code TEXT UNIQUE NOT NULL,
  transaction_id TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, matched, confirmed, failed
  billing_period TEXT, -- monthly, yearly
  matched_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add platform_plan_id to users table for quick access
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform_plan_id UUID REFERENCES platform_plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0;

-- Insert default plans
INSERT INTO platform_plans (name, slug, description, price_monthly, price_yearly, currency, features, limits, is_active, is_featured, trial_days, sort_order)
VALUES 
  (
    'Free',
    'free',
    'Perfect for getting started',
    0,
    0,
    'USD',
    '["Up to 50 subscribers", "Basic dashboard", "Email support", "Checkout links only", "Powered by Payssd branding"]',
    '{"max_subscribers": 50, "api_access": false, "webhooks": false, "custom_branding": false, "analytics": "basic", "show_branding": true}',
    true,
    false,
    0,
    1
  ),
  (
    'Pro',
    'pro',
    'For growing businesses',
    29,
    290,
    'USD',
    '["Unlimited subscribers", "Advanced analytics", "Priority support", "API access", "Webhooks", "Custom branding"]',
    '{"max_subscribers": -1, "api_access": true, "webhooks": true, "custom_branding": true, "analytics": "advanced"}',
    true,
    true,
    3,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'For large organizations',
    0,
    0,
    'USD',
    '["Everything in Pro", "Dedicated support", "SLA guarantee", "Custom integrations", "On-premise option"]',
    '{"max_subscribers": -1, "api_access": true, "webhooks": true, "custom_branding": true, "analytics": "advanced", "dedicated_support": true}',
    true,
    false,
    0,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value)
VALUES 
  ('payment_info', '{
    "mtn_momo": {
      "number": "",
      "name": "Payssd"
    },
    "bank_ssp": {
      "bank_name": "",
      "account_number": "",
      "account_name": ""
    },
    "bank_usd": {
      "bank_name": "",
      "account_number": "",
      "account_name": ""
    }
  }'),
  ('platform_settings', '{
    "platform_name": "Payssd",
    "support_email": "support@payssd.com",
    "trial_enabled": true,
    "trial_days": 3
  }')
ON CONFLICT (key) DO NOTHING;

-- RLS Policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_payments ENABLE ROW LEVEL SECURITY;

-- Admin settings: only platform admins can modify
CREATE POLICY "Anyone can read admin settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can modify admin settings" ON admin_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);

-- Platform plans: anyone can read, only admins can modify
CREATE POLICY "Anyone can read platform plans" ON platform_plans FOR SELECT USING (true);
CREATE POLICY "Only admins can modify platform plans" ON platform_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);

-- Platform subscriptions: users can read their own, admins can read all
CREATE POLICY "Users can read own subscription" ON platform_subscriptions FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);
CREATE POLICY "Users can insert own subscription" ON platform_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can modify subscriptions" ON platform_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);

-- Platform payments: users can read/create their own, admins can read/modify all
CREATE POLICY "Users can read own payments" ON platform_payments FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);
CREATE POLICY "Users can create own payments" ON platform_payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can modify payments" ON platform_payments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_admin = true)
);

-- Function to check if user has reached their plan limit
CREATE OR REPLACE FUNCTION check_subscriber_limit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_limits JSONB;
  v_subscriber_count INTEGER;
  v_max_subscribers INTEGER;
BEGIN
  -- Get user's plan limits
  SELECT pp.limits INTO v_plan_limits
  FROM users u
  LEFT JOIN platform_plans pp ON pp.id = u.platform_plan_id
  WHERE u.id = p_user_id;
  
  -- Get current subscriber count
  SELECT subscriber_count INTO v_subscriber_count FROM users WHERE id = p_user_id;
  
  -- Get max subscribers from limits (-1 means unlimited)
  v_max_subscribers := COALESCE((v_plan_limits->>'max_subscribers')::INTEGER, 50);
  
  RETURN jsonb_build_object(
    'current_count', COALESCE(v_subscriber_count, 0),
    'max_allowed', v_max_subscribers,
    'is_at_limit', v_max_subscribers != -1 AND COALESCE(v_subscriber_count, 0) >= v_max_subscribers,
    'can_add', v_max_subscribers = -1 OR COALESCE(v_subscriber_count, 0) < v_max_subscribers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment subscriber count
CREATE OR REPLACE FUNCTION increment_subscriber_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit_check JSONB;
BEGIN
  v_limit_check := check_subscriber_limit(p_user_id);
  
  IF (v_limit_check->>'can_add')::BOOLEAN THEN
    UPDATE users SET subscriber_count = COALESCE(subscriber_count, 0) + 1 WHERE id = p_user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_user ON platform_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_user ON platform_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON platform_payments(status);
