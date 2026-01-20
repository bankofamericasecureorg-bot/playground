-- Migration script to add missing columns to transfer_requests table

-- Add admin_notes column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_requests' AND column_name = 'admin_notes') THEN 
        ALTER TABLE transfer_requests ADD COLUMN admin_notes TEXT; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_requests' AND column_name = 'reviewed_by') THEN 
        ALTER TABLE transfer_requests ADD COLUMN reviewed_by UUID REFERENCES auth.users(id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_requests' AND column_name = 'reviewed_at') THEN 
        ALTER TABLE transfer_requests ADD COLUMN reviewed_at TIMESTAMPTZ; 
    END IF;
END $$;
