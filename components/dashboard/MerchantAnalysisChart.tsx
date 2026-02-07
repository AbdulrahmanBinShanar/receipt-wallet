"use client";

import { useI18n } from "@/lib/i18n";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ScatterChart,
    Scatter,
    ZAxis,
} from "recharts";

interface MerchantData {
    merchant: string;
    totalSpending: number;
    visitCount: number;
}

interface MerchantAnalysisChartProps {
    data: MerchantData[];
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function MerchantAnalysisChart({
    data,
}: MerchantAnalysisChartProps) {
    const { locale } = useI18n();

    // Sort by total spending and take top 10
    const topMerchants = [...data]
        .sort((a, b) => b.totalSpending - a.totalSpending)
        .slice(0, 10);

    // Calculate average spending per visit
    const enrichedData = topMerchants.map((item) => ({
        ...item,
        avgPerVisit: item.totalSpending / item.visitCount,
    }));

    return (
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                    {locale === "ar" ? "تحليل التجار" : "Top Merchants Analysis"}
                </h3>
                <p className="text-sm text-foreground-muted">
                    {locale === "ar"
                        ? "أفضل 10 تجار حسب الإنفاق والتكرار"
                        : "Top 10 merchants by spending & visit frequency"}
                </p>
            </div>

            <div className="space-y-8">
                {/* Horizontal Bar Chart */}
                <div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={enrichedData} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                opacity={0.1}
                            />
                            <XAxis
                                type="number"
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value.toFixed(0)}`}
                            />
                            <YAxis
                                type="category"
                                dataKey="merchant"
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 12 }}
                                width={120}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    backdropFilter: "blur(10px)",
                                }}
                                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                                formatter={(value: any, name: string) => {
                                    if (name === "totalSpending")
                                        return [`${Number(value).toFixed(2)} SAR`, locale === "ar" ? "الإجمالي" : "Total"];
                                    if (name === "visitCount")
                                        return [value, locale === "ar" ? "الزيارات" : "Visits"];
                                    return [value, name];
                                }}
                            />
                            <Bar dataKey="totalSpending" radius={[0, 8, 8, 0]}>
                                {enrichedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Scatter Plot: Frequency vs. Amount */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                        {locale === "ar" ? "العلاقة بين التكرار والإنفاق" : "Frequency vs. Spending"}
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                            <XAxis
                                type="number"
                                dataKey="visitCount"
                                name={locale === "ar" ? "عدد الزيارات" : "Visit Count"}
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 11 }}
                                label={{
                                    value: locale === "ar" ? "عدد الزيارات" : "Visit Count",
                                    position: "insideBottom",
                                    offset: -5,
                                    style: { fontSize: 12 },
                                }}
                            />
                            <YAxis
                                type="number"
                                dataKey="totalSpending"
                                name={locale === "ar" ? "الإنفاق الإجمالي" : "Total Spending"}
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 11 }}
                                label={{
                                    value: locale === "ar" ? "الإنفاق" : "Spending",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fontSize: 12 },
                                }}
                            />
                            <ZAxis range={[100, 500]} />
                            <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: any, name: string, props: any) => {
                                    if (name === "totalSpending")
                                        return [`${Number(value).toFixed(2)} SAR`, locale === "ar" ? "الإنفاق" : "Spending"];
                                    if (name === "visitCount")
                                        return [value, locale === "ar" ? "الزيارات" : "Visits"];
                                    return [value, name];
                                }}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload[0]) {
                                        return payload[0].payload.merchant;
                                    }
                                    return label;
                                }}
                            />
                            <Scatter name="Merchants" data={enrichedData} fill="#8b5cf6" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الأكثر زيارة" : "Most Visited"}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                        {enrichedData.sort((a, b) => b.visitCount - a.visitCount)[0]?.merchant || "N/A"}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الأكثر إنفاقاً" : "Highest Spending"}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                        {enrichedData[0]?.merchant || "N/A"}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "متوسط الزيارة" : "Avg per Visit"}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                        {(
                            enrichedData.reduce((sum, d) => sum + d.avgPerVisit, 0) /
                            enrichedData.length
                        ).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
