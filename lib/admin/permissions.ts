import { createClient } from '@/lib/supabase/server';
import { AdminRole, AdminRoleLevel } from '@/types/database';

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId?: string): Promise<boolean> {
    const supabase = await createClient();

    // If no userId provided, get current user
    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        userId = user.id;
    }

    const { data, error } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

    return !error && !!data;
}

/**
 * Get admin role details for a user
 */
export async function getAdminRole(userId?: string): Promise<AdminRole | null> {
    const supabase = await createClient();

    // If no userId provided, get current user
    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        userId = user.id;
    }

    const { data } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

    return data;
}

/**
 * Check if user has a specific admin level
 */
export async function hasAdminLevel(
    requiredLevel: AdminRoleLevel,
    userId?: string
): Promise<boolean> {
    const role = await getAdminRole(userId);
    if (!role) return false;

    const levels: Record<AdminRoleLevel, number> = {
        'moderator': 1,
        'admin': 2,
        'super_admin': 3
    };

    return levels[role.role_level] >= levels[requiredLevel];
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
    permission: string,
    userId?: string
): Promise<boolean> {
    const role = await getAdminRole(userId);
    if (!role) return false;

    // Super admins have all permissions
    if (role.role_level === 'super_admin' || role.permissions.includes('all')) {
        return true;
    }

    return role.permissions.includes(permission);
}

/**
 * Require admin access (throws error if not admin)
 * Use this in API routes and server actions
 */
export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
}

/**
 * Require specific admin level (throws error if insufficient)
 */
export async function requireAdminLevel(level: AdminRoleLevel) {
    const hasLevel = await hasAdminLevel(level);
    if (!hasLevel) {
        throw new Error(`Unauthorized: ${level} access required`);
    }
}
