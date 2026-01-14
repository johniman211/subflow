-- ============================================
-- IN-APP NOTIFICATIONS TABLE
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NULL,
  link text NULL,
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at 
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_at 
  ON public.notifications (user_id, read_at);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own notifications

-- SELECT policy
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" 
  ON public.notifications 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- INSERT policy
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" 
  ON public.notifications 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- UPDATE policy
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Service role can do everything (for system-generated notifications)
DROP POLICY IF EXISTS "Service role full access" ON public.notifications;
CREATE POLICY "Service role full access" 
  ON public.notifications 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Enable Realtime for notifications table
-- This allows clients to subscribe to INSERT events
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
