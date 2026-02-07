import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to real-time active users count
 */
export function subscribeToActiveUsers(callback: (count: number) => void) {
    const supabase = createClient();

    // Subscribe to user_sessions table changes
    const channel = supabase
        .channel('active-users-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'user_sessions'
            },
            async () => {
                // Fetch updated count
                const { data } = await supabase.rpc('get_active_users_count', {
                    minutes_threshold: 30
                });
                callback(data || 0);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to user activity logs
 */
export function subscribeToUserActivity(
    callback: (activity: any) => void,
    limit: number = 20
) {
    const supabase = createClient();

    const channel = supabase
        .channel('user-activity')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'user_activity_logs'
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to new user signups
 */
export function subscribeToNewUsers(callback: (user: any) => void) {
    const supabase = createClient();

    const channel = supabase
        .channel('new-users')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'profiles'
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to system analytics updates
 */
export function subscribeToSystemAnalytics(callback: (analytics: any) => void) {
    const supabase = createClient();

    const channel = supabase
        .channel('system-analytics')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'system_analytics'
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Log user activity
 */
export async function logActivity(
    userId: string,
    activityType: string,
    details: Record<string, any> = {}
) {
    const supabase = createClient();

    await supabase.from('user_activity_logs').insert({
        user_id: userId,
        activity_type: activityType,
        activity_details: details
    });
}

/**
 * Create or update user session
 */
export async function trackUserSession(userId: string) {
    const supabase = createClient();

    // Check if there's an active session (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('login_at', thirtyMinutesAgo)
        .is('logout_at', null)
        .single();

    if (existingSession) {
        // Update existing session
        return existingSession;
    }

    // Create new session
    const { data: newSession } = await supabase
        .from('user_sessions')
        .insert({
            user_id: userId,
            login_at: new Date().toISOString()
        })
        .select()
        .single();

    return newSession;
}
