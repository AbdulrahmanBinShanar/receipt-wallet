import { getReceiptStats, getReceiptUploadTrends, getTopUsersByReceipts } from '@/lib/analytics/receiptStats';
import ReceiptStatsCards from '@/components/admin/ReceiptStatsCards';
import ReceiptUploadChart from '@/components/admin/charts/ReceiptUploadChart';
import TopUsersTable from '@/components/admin/TopUsersTable';

export default async function ReceiptsAnalyticsPage() {
    const receiptStats = await getReceiptStats();
    const uploadTrends = await getReceiptUploadTrends(30);
    const topUsers = await getTopUsersByReceipts(10);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Receipt Analytics</h1>
                <p className="text-foreground-muted">
                    Receipt processing statistics and trends
                </p>
            </div>

            {/* Receipt Stats Cards */}
            <ReceiptStatsCards stats={receiptStats} />

            {/* Upload Trends Chart */}
            <div className="bg-background-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Receipt Uploads (Last 30 Days)
                </h2>
                <ReceiptUploadChart data={uploadTrends} />
            </div>

            {/* Top Users by Receipts */}
            <div className="bg-background-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Top Users by Receipt Count
                </h2>
                <TopUsersTable users={topUsers} />
            </div>

            {/* Processing Insights */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Data Extraction
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-foreground-muted">Extraction Rate</span>
                            <span className="text-2xl font-bold text-foreground">
                                {receiptStats.extractionRate}%
                            </span>
                        </div>
                        <div className="w-full bg-background-elevated rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${receiptStats.extractionRate}%` }}
                            />
                        </div>
                        <p className="text-sm text-foreground-muted">
                            {receiptStats.extractedCount} of {receiptStats.totalReceipts} receipts have extracted data
                        </p>
                    </div>
                </div>

                <div className="bg-background-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Receipt Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-background-elevated rounded-lg">
                            <span className="text-foreground-muted">Avg Items per Receipt</span>
                            <span className="text-xl font-bold text-foreground">
                                {receiptStats.avgItemsPerReceipt}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background-elevated rounded-lg">
                            <span className="text-foreground-muted">Total Pages Scanned</span>
                            <span className="text-xl font-bold text-foreground">
                                {receiptStats.totalPages.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
