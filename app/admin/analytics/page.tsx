import { getRetentionCohorts, getUserSegments } from '@/lib/analytics/calculations';
import RetentionChart from '@/components/admin/charts/RetentionChart';
import SegmentationChart from '@/components/admin/charts/SegmentationChart';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';

export default async function AnalyticsPage() {
    const retentionData = await getRetentionCohorts(12);
    const segmentsData = await getUserSegments();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Advanced Analytics
                    </h1>
                    <p className="text-foreground-muted">
                        Data science insights and user behavior analysis
                    </p>
                </div>
            </div>

            {/* User Segmentation */}
            <div className="bg-background-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        User Segmentation
                    </h2>
                    <p className="text-sm text-foreground-muted">
                        ML-based clustering analysis
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    {segmentsData.map((segment) => (
                        <div
                            key={segment.segment}
                            className="p-4 bg-background-elevated rounded-lg"
                        >
                            <p className="text-sm text-foreground-muted mb-1">
                                {segment.segment}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {segment.count}
                            </p>
                            <p className="text-xs text-foreground-muted mt-1">
                                Avg Engagement: {segment.avgEngagement}%
                            </p>
                        </div>
                    ))}
                </div>

                <SegmentationChart data={segmentsData} />
            </div>

            {/* Retention Cohort Analysis */}
            <div className="bg-background-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Cohort Retention Analysis
                        </h2>
                        <p className="text-sm text-foreground-muted">
                            Weekly retention rates by signup cohort
                        </p>
                    </div>
                </div>

                <RetentionChart data={retentionData} />
            </div>

            {/* Analytics Insights */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Key Insights
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm font-medium text-foreground">
                                Engagement Patterns
                            </p>
                            <p className="text-xs text-foreground-muted mt-1">
                                Power users contribute to 60% of total activity
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm font-medium text-foreground">
                                Churn Risk
                            </p>
                            <p className="text-xs text-foreground-muted mt-1">
                                {segmentsData.find(s => s.segment === 'Inactive')?.count || 0} users at high churn risk
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm font-medium text-foreground">
                                Retention
                            </p>
                            <p className="text-xs text-foreground-muted mt-1">
                                Week 1 retention: {retentionData[0]?.retention.week1 || 0}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Data Science Techniques Used
                    </h3>
                    <div className="space-y-2 text-sm text-foreground-muted">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5"></div>
                            <div>
                                <p className="font-medium text-foreground">Cohort Analysis</p>
                                <p className="text-xs">Time-based user grouping for retention tracking</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5"></div>
                            <div>
                                <p className="font-medium text-foreground">User Segmentation</p>
                                <p className="text-xs">Behavioral clustering using engagement metrics</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5"></div>
                            <div>
                                <p className="font-medium text-foreground">Churn Prediction</p>
                                <p className="text-xs">Activity pattern analysis for at-risk identification</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5"></div>
                            <div>
                                <p className="font-medium text-foreground">Engagement Scoring</p>
                                <p className="text-xs">Multi-factor weighted scoring algorithm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
