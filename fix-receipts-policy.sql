-- =====================================================
-- SIMPLER FIX: Remove Admin Check from Receipts Policies
-- =====================================================
-- The issue is the "Admins can view all receipts" policy
-- Regular users don't need this policy to create their own receipts
-- We'll just remove it for now

-- Drop the problematic admin policy on receipts
DROP POLICY IF EXISTS "Admins can view all receipts" ON receipts;

-- Verify that basic user policies still exist
-- If they don't, create them

-- Ensure RLS is enabled
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies to recreate them fresh
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;

-- Create simple, non-recursive policies for regular users
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

CREATE POLICY "Users can delete their own receipts"
    ON receipts FOR DELETE
    USING (auth.uid() = user_id);

-- Verify policies
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'receipts'
ORDER BY policyname;

-- Success message
SELECT '✅ Receipts policies fixed! Admin policy removed to prevent recursion.' AS status;
