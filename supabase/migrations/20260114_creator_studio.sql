-- Creator Studio: Content Monetization Platform
-- Database Schema for Creators

-- Create content type enum
CREATE TYPE content_type AS ENUM ('blog_post', 'video', 'file', 'community_post');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Creators table (extends users)
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{3,30}$')
);

-- Content Items table (all content types)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    status content_status NOT NULL DEFAULT 'draft',
    
    -- Blog post specific
    body_content TEXT,
    preview_content TEXT,
    
    -- Video specific
    video_platform TEXT, -- youtube, facebook, instagram, tiktok
    video_embed_id TEXT,
    video_thumbnail_url TEXT,
    
    -- File specific
    file_url TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    file_type TEXT,
    
    -- Access control
    is_free BOOLEAN NOT NULL DEFAULT false,
    product_ids UUID[] DEFAULT '{}',
    
    -- Metadata
    view_count INTEGER NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(creator_id, slug)
);

-- Community Posts table
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    author_phone TEXT NOT NULL,
    author_name TEXT,
    title TEXT,
    body TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_creator_post BOOLEAN NOT NULL DEFAULT false,
    product_ids UUID[] DEFAULT '{}',
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Comments table
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_phone TEXT NOT NULL,
    author_name TEXT,
    body TEXT NOT NULL,
    is_creator_reply BOOLEAN NOT NULL DEFAULT false,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Access Logs (for analytics and entitlement checks)
CREATE TABLE content_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
    community_post_id UUID REFERENCES community_posts(id) ON DELETE SET NULL,
    customer_phone TEXT NOT NULL,
    access_type TEXT NOT NULL, -- view, download, stream
    access_granted BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Entitlements (cache for quick access checks)
CREATE TABLE content_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_phone TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(customer_phone, creator_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_creators_username ON creators(username);
CREATE INDEX idx_content_items_creator_id ON content_items(creator_id);
CREATE INDEX idx_content_items_slug ON content_items(slug);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_community_posts_creator_id ON community_posts(creator_id);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_content_access_logs_customer ON content_access_logs(customer_phone);
CREATE INDEX idx_content_entitlements_customer ON content_entitlements(customer_phone);
CREATE INDEX idx_content_entitlements_creator ON content_entitlements(creator_id);

-- Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_entitlements ENABLE ROW LEVEL SECURITY;

-- Policies for creators table
CREATE POLICY "Users can view their own creator profile"
    ON creators FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own creator profile"
    ON creators FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile"
    ON creators FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view active creators"
    ON creators FOR SELECT
    USING (is_active = true);

-- Policies for content_items table
CREATE POLICY "Creators can manage their own content"
    ON content_items FOR ALL
    USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "Public can view published content"
    ON content_items FOR SELECT
    USING (status = 'published');

-- Policies for community_posts
CREATE POLICY "Creators can manage community posts"
    ON community_posts FOR ALL
    USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "Public can view community posts"
    ON community_posts FOR SELECT
    USING (true);

-- Policies for community_comments
CREATE POLICY "Anyone can view comments"
    ON community_comments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create comments"
    ON community_comments FOR INSERT
    WITH CHECK (true);

-- Function to check content entitlement
CREATE OR REPLACE FUNCTION check_content_entitlement(
    p_customer_phone TEXT,
    p_content_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_content content_items%ROWTYPE;
    v_has_access BOOLEAN := false;
BEGIN
    -- Get content item
    SELECT * INTO v_content FROM content_items WHERE id = p_content_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Free content is always accessible
    IF v_content.is_free THEN
        RETURN true;
    END IF;
    
    -- Check if user has active subscription to any linked product
    SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.customer_phone = p_customer_phone
        AND s.product_id = ANY(v_content.product_ids)
        AND s.status = 'active'
        AND s.current_period_end > NOW()
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_content_view(p_content_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE content_items 
    SET view_count = view_count + 1 
    WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_content_download(p_content_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE content_items 
    SET download_count = download_count + 1 
    WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for creator files
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-files', 'creator-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for creator files
CREATE POLICY "Authenticated users can upload creator files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creator-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view creator files"
ON storage.objects FOR SELECT
USING (bucket_id = 'creator-files');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'creator-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'creator-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
