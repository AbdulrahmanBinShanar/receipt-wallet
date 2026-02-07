"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Wallet, Receipt, MapPin, TrendingUp, Upload, Scan, Plus } from "lucide-react";
import StarField from "@/components/ui/StarField";
import StatCard from "@/components/dashboard/StatCard";
import SpendingTrendChart from "@/components/dashboard/SpendingTrendChart";
import CategoryDistributionChart from "@/components/dashboard/CategoryDistributionChart";
import TemporalHeatmap from "@/components/dashboard/TemporalHeatmap";
import MerchantAnalysisChart from "@/components/dashboard/MerchantAnalysisChart";
import AnomalyDetectionWidget from "@/components/dashboard/AnomalyDetectionWidget";
import ForecastWidget from "@/components/dashboard/ForecastWidget";
import { Receipt as ReceiptType } from "@/lib/services/receiptService";

export default function DashboardPage() {
    const { locale } = useI18n();
    const [receipts, setReceipts] = useState<ReceiptType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/receipts");
            if (response.ok) {
                const data = await response.json();
                setReceipts(data.receipts || []);
            }
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Process data for visualizations
    const processData = () => {
        // Calculate total spending
        const totalSpending = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
        const lastMonthTotal = receipts
            .filter((r) => {
                const date = new Date(r.date || r.created_at);
                const now = new Date();
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return date >= lastMonth;
            })
            .reduce((sum, r) => sum + (r.total || 0), 0);

        // Calculate spending trend
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split("T")[0];
        });

        const trendData = last30Days.map((date) => {
            const dayReceipts = receipts.filter(
                (r) => (r.date || r.created_at).split("T")[0] === date
            );
            const amount = dayReceipts.reduce((sum, r) => sum + (r.total || 0), 0);
            return { date, amount };
        });

        // Category distribution
        const categoryMap = new Map<string, { amount: number; count: number }>();
        receipts.forEach((r) => {
            const category = r.category || "Other";
            const existing = categoryMap.get(category) || { amount: 0, count: 0 };
            categoryMap.set(category, {
                amount: existing.amount + (r.total || 0),
                count: existing.count + 1,
            });
        });

        const categoryData = Array.from(categoryMap.entries()).map(
            ([category, data]) => ({
                category,
                amount: data.amount,
                count: data.count,
            })
        );

        // Merchant analysis
        const merchantMap = new Map<
            string,
            { totalSpending: number; visitCount: number }
        >();
        receipts.forEach((r) => {
            const merchant = r.merchant || "Unknown";
            const existing = merchantMap.get(merchant) || {
                totalSpending: 0,
                visitCount: 0,
            };
            merchantMap.set(merchant, {
                totalSpending: existing.totalSpending + (r.total || 0),
                visitCount: existing.visitCount + 1,
            });
        });

        const merchantData = Array.from(merchantMap.entries()).map(
            ([merchant, data]) => ({
                merchant,
                totalSpending: data.totalSpending,
                visitCount: data.visitCount,
            })
        );

        // Most visited merchant
        const mostVisited = merchantData.sort(
            (a, b) => b.visitCount - a.visitCount
        )[0];

        // Temporal heatmap data (day of week x hour)
        const heatmapData = receipts.map((r) => {
            const date = new Date(r.date || r.created_at);
            return {
                day: date.getDay(),
                hour: date.getHours(),
                value: r.total || 0,
            };
        });

        // Aggregate heatmap
        const heatmapAggregated: { day: number; hour: number; value: number }[] = [];
        const heatmapMap = new Map<string, number>();
        heatmapData.forEach((cell) => {
            const key = `${cell.day}-${cell.hour}`;
            heatmapMap.set(key, (heatmapMap.get(key) || 0) + cell.value);
        });
        heatmapMap.forEach((value, key) => {
            const [day, hour] = key.split("-").map(Number);
            heatmapAggregated.push({ day, hour, value });
        });

        // Anomaly detection transactions
        const transactions = receipts.map((r) => ({
            id: r.id,
            merchant: r.merchant || "Unknown",
            amount: r.total || 0,
            date: r.date || r.created_at,
            category: r.category,
        }));

        // Calculate statistics
        const amounts = receipts.map((r) => r.total || 0);
        const mean = amounts.reduce((sum, v) => sum + v, 0) / amounts.length || 0;
        const variance =
            amounts.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            amounts.length || 0;
        const stdDev = Math.sqrt(variance);

        // Calculate spending change
        const previousMonthTotal = receipts
            .filter((r) => {
                const date = new Date(r.date || r.created_at);
                const now = new Date();
                const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return date >= twoMonthsAgo && date < lastMonth;
            })
            .reduce((sum, r) => sum + (r.total || 0), 0);

        const spendingChange =
            previousMonthTotal > 0
                ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
                : 0;

        const receiptChange =
            receipts.length > 0
                ? ((receipts.filter(
                    (r) =>
                        new Date(r.date || r.created_at).getMonth() === new Date().getMonth()
                ).length -
                    receipts.filter((r) => {
                        const date = new Date(r.date || r.created_at);
                        return (
                            date.getMonth() === new Date().getMonth() - 1 &&
                            date.getFullYear() === new Date().getFullYear()
                        );
                    }).length) /
                    (receipts.filter((r) => {
                        const date = new Date(r.date || r.created_at);
                        return (
                            date.getMonth() === new Date().getMonth() - 1 &&
                            date.getFullYear() === new Date().getFullYear()
                        );
                    }).length || 1)) *
                100
                : 0;

        // Sparkline data (last 7 days)
        const sparklineData = trendData.slice(-7).map((d) => d.amount);

        return {
            totalSpending: lastMonthTotal,
            totalReceipts: receipts.length,
            mostVisited,
            trendData,
            categoryData,
            merchantData,
            heatmapData: heatmapAggregated,
            transactions,
            stdDev,
            spendingChange,
            receiptChange,
            sparklineData,
        };
    };

    const data = processData();

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return locale === "ar" ? "صباح الخير" : "Good Morning";
        if (hour < 18) return locale === "ar" ? "مساء الخير" : "Good Afternoon";
        return locale === "ar" ? "مساء الخير" : "Good Evening";
    };

    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <StarField />
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted">
                        {locale === "ar" ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Effects */}
            <StarField />
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-background/80 z-10" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 md:p-8 max-w-[1800px] mx-auto space-y-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        {/* Title Section */}
                        <div className="space-y-3">
                            {/* Animated Greeting Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/20 to-blue-500/20 backdrop-blur-sm border border-primary-500/30 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-foreground">
                                    {locale === "ar" ? "نشط الآن" : "Active Now"}
                                </span>
                            </div>

                            {/* Main Greeting */}
                            <h1 className="text-5xl md:text-6xl font-bold">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-blue-500 to-primary-600 dark:from-primary-300 dark:via-blue-400 dark:to-primary-500 animate-gradient bg-[length:200%_auto]">
                                    {getGreeting()}
                                </span>
                                <span className="inline-block ml-2 animate-wave">👋</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-foreground-muted text-lg md:text-xl flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                                {locale === "ar"
                                    ? "نظرة تحليلية شاملة على إنفاقك"
                                    : "Comprehensive analytical overview of your spending"}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {/* Upload Button - Glassmorphism Style */}
                            <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]">
                                {/* Animated gradient border */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-blue-500 to-primary-600 opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />

                                {/* Glass card */}
                                <a
                                    href="/app/vault"
                                    className="relative m-[2px] rounded-2xl bg-background-card/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 hover:bg-background-card/90"
                                >
                                    {/* Animated shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                    <div className="relative flex items-center gap-3">
                                        <Upload className="h-6 w-6 text-primary-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold text-foreground">{locale === "ar" ? "رفع إيصال" : "Upload Receipt"}</span>
                                    </div>
                                </a>
                            </div>

                            {/* Scan Button - Glassmorphism Style */}
                            <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]">
                                {/* Animated gradient border */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />

                                {/* Glass card */}
                                <a
                                    href="/app/vault?scan=true"
                                    className="relative m-[2px] rounded-2xl bg-background-card/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 hover:bg-background-card/90"
                                >
                                    {/* Animated shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                    <div className="relative flex items-center gap-3">
                                        <Scan className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold text-foreground">{locale === "ar" ? "مسح إيصال" : "Scan Receipt"}</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistical Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title={locale === "ar" ? "إجمالي الإنفاق" : "Total Spending"}
                        value={`${data.totalSpending.toFixed(2)} SAR`}
                        subtitle={locale === "ar" ? "هذا الشهر" : "This Month"}
                        change={data.spendingChange}
                        stdDev={data.stdDev}
                        icon={<Wallet className="h-12 w-12" />}
                        sparklineData={data.sparklineData}
                        gradient="from-primary-600 to-primary-700"
                    />

                    <StatCard
                        title={locale === "ar" ? "عدد الإيصالات" : "Total Receipts"}
                        value={data.totalReceipts}
                        subtitle={locale === "ar" ? "جميع الإيصالات" : "All Time"}
                        change={data.receiptChange}
                        icon={<Receipt className="h-12 w-12" />}
                        gradient="from-blue-600 to-blue-700"
                    />

                    <StatCard
                        title={locale === "ar" ? "الأكثر زيارة" : "Most Visited"}
                        value={data.mostVisited?.merchant || "N/A"}
                        subtitle={`${data.mostVisited?.visitCount || 0} ${locale === "ar" ? "زيارات" : "visits"
                            }`}
                        icon={<MapPin className="h-12 w-12" />}
                        gradient="from-emerald-600 to-emerald-700"
                    />
                </div>

                {/* Main Visualizations Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <SpendingTrendChart data={data.trendData} />
                    <CategoryDistributionChart data={data.categoryData} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MerchantAnalysisChart data={data.merchantData} />
                    <TemporalHeatmap data={data.heatmapData} mode="dayOfWeek" />
                </div>

                {/* AI/Statistical Widgets */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnomalyDetectionWidget transactions={data.transactions} />
                    <ForecastWidget historicalData={data.trendData} />
                </div>
            </div>
        </div>
    );
}
