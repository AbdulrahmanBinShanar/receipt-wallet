# Supabase Setup - Quick Reference Guide

## 🚀 Initial Setup (Run Once)

### 1. Create Database Schema

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the entire contents of `supabase-schema.sql` and click **Run**.

### 2. Create Your Admin Account

After running the schema and signing up in your app:

```sql
-- Replace with your actual user ID from Authentication > Users
INSERT INTO admin_roles (user_id, role_level, permissions)
VALUES ('your-user-id-here', 'super_admin', '["all"]');
```

### 3. Enable Realtime

Go to **Database** → **Replication** and enable these tables:
- ✅ `user_sessions`
- ✅ `user_activity_logs`
- ✅ `system_analytics`
- ✅ `profiles`

---

## 📊 Common Admin Queries

### View All Users with Stats

```sql
SELECT 
    p.id,
    p.full_name,
    p.status,
    p.created_at,
    COUNT(DISTINCT r.id) as receipts_count,
    COUNT(DISTINCT s.id) as sessions_count
FROM profiles p
LEFT JOIN receipts r ON p.id = r.user_id
LEFT JOIN user_sessions s ON p.id = s.user_id
GROUP BY p.id, p.full_name, p.status, p.created_at
ORDER BY p.created_at DESC;
```

### Block a User

```sql
-- Using the database function
SELECT block_user(
    'user-id-here'::uuid,
    'Reason for blocking'
);
```

### Unblock a User

```sql
-- Using the database function
SELECT unblock_user('user-id-here'::uuid);
```

### Get Active Users (Last 30 Minutes)

```sql
SELECT get_active_users_count(30);
```

### Check if User is Admin

```sql
SELECT is_admin('user-id-here'::uuid);
```

### View All Admins

```sql
SELECT 
    ar.*,
    p.full_name,
    p.created_at as user_created_at
FROM admin_roles ar
LEFT JOIN profiles p ON ar.user_id = p.id
ORDER BY ar.created_at DESC;
```

### Add Another Admin

```sql
INSERT INTO admin_roles (user_id, role_level, permissions, created_by)
VALUES (
    'new-admin-user-id'::uuid,
    'admin', -- or 'moderator' for limited access
    '["read", "write"]', -- or '["all"]' for super admin
    auth.uid() -- your user ID
);
```

### View Recent User Activity

```sql
SELECT 
    ual.created_at,
    ual.activity_type,
    ual.activity_details,
    p.full_name,
    p.id as user_id
FROM user_activity_logs ual
LEFT JOIN profiles p ON ual.user_id = p.id
ORDER BY ual.created_at DESC
LIMIT 50;
```

### Get User Engagement Scores

```sql
SELECT 
    user_id,
    date,
    engagement_score,
    receipts_uploaded,
    sessions_count,
    total_session_minutes
FROM user_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY engagement_score DESC
LIMIT 20;
```

### Find Blocked Users

```sql
SELECT 
    p.*,
    p.block_reason,
    p.blocked_at,
    blocker.full_name as blocked_by_name
FROM profiles p
LEFT JOIN profiles blocker ON p.blocked_by = blocker.id
WHERE p.status = 'blocked'
ORDER BY p.blocked_at DESC;
```

### System Analytics - Daily Stats

```sql
SELECT 
    date,
    total_users,
    new_users,
    active_users,
    blocked_users,
    new_receipts,
    total_sessions
FROM system_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Calculate User Churn Risk (Manual)

```sql
-- Users who haven't logged in for 14+ days
SELECT 
    p.id,
    p.full_name,
    p.created_at,
    MAX(s.login_at) as last_login,
    COUNT(r.id) as receipt_count,
    EXTRACT(DAY FROM NOW() - MAX(s.login_at)) as days_since_login
FROM profiles p
LEFT JOIN user_sessions s ON p.id = s.user_id
LEFT JOIN receipts r ON p.id = r.user_id
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.created_at
HAVING MAX(s.login_at) < NOW() - INTERVAL '14 days'
    OR MAX(s.login_at) IS NULL
ORDER BY days_since_login DESC NULLS FIRST;
```

---

## 🔧 Useful Maintenance Queries

### Clean Up Old Sessions (Older than 90 Days)

```sql
DELETE FROM user_sessions
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Archive Old Activity Logs

```sql
-- First, create an archive table if needed
CREATE TABLE IF NOT EXISTS user_activity_logs_archive (LIKE user_activity_logs INCLUDING ALL);

-- Move old logs
INSERT INTO user_activity_logs_archive
SELECT * FROM user_activity_logs
WHERE created_at < NOW() - INTERVAL '180 days';

-- Delete from main table
DELETE FROM user_activity_logs
WHERE created_at < NOW() - INTERVAL '180 days';
```

### Update System Analytics for Today

```sql
INSERT INTO system_analytics (
    date,
    total_users,
    new_users,
    active_users,
    blocked_users,
    total_receipts,
    new_receipts,
    total_sessions
)
VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM profiles WHERE status = 'active'),
    (SELECT COUNT(*) FROM profiles WHERE status = 'blocked'),
    (SELECT COUNT(*) FROM receipts),
    (SELECT COUNT(*) FROM receipts WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM user_sessions WHERE login_at::date = CURRENT_DATE)
)
ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    blocked_users = EXCLUDED.blocked_users,
    total_receipts = EXCLUDED.total_receipts,
    new_receipts = EXCLUDED.new_receipts,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = NOW();
```

---

## 🔐 Security & Permissions

### Check RLS Policies

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Admin Access

```sql
-- This should return true for admin users
SELECT is_admin(auth.uid());

-- View your admin role
SELECT * FROM admin_roles WHERE user_id = auth.uid();
```

---

## 📱 Testing Queries

### Simulate User Activity

```sql
-- Log a test activity
INSERT INTO user_activity_logs (user_id, activity_type, activity_details)
VALUES (
    auth.uid(),
    'receipt_upload',
    '{"test": true, "receipt_id": "test-123"}'::jsonb
);
```

### Create Test User Session

```sql
INSERT INTO user_sessions (user_id, login_at)
VALUES (auth.uid(), NOW());
```

---

## ⚠️ Important Notes

1. **Never delete admin_roles records** unless removing admin access intentionally
2. **Backup before running DELETE queries** - use transactions:
   ```sql
   BEGIN;
   -- Your DELETE query here
   -- Check the results first
   ROLLBACK; -- or COMMIT; if satisfied
   ```
3. **RLS is enabled** - queries run as authenticated users respect policies
4. **Use `auth.uid()`** in queries to reference the current logged-in user

---

## 🎯 Quick Start Checklist

- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Sign up for an account in your app
- [ ] Copy your user ID from Authentication panel
- [ ] Insert yourself as super_admin using the query above
- [ ] Enable Realtime on required tables
- [ ] Log in again - should redirect to `/admin`
- [ ] Test blocking/unblocking a test user
- [ ] Verify analytics charts are displaying

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify RLS policies are enabled (they should be by default)
3. Confirm Realtime is enabled on tables
4. Check that your user ID is correctly inserted in admin_roles
