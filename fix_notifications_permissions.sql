-- =====================================================
-- COMPLETE NOTIFICATIONS PERMISSIONS & RLS FIX
-- Run this in your Supabase SQL Editor to fix all notification issues
-- =====================================================

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;

-- 2. Enable RLS (if not already enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create comprehensive RLS policies

-- Allow users to SELECT their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to UPDATE their own notifications (for marking as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to INSERT notifications for any user (admin operations)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 4. Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON notifications TO authenticated;

-- 5. Grant all permissions to service_role (for admin inserts)
GRANT ALL ON notifications TO service_role;

-- 6. Ensure Realtime is enabled for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 7. Verify setup (optional - just for confirmation)
SELECT 
  'RLS Enabled: ' || CASE WHEN relrowsecurity THEN 'YES' ELSE 'NO' END as rls_status
FROM pg_class 
WHERE relname = 'notifications';

-- Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;
