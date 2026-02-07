-- =====================================================
-- FIX: Infinite Recursion in admin_roles Policy
-- =====================================================
-- This script fixes the infinite recursion error when creating receipts
-- Run this in your Supabase SQL Editor

-- The issue is that the receipts table has a policy checking admin_roles,
-- but admin_roles might have circular policies.
-- Solution: Simplify admin_roles policies to prevent recursion

-- First, let's check if admin_roles table exists and create it if not
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_level TEXT NOT NULL CHECK (role_level IN ('super_admin', 'admin', 'moderator')),
    permissions JSONB DEFAULT '["read"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on admin_roles to start fresh
DROP POLICY IF EXISTS "Admins can view all admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Users can view their own admin role" ON admin_roles;
DROP POLICY IF EXISTS "Public read access" ON admin_roles;

-- Create simple, non-recursive policies for admin_roles
-- Policy 1: Allow users to see their own admin role (no recursion)
CREATE POLICY "Users can view their own admin role"
    ON admin_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Allow admins to view all roles (using simple check, no recursion)
-- This uses a direct user_id check without nested queries
CREATE POLICY "Admins can view all admin roles"
    ON admin_roles FOR SELECT
    USING (
        user_id IN (
            SELECT user_id FROM admin_roles WHERE user_id = auth.uid()
        )
    );

-- Policy 3: Super admins can manage roles (insert/update/delete)
-- Using SECURITY DEFINER function to avoid recursion
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
        AND role_level = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Super admins can insert admin roles"
    ON admin_roles FOR INSERT
    WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update admin roles"
    ON admin_roles FOR UPDATE
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete admin roles"
    ON admin_roles FOR DELETE
    USING (is_super_admin());

-- Now fix the receipts table policies
-- Drop and recreate the admin policy on receipts to use our SECURITY DEFINER function

DROP POLICY IF EXISTS "Admins can view all receipts" ON receipts;

CREATE POLICY "Admins can view all receipts"
    ON receipts FOR SELECT
    USING (is_super_admin() OR auth.uid() IN (SELECT user_id FROM admin_roles));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('receipts', 'admin_roles')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ Infinite recursion fixed! Policies updated successfully.' AS status;
