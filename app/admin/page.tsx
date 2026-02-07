import { getDashboardMetrics, getUserGrowthData } from '@/lib/analytics/calculations';
import MetricsGrid from '@/components/admin/MetricsGrid';
import UserGrowthChart from '@/components/admin/charts/GrowthChart';
import RecentActivity from '@/components/admin/RecentActivity';
import ActiveUsersCard from '@/components/admin/ActiveUsersCard';

export default async function AdminDashboard() {
    // Fetch metrics server-side
    const metrics = await getDashboardMetrics();
    const growthData = await getUserGrowthData(30);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-foreground-muted">
                    Real-time analytics and user management
                </p>
            </div>

            {/* Metrics Cards */}
            <MetricsGrid metrics={metrics} />

            {/* Active Users Real-time */}
            <ActiveUsersCard initialCount={metrics.activeUsersNow} />

            {/* User Growth Chart */}
            <div className="bg-background-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    User Growth (Last 30 Days)
                </h2>
                <UserGrowthChart data={growthData} />
            </div>

            {/* Recent Activity Feed */}
            <RecentActivity />
        </div>
    );
}
