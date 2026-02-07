"use client";

import { useI18n } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";

interface Transaction {
    id: string;
    merchant: string;
    amount: number;
    date: string;
    category?: string;
}

interface AnomalyDetectionWidgetProps {
    transactions: Transaction[];
}

export default function AnomalyDetectionWidget({
    transactions,
}: AnomalyDetectionWidgetProps) {
    const { locale } = useI18n();

    // Calculate Z-scores and detect anomalies
    const detectAnomalies = () => {
        if (transactions.length === 0) {
            return { anomalies: [], mean: 0, stdDev: 0 };
        }

        const amounts = transactions.map((t) => t.amount);
        const mean = amounts.reduce((sum, v) => sum + v, 0) / amounts.length;
        const variance =
            amounts.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            amounts.length;
        const stdDev = Math.sqrt(variance);

        const threshold = 2; // Z-score threshold (2 standard deviations)

        const anomalies = transactions
            .map((t) => ({
                ...t,
                zScore: stdDev > 0 ? (t.amount - mean) / stdDev : 0,
            }))
            .filter((t) => Math.abs(t.zScore) > threshold)
            .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
            .slice(0, 5); // Top 5 anomalies

        return { anomalies, mean, stdDev };
    };

    const { anomalies, mean, stdDev } = detectAnomalies();

    // Box plot statistics
    const amounts = transactions.map((t) => t.amount).sort((a, b) => a - b);
    const q1 = amounts.length > 0 ? amounts[Math.floor(amounts.length * 0.25)] || 0 : 0;
    const median = amounts.length > 0 ? amounts[Math.floor(amounts.length * 0.5)] || 0 : 0;
    const q3 = amounts.length > 0 ? amounts[Math.floor(amounts.length * 0.75)] || 0 : 0;
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    return (
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                        {locale === "ar" ? "كشف الشذوذ" : "Anomaly Detection"}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                        {locale === "ar"
                            ? "معاملات غير عادية (Z-score > 2)"
                            : "Unusual transactions (Z-score > 2σ)"}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
            </div>

            {/* Box Plot Visualization */}
            {amounts.length > 0 ? (
                <div className="mb-6">
                    <div className="relative h-20 bg-background-elevated rounded-lg p-4">
                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full px-4">
                            {/* Whiskers */}
                            <div
                                className="absolute h-0.5 bg-foreground-muted"
                                style={{
                                    left: `${((Math.max(amounts[0], lowerFence) - amounts[0]) / (amounts[amounts.length - 1] - amounts[0] || 1)) * 100}%`,
                                    width: `${((Math.min(amounts[amounts.length - 1], upperFence) - Math.max(amounts[0], lowerFence)) / (amounts[amounts.length - 1] - amounts[0] || 1)) * 100}%`,
                                }}
                            />

                            {/* Box (IQR) */}
                            <div
                                className="absolute h-12 bg-primary-500/30 border-2 border-primary-500 rounded"
                                style={{
                                    left: `${((q1 - amounts[0]) / (amounts[amounts.length - 1] - amounts[0] || 1)) * 100}%`,
                                    width: `${((q3 - q1) / (amounts[amounts.length - 1] - amounts[0] || 1)) * 100}%`,
                                }}
                            >
                                {/* Median line */}
                                <div
                                    className="absolute h-full w-0.5 bg-primary-600"
                                    style={{
                                        left: `${((median - q1) / (q3 - q1 || 1)) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* Outliers */}
                            {anomalies.map((anomaly, idx) => (
                                <div
                                    key={idx}
                                    className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                    style={{
                                        left: `${((anomaly.amount - amounts[0]) / (amounts[amounts.length - 1] - amounts[0] || 1)) * 100}%`,
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                    }}
                                    title={`${anomaly.merchant}: ${anomaly.amount.toFixed(2)} SAR`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Box Plot Labels */}
                    <div className="flex justify-between mt-2 text-xs text-foreground-muted">
                        <span>Min: {amounts[0]?.toFixed(0) || 0}</span>
                        <span>Q1: {q1.toFixed(0)}</span>
                        <span>Median: {median.toFixed(0)}</span>
                        <span>Q3: {q3.toFixed(0)}</span>
                        <span>Max: {amounts[amounts.length - 1]?.toFixed(0) || 0}</span>
                    </div>
                </div>
            ) : (
                <div className="mb-6 text-center py-8 text-sm text-foreground-muted">
                    {locale === "ar" ? "لا توجد بيانات كافية" : "No data available"}
                </div>
            )}

            {/* Anomalous Transactions List */}
            <div className="space-y-2">
                {anomalies.length === 0 ? (
                    <p className="text-center text-sm text-foreground-muted py-4">
                        {locale === "ar" ? "لا توجد شذوذات مكتشفة" : "No anomalies detected"}
                    </p>
                ) : (
                    anomalies.map((anomaly, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                    {anomaly.merchant}
                                </p>
                                <p className="text-xs text-foreground-muted">
                                    {new Date(anomaly.date).toLocaleDateString(
                                        locale === "ar" ? "ar-SA" : "en-US"
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-red-500">
                                    {anomaly.amount.toFixed(2)} SAR
                                </p>
                                <p className="text-xs text-foreground-muted">
                                    Z: {anomaly.zScore.toFixed(2)}σ
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "المتوسط" : "Mean"}
                    </p>
                    <p className="text-sm font-bold text-foreground">{mean.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الانحراف المعياري" : "Std Dev (σ)"}
                    </p>
                    <p className="text-sm font-bold text-foreground">{stdDev.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الشذوذات" : "Anomalies"}
                    </p>
                    <p className="text-sm font-bold text-foreground">{anomalies.length}</p>
                </div>
            </div>
        </div>
    );
}
