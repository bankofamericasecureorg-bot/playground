-- =====================================================
-- CREATE RESTRICTED ATTEMPTS TABLE
-- Logs all withdrawal/transfer attempts that were blocked
-- =====================================================

CREATE TABLE IF NOT EXISTS restricted_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('withdrawal', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL,
  details JSONB, -- Optional: bank name, account number, recipient, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_restricted_attempts_user_id ON restricted_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_restricted_attempts_created_at ON restricted_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE restricted_attempts ENABLE ROW LEVEL SECURITY;

-- Admins can view all restricted attempts
CREATE POLICY "Admins can view all restricted attempts"
  ON restricted_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Service role can insert (for API inserts)
CREATE POLICY "Service role can insert restricted attempts"
  ON restricted_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON restricted_attempts TO authenticated;
GRANT ALL ON restricted_attempts TO service_role;
