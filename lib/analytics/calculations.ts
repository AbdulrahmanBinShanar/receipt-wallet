import { createClient } from '@/lib/supabase/server';
import {
    UserAnalytics,
    SystemAnalytics,
    DashboardMetrics,
    AnalyticsChartData,
    RetentionCohort
} from '@/types/database';
import { startOfDay, subDays, format, differenceInDays } from 'date-fns';

/**
 * Get real-time dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = await createClient();

    // Total users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Blocked users
    const { count: blockedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'blocked');

    // Active users (users with status = active)
    const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Total receipts
    const { count: totalReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true });

    // New users today
    const today = startOfDay(new Date()).toISOString();
    const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    // Active users now (logged in within last 30 minutes)
    const { data: activeNowData } = await supabase
        .rpc('get_active_users_count', { minutes_threshold: 30 });

    return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        blockedUsers: blockedUsers || 0,
        totalReceipts: totalReceipts || 0,
        newUsersToday: newUsersToday || 0,
        activeUsersNow: activeNowData || 0
    };
}

/**
 * Get user growth data for charts (daily signups over time)
 */
export async function getUserGrowthData(days: number = 30): Promise<AnalyticsChartData[]> {
    const supabase = await createClient();
    const startDate = subDays(new Date(), days);

    const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

    if (!profiles) return [];

    // Group by date
    const grouped = profiles.reduce((acc, profile) => {
        const date = format(new Date(profile.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fill in missing dates with 0
    const result: AnalyticsChartData[] = [];
    for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
        result.push({
            date,
            value: grouped[date] || 0,
            label: format(new Date(date), 'MMM dd')
        });
    }

    return result;
}

/**
 * Calculate retention rate for cohorts
 * Cohort = users who signed up in the same week
 */
export async function getRetentionCohorts(weeks: number = 12): Promise<RetentionCohort[]> {
    const supabase = await createClient();

    // Get all users with their signup date and sessions
    const { data: users } = await supabase
        .from('profiles')
        .select(`
            id,
            created_at
        `);

    if (!users) return [];

    // Get all sessions
    const { data: sessions } = await supabase
        .from('user_sessions')
        .select('user_id, login_at');

    if (!sessions) return [];

    // Group users into weekly cohorts
    const cohorts: Map<string, { users: Set<string>, retainedUsers: Map<number, Set<string>> }> = new Map();

    users.forEach(user => {
        const signupDate = new Date(user.created_at);
        const weekStart = startOfDay(subDays(signupDate, signupDate.getDay()));
        const cohortKey = format(weekStart, 'yyyy-MM-dd');

        if (!cohorts.has(cohortKey)) {
            cohorts.set(cohortKey, {
                users: new Set(),
                retainedUsers: new Map()
            });
        }

        cohorts.get(cohortKey)!.users.add(user.id);

        // Check which weeks this user was active
        sessions
            .filter(s => s.user_id === user.id)
            .forEach(session => {
                const sessionDate = new Date(session.login_at);
                const weeksSinceSignup = Math.floor(differenceInDays(sessionDate, signupDate) / 7);

                if (weeksSinceSignup >= 0) {
                    const cohortData = cohorts.get(cohortKey)!;
                    if (!cohortData.retainedUsers.has(weeksSinceSignup)) {
                        cohortData.retainedUsers.set(weeksSinceSignup, new Set());
                    }
                    cohortData.retainedUsers.get(weeksSinceSignup)!.add(user.id);
                }
            });
    });

    // Convert to return format
    const result: RetentionCohort[] = Array.from(cohorts.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
        .slice(0, weeks)
        .map(([cohortKey, cohortData]) => {
            const retention: Record<string, number> = {};
            const totalUsers = cohortData.users.size;

            // Calculate retention percentage for each week
            for (let week = 0; week <= 12; week++) {
                const retained = cohortData.retainedUsers.get(week)?.size || 0;
                retention[`week${week}`] = totalUsers > 0
                    ? Math.round((retained / totalUsers) * 100)
                    : 0;
            }

            return {
                cohort: format(new Date(cohortKey), 'MMM dd, yyyy'),
                users: totalUsers,
                retention
            };
        });

    return result;
}

/**
 * Calculate user engagement score
 * Based on activity patterns, receipt uploads, session frequency
 */
export async function calculateEngagementScore(userId: string, days: number = 30): Promise<number> {
    const supabase = await createClient();
    const startDate = subDays(new Date(), days).toISOString();

    // Get user analytics
    const { data: analytics } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate);

    if (!analytics || analytics.length === 0) return 0;

    // Calculate weighted score
    const totalScore = analytics.reduce((score, day) => {
        return score + (
            (day.receipts_uploaded * 5) +
            (day.reminders_created * 3) +
            (day.packs_created * 10) +
            (day.sessions_count * 2) +
            (Math.min(day.total_session_minutes, 120) * 0.5)
        );
    }, 0);

    // Normalize to 0-100 scale
    const maxPossibleScore = days * 50; // Rough estimate
    return Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);
}

/**
 * Predict churn risk for a user
 * Returns a risk score (0-100) where higher = more likely to churn
 */
export async function predictChurnRisk(userId: string): Promise<number> {
    const supabase = await createClient();

    // Get user's profile and last 30 days of activity
    const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

    if (!profile) return 0;

    const accountAge = differenceInDays(new Date(), new Date(profile.created_at));

    // Get recent sessions (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('login_at')
        .eq('user_id', userId)
        .gte('login_at', thirtyDaysAgo);

    // Get receipts in last 30 days
    const { count: recentReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo);

    // Calculate churn indicators
    const sessionCount = recentSessions?.length || 0;
    const receiptsCount = recentReceipts || 0;

    let churnScore = 0;

    // No sessions in 30 days = high risk
    if (sessionCount === 0) churnScore += 40;
    else if (sessionCount < 3) churnScore += 25;
    else if (sessionCount < 7) churnScore += 10;

    // No receipts in 30 days = high risk
    if (receiptsCount === 0) churnScore += 30;
    else if (receiptsCount < 2) churnScore += 15;

    // New users (< 7 days) are higher risk
    if (accountAge < 7) churnScore += 15;

    // If last session was more than 14 days ago
    if (recentSessions && recentSessions.length > 0) {
        const lastSession = new Date(recentSessions[0].login_at);
        const daysSinceLastSession = differenceInDays(new Date(), lastSession);
        if (daysSinceLastSession > 14) churnScore += 15;
    }

    return Math.min(churnScore, 100);
}

/**
 * Get user segments using simple clustering
 * Segments: Power Users, Active Users, At Risk, Inactive
 */
export async function getUserSegments(): Promise<{
    segment: string;
    count: number;
    avgEngagement: number;
}[]> {
    const supabase = await createClient();

    // Get all users with their recent activity
    const { data: users } = await supabase
        .from('profiles')
        .select('id, created_at');

    if (!users) return [];

    const segments = {
        'Power Users': { count: 0, totalEngagement: 0 },
        'Active Users': { count: 0, totalEngagement: 0 },
        'At Risk': { count: 0, totalEngagement: 0 },
        'Inactive': { count: 0, totalEngagement: 0 }
    };

    for (const user of users) {
        const engagement = await calculateEngagementScore(user.id, 30);
        const churnRisk = await predictChurnRisk(user.id);

        let segment: keyof typeof segments;

        if (engagement >= 70) {
            segment = 'Power Users';
        } else if (engagement >= 40) {
            segment = 'Active Users';
        } else if (churnRisk >= 60) {
            segment = 'Inactive';
        } else {
            segment = 'At Risk';
        }

        segments[segment].count++;
        segments[segment].totalEngagement += engagement;
    }

    return Object.entries(segments).map(([segment, data]) => ({
        segment,
        count: data.count,
        avgEngagement: data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0
    }));
}
