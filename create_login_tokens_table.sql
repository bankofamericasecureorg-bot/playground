-- =====================================================
-- CREATE LOGIN TOKENS TABLE
-- Stores OTP codes for email verification during login
-- =====================================================

CREATE TABLE IF NOT EXISTS login_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_tokens_code ON login_tokens(code);
CREATE INDEX IF NOT EXISTS idx_login_tokens_user_id ON login_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tokens_expires ON login_tokens(expires_at);

-- Enable RLS
ALTER TABLE login_tokens ENABLE ROW LEVEL SECURITY;

-- Service role can insert and manage tokens
CREATE POLICY "Service role full access"
  ON login_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON login_tokens TO service_role;

-- Cleanup job: Delete expired tokens (run periodically or via cron)
-- DELETE FROM login_tokens WHERE expires_at < NOW() OR used = TRUE;
