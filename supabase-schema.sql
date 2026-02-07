-- =====================================================
-- ADMIN PORTAL & ANALYTICS SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This creates tables, RLS policies, functions, and triggers for the admin portal

-- =====================================================
-- 1. ADMIN ROLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_level TEXT NOT NULL CHECK (role_level IN ('super_admin', 'admin', 'moderator')),
    permissions JSONB DEFAULT '["read"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- RLS Policies for admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin roles"
    ON admin_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin roles"
    ON admin_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role_level = 'super_admin'
        )
    );

-- =====================================================
-- 2. UPDATE PROFILES TABLE
-- =====================================================

-- Add status and role columns to profiles if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'blocked', 'suspended'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- =====================================================
-- 3. RECEIPTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    merchant TEXT,
    date DATE,
    total DECIMAL(10,2),
    currency TEXT DEFAULT 'SAR',
    category TEXT,
    warranty_months INTEGER,
    extracted_json JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for receipts table
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);

-- RLS Policies for receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can view all receipts"
    ON receipts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

-- Trigger for receipts updated_at
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. USER SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    session_duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_at ON user_sessions(login_at DESC);

-- RLS Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
    ON user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
    ON user_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

-- =====================================================
-- 4. USER ACTIVITY LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (
        activity_type IN (
            'login', 'logout', 'receipt_upload', 'receipt_delete', 
            'reminder_create', 'pack_create', 'profile_update',
            'blocked', 'unblocked'
        )
    ),
    activity_details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);

-- RLS Policies
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
    ON user_activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
    ON user_activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert activity logs"
    ON user_activity_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 5. USER ANALYTICS TABLE (Aggregated Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    receipts_uploaded INTEGER DEFAULT 0,
    receipts_deleted INTEGER DEFAULT 0,
    reminders_created INTEGER DEFAULT 0,
    packs_created INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    total_session_minutes INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date DESC);

-- RLS Policies
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
    ON user_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
    ON user_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. SYSTEM ANALYTICS TABLE (Global Metrics)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    blocked_users INTEGER DEFAULT 0,
    total_receipts INTEGER DEFAULT 0,
    new_receipts INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    avg_session_minutes DECIMAL(5,2) DEFAULT 0,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_analytics_date ON system_analytics(date DESC);

-- RLS Policies
ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system analytics"
    ON system_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid()
        )
    );

-- =====================================================
-- 7. DATABASE FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to block user
CREATE OR REPLACE FUNCTION block_user(
    target_user_id UUID,
    reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can block users';
    END IF;
    
    -- Update profile
    UPDATE profiles 
    SET 
        status = 'blocked',
        blocked_at = NOW(),
        blocked_by = auth.uid(),
        block_reason = reason
    WHERE id = target_user_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (user_id, activity_type, activity_details)
    VALUES (
        target_user_id, 
        'blocked', 
        jsonb_build_object('blocked_by', auth.uid(), 'reason', reason)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unblock user
CREATE OR REPLACE FUNCTION unblock_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can unblock users';
    END IF;
    
    -- Update profile
    UPDATE profiles 
    SET 
        status = 'active',
        blocked_at = NULL,
        blocked_by = NULL,
        block_reason = NULL
    WHERE id = target_user_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (user_id, activity_type, activity_details)
    VALUES (
        target_user_id, 
        'unblocked', 
        jsonb_build_object('unblocked_by', auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(target_user_id UUID, target_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    score DECIMAL := 0;
    analytics_record RECORD;
BEGIN
    SELECT * INTO analytics_record
    FROM user_analytics
    WHERE user_id = target_user_id AND date = target_date;
    
    IF FOUND THEN
        -- Simple engagement scoring (customize as needed)
        score := (
            (COALESCE(analytics_record.receipts_uploaded, 0) * 5) +
            (COALESCE(analytics_record.reminders_created, 0) * 3) +
            (COALESCE(analytics_record.packs_created, 0) * 10) +
            (COALESCE(analytics_record.sessions_count, 0) * 2) +
            (LEAST(COALESCE(analytics_record.total_session_minutes, 0), 120) * 0.5)
        );
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to get active users count
CREATE OR REPLACE FUNCTION get_active_users_count(minutes_threshold INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions
        WHERE login_at > NOW() - (minutes_threshold || ' minutes')::INTERVAL
        AND (logout_at IS NULL OR logout_at > NOW() - (minutes_threshold || ' minutes')::INTERVAL)
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_analytics_updated_at
    BEFORE UPDATE ON user_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_analytics_updated_at
    BEFORE UPDATE ON system_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INITIAL DATA & SETUP
-- =====================================================

-- Create today's system analytics record if it doesn't exist
INSERT INTO system_analytics (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION block_user TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_engagement_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_users_count TO authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- NEXT STEPS:
-- 1. After running this script, manually insert your admin user:
--    
--    INSERT INTO admin_roles (user_id, role_level, permissions)
--    VALUES ('your-user-id-here', 'super_admin', '["all"]');
--
--    To get your user_id, sign in to your app and check auth.users table
--
-- 2. Enable Realtime for tables (in Supabase Dashboard > Database > Replication):
--    - user_sessions
--    - user_activity_logs
--    - system_analytics
--
-- 3. Optional: Create cron jobs to update analytics daily (using pg_cron extension)
