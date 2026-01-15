-- Creator Role System Migration
-- Adds is_creator flag to users table for role-based access control

-- Add is_creator column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_creator BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator) WHERE is_creator = true;

-- Function to enable creator role for a user
CREATE OR REPLACE FUNCTION enable_creator_role(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user users%ROWTYPE;
BEGIN
    -- Get user
    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Update user to be a creator
    UPDATE users SET is_creator = true, updated_at = NOW() WHERE id = p_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a creator
CREATE OR REPLACE FUNCTION check_is_creator(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_creator BOOLEAN;
BEGIN
    SELECT is_creator INTO v_is_creator FROM users WHERE id = p_user_id;
    RETURN COALESCE(v_is_creator, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users who already have creator profiles to be creators
UPDATE users u
SET is_creator = true
WHERE EXISTS (
    SELECT 1 FROM creators c WHERE c.user_id = u.id
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION enable_creator_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_is_creator(UUID) TO authenticated;
