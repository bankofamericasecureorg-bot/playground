-- Migration to increase routing number length to 11 digits

-- Update withdrawal_requests table
ALTER TABLE withdrawal_requests 
ALTER COLUMN routing_number TYPE VARCHAR(11);

-- Note: The transfer_requests table seems to store routing numbers 
-- in the description field (according to app/api/user/transfers/route.ts),
-- so no column update is needed there.

-- The accounts table routing_number column usually stores our own 
-- internal routing numbers. We've updated the generator to produce 
-- 11 digits, but let's ensure the column can hold them.
-- Based on the generator code, we've been generating 10 digits previously 
-- (prefix 1 or 2 + 8 digits + leading 0 = 10 digits).
-- If the accounts table was created with VARCHAR(9), we need to update it.

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'routing_number') THEN 
        ALTER TABLE accounts ALTER COLUMN routing_number TYPE VARCHAR(11); 
    END IF; 
END $$;
