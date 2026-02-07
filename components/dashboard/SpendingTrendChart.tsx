"use client";

import { useI18n } from "@/lib/i18n";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from "recharts";

interface SpendingDataPoint {
    date: string;
    amount: number;
    movingAvg?: number;
    upper?: number;
    lower?: number;
}

interface SpendingTrendChartProps {
    data: SpendingDataPoint[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
    const { locale } = useI18n();

    // Calculate moving average and confidence intervals
    const processData = (rawData: SpendingDataPoint[]): SpendingDataPoint[] => {
        const windowSize = 7; // 7-day moving average
        const result = rawData.map((point, index) => {
            if (index < windowSize - 1) {
                return {
                    ...point,
                    movingAvg: undefined,
                    upper: undefined,
                    lower: undefined,
                };
            }

            const window = rawData.slice(index - windowSize + 1, index + 1);
            const values = window.map((d) => d.amount);
            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

            // Calculate standard deviation
            const variance =
                values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            return {
                ...point,
                movingAvg: avg,
                upper: avg + 1.96 * stdDev, // 95% confidence interval
                lower: Math.max(0, avg - 1.96 * stdDev),
            };
        });

        return result;
    };

    const processedData = processData(data);

    return (
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01]">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/50 via-blue-500/50 to-purple-500/50 opacity-50 blur-sm group-hover:opacity-75 group-hover:blur-md transition-all duration-500" />

            {/* Glass card */}
            <div className="relative m-[1px] rounded-2xl bg-background-card/90 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out" />

                <div className="relative z-10">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground-muted mb-2">
                                {locale === "ar" ? "تحليل الإنفاق" : "Spending Trend Analysis"}
                            </h3>
                            <p className="text-sm text-foreground-muted flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-primary-500" />
                                {locale === "ar"
                                    ? "الإنفاق اليومي مع المتوسط المتحرك وفواصل الثقة"
                                    : "Daily spending with 7-day moving average & 95% confidence intervals"}
                            </p>
                        </div>
                        {/* Floating badge */}
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500/20 to-blue-500/20 backdrop-blur-sm border border-primary-500/30 text-xs font-medium text-foreground">
                            {locale === "ar" ? "30 يوم" : "30 Days"}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={processedData}>
                            <defs>
                                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value.toFixed(0)}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    backdropFilter: "blur(10px)",
                                }}
                                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                                itemStyle={{ color: "#fff" }}
                                formatter={(value: any) => [`${Number(value).toFixed(2)} SAR`, ""]}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                                iconType="line"
                            />

                            {/* Confidence Interval Area */}
                            <Area
                                type="monotone"
                                dataKey="upper"
                                stroke="none"
                                fill="url(#confidenceGradient)"
                                fillOpacity={1}
                                name="95% CI Upper"
                                legendType="none"
                            />
                            <Area
                                type="monotone"
                                dataKey="lower"
                                stroke="none"
                                fill="url(#confidenceGradient)"
                                fillOpacity={1}
                                name="95% CI Lower"
                                legendType="none"
                            />

                            {/* Moving Average */}
                            <Line
                                type="monotone"
                                dataKey="movingAvg"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name={locale === "ar" ? "المتوسط المتحرك" : "7-Day MA"}
                                strokeDasharray="5 5"
                            />

                            {/* Actual Spending */}
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#8b5cf6" }}
                                activeDot={{ r: 5 }}
                                name={locale === "ar" ? "الإنفاق الفعلي" : "Actual Spending"}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>

                    {/* Statistical Summary */}
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                        <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">
                                {locale === "ar" ? "المتوسط" : "Mean"}
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {data.length > 0 ? (data.reduce((sum, d) => sum + d.amount, 0) / data.length).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">
                                {locale === "ar" ? "الانحراف المعياري" : "Std Dev"}
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {data.length > 0 ? Math.sqrt(
                                    data.reduce(
                                        (sum, d) =>
                                            sum +
                                            Math.pow(
                                                d.amount - data.reduce((s, p) => s + p.amount, 0) / data.length,
                                                2
                                            ),
                                        0
                                    ) / data.length
                                ).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">
                                {locale === "ar" ? "الإجمالي" : "Total"}
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {data.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

