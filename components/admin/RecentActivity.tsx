"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeToUserActivity } from '@/lib/analytics/realtime';
import { formatDistanceToNow } from 'date-fns';
import {
    LogIn,
    LogOut,
    Upload,
    Trash2,
    Bell,
    Package,
    User,
    ShieldOff,
    ShieldCheck
} from 'lucide-react';

const activityIcons: Record<string, any> = {
    login: LogIn,
    logout: LogOut,
    receipt_upload: Upload,
    receipt_delete: Trash2,
    reminder_create: Bell,
    pack_create: Package,
    profile_update: User,
    blocked: ShieldOff,
    unblocked: ShieldCheck,
};

export default function RecentActivity() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('user_activity_logs')
                .select(`
                    *,
                    profiles:user_id (full_name, id)
                `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                setActivities(data);
            }
            setLoading(false);
        };

        fetchRecentActivity();

        // Subscribe to new activities
        const unsubscribe = subscribeToUserActivity((newActivity) => {
            setActivities(prev => [newActivity, ...prev].slice(0, 10));
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <div className="bg-background-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Recent Activity
                </h2>
                <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-background-elevated rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
                Recent Activity
            </h2>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <p className="text-foreground-muted text-center py-8">
                        No recent activity
                    </p>
                ) : (
                    activities.map((activity) => {
                        const Icon = activityIcons[activity.activity_type] || User;

                        return (
                            <div
                                key={activity.id}
                                className="flex items-center gap-3 p-3 bg-background-elevated rounded-lg hover:bg-background-hover transition-smooth"
                            >
                                <div className="p-2 bg-primary-600/10 rounded-lg">
                                    <Icon className="h-4 w-4 text-primary-600" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        <span className="font-medium">
                                            {activity.profiles?.full_name || 'User'}
                                        </span>
                                        {' '}
                                        <span className="text-foreground-muted">
                                            {activity.activity_type.replace(/_/g, ' ')}
                                        </span>
                                    </p>
                                    <p className="text-xs text-foreground-muted">
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
