import { createClient } from '@/lib/supabase/server';
import UserManagementClient from '@/components/admin/UserManagementClient';

export default async function UsersPage() {
    const supabase = await createClient();

    // Fetch initial users data with stats
    const { data: users } = await supabase
        .from('profiles')
        .select(`
            *,
            receipts:receipts(count)
        `)
        .order('created_at', { ascending: false });

    // Format users data
    const usersWithStats = users?.map(user => ({
        ...user,
        receipts_count: user.receipts?.[0]?.count || 0,
        last_login: null, // Will be fetched on client-side
        engagement_score: 0 // Will be calculated on client-side
    })) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-foreground-muted">
                    View, manage, and analyze user accounts
                </p>
            </div>

            <UserManagementClient initialUsers={usersWithStats} />
        </div>
    );
}
