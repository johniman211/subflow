-- Content Access System: Auth Wall, Paywall, and View Tracking
-- This extends the Creator Studio schema with proper access control

-- Add visibility enum
CREATE TYPE content_visibility AS ENUM ('free', 'premium');

-- Add visibility column to content_items (maps from is_free)
ALTER TABLE content_items 
ADD COLUMN visibility content_visibility NOT NULL DEFAULT 'premium';

-- Update existing records: is_free = true -> 'free', else 'premium'
UPDATE content_items SET visibility = CASE WHEN is_free THEN 'free' ELSE 'premium' END;

-- Content Views table for detailed tracking
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_phone TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for content_views
CREATE INDEX idx_content_views_content_id ON content_views(content_id);
CREATE INDEX idx_content_views_creator_id ON content_views(creator_id);
CREATE INDEX idx_content_views_viewer_user_id ON content_views(viewer_user_id);
CREATE INDEX idx_content_views_created_at ON content_views(created_at);

-- Enable RLS on content_views
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- Creators can view their own content views
CREATE POLICY "Creators can view their content views"
    ON content_views FOR SELECT
    USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

-- System can insert views
CREATE POLICY "System can insert content views"
    ON content_views FOR INSERT
    WITH CHECK (true);

-- Function to check user entitlement by user_id
CREATE OR REPLACE FUNCTION check_user_entitlement(
    p_user_id UUID,
    p_content_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_content content_items%ROWTYPE;
    v_user_phone TEXT;
    v_has_access BOOLEAN := false;
BEGIN
    -- Get content item
    SELECT * INTO v_content FROM content_items WHERE id = p_content_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Free content is always accessible
    IF v_content.visibility = 'free' OR v_content.is_free THEN
        RETURN true;
    END IF;
    
    -- Get user's phone number
    SELECT phone INTO v_user_phone FROM users WHERE id = p_user_id;
    
    IF v_user_phone IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has active subscription to any linked product
    SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.customer_phone = v_user_phone
        AND s.product_id = ANY(v_content.product_ids)
        AND s.status = 'active'
        AND s.current_period_end > NOW()
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log content view
CREATE OR REPLACE FUNCTION log_content_view(
    p_content_id UUID,
    p_viewer_user_id UUID DEFAULT NULL,
    p_viewer_phone TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_content content_items%ROWTYPE;
    v_view_id UUID;
    v_is_premium BOOLEAN;
BEGIN
    -- Get content item
    SELECT * INTO v_content FROM content_items WHERE id = p_content_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    v_is_premium := v_content.visibility = 'premium' AND NOT v_content.is_free;
    
    -- Insert view record
    INSERT INTO content_views (
        content_id,
        creator_id,
        viewer_user_id,
        viewer_phone,
        is_premium,
        ip_hash,
        user_agent
    ) VALUES (
        p_content_id,
        v_content.creator_id,
        p_viewer_user_id,
        p_viewer_phone,
        v_is_premium,
        p_ip_hash,
        p_user_agent
    ) RETURNING id INTO v_view_id;
    
    -- Also increment the view count
    UPDATE content_items 
    SET view_count = view_count + 1 
    WHERE id = p_content_id;
    
    RETURN v_view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_premium_default to community settings (community is premium by default)
ALTER TABLE creators
ADD COLUMN community_is_premium BOOLEAN NOT NULL DEFAULT true;

-- Function to check community access
CREATE OR REPLACE FUNCTION check_community_access(
    p_user_id UUID,
    p_creator_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_creator creators%ROWTYPE;
    v_user_phone TEXT;
    v_has_access BOOLEAN := false;
BEGIN
    -- Get creator
    SELECT * INTO v_creator FROM creators WHERE id = p_creator_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- If community is free, allow access
    IF NOT v_creator.community_is_premium THEN
        RETURN true;
    END IF;
    
    -- Community is premium, check if user is logged in
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user's phone number
    SELECT phone INTO v_user_phone FROM users WHERE id = p_user_id;
    
    IF v_user_phone IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has any active subscription with this creator's products
    SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN products p ON s.product_id = p.id
        WHERE s.customer_phone = v_user_phone
        AND p.merchant_id = v_creator.user_id
        AND s.status = 'active'
        AND s.current_period_end > NOW()
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
