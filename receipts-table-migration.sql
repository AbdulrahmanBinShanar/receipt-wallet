-- =====================================================
-- RECEIPTS TABLE - MIGRATION SCRIPT
-- =====================================================
-- This script safely adds the file_path column and other
-- missing columns to an existing receipts table
-- Run this in Supabase SQL Editor if you already have a receipts table

-- Add file_path column if it doesn't exist
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add other potentially missing columns
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS merchant TEXT,
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS warranty_months INTEGER,
ADD COLUMN IF NOT EXISTS extracted_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint for status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'receipts_status_check'
    ) THEN
        ALTER TABLE receipts 
        ADD CONSTRAINT receipts_status_check 
        CHECK (status IN ('active', 'archived'));
    END IF;
END $$;

-- Update any NULL file_path values to empty string (if needed)
UPDATE receipts SET file_path = '' WHERE file_path IS NULL;

-- Make file_path and file_url NOT NULL after backfilling
ALTER TABLE receipts 
ALTER COLUMN file_path SET NOT NULL,
ALTER COLUMN file_url SET NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);

-- Ensure RLS is enabled
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON receipts;

CREATE POLICY "Users can view their own receipts"
    ON receipts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
    ON receipts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
    ON receipts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users ISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done!
SELECT 'Migration completed successfully!' AS status;
can delete their own receipts"
    ON receipts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all receipts"
    ON receipts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

-- Add trigger for updated_at if not exists
DROP TRIGGER IF EX