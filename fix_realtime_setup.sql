-- Enable Realtime (safely handling "already exists")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'transfer_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transfer_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'withdrawal_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE withdrawal_requests;
  END IF;
END $$;

-- Recreate policies for Transfer Requests
DROP POLICY IF EXISTS "Admins can view all transfer requests" ON transfer_requests;
DROP POLICY IF EXISTS "Users can view own transfers" ON transfer_requests; -- potential conflict name

CREATE POLICY "Admins and owners view transfers" ON transfer_requests
  FOR SELECT
  USING (
    -- Admin check via JWT metadata
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    OR 
    -- User sees their own data
    (auth.uid() = user_id)
  );

-- Recreate policies for Withdrawal Requests
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;

CREATE POLICY "Admins and owners view withdrawals" ON withdrawal_requests
  FOR SELECT
  USING (
    -- Admin check via JWT metadata
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    OR 
    -- User sees their own data
    (auth.uid() = user_id)
  );

-- Grant access
GRANT SELECT ON transfer_requests TO authenticated;
GRANT SELECT ON withdrawal_requests TO authenticated;
