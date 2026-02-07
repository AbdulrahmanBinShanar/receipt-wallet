"use client";

import { useI18n } from "@/lib/i18n";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface CategoryData {
    category: string;
    amount: number;
    count: number;
}

interface CategoryDistributionChartProps {
    data: CategoryData[];
}

const COLORS = [
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
];

export default function CategoryDistributionChart({
    data,
}: CategoryDistributionChartProps) {
    const { locale } = useI18n();

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const dataWithPercentage = data.map((item) => ({
        ...item,
        percentage: ((item.amount / total) * 100).toFixed(1),
        avgPerTransaction: (item.amount / item.count).toFixed(2),
    }));

    // Calculate statistics (with guards for empty data)
    const amounts = data.map((d) => d.amount);
    const mean = amounts.length > 0 ? amounts.reduce((sum, v) => sum + v, 0) / amounts.length : 0;
    const sortedAmounts = [...amounts].sort((a, b) => a - b);
    const median = sortedAmounts.length > 0 ? sortedAmounts[Math.floor(sortedAmounts.length / 2)] : 0;

    return (
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                    {locale === "ar" ? "توزيع الفئات" : "Category Distribution"}
                </h3>
                <p className="text-sm text-foreground-muted">
                    {locale === "ar"
                        ? "تحليل الإنفاق حسب الفئة مع الإحصائيات"
                        : "Spending breakdown by category with statistics"}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dataWithPercentage}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="amount"
                                label={({ percentage }) => `${percentage}%`}
                                labelLine={false}
                            >
                                {dataWithPercentage.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    backdropFilter: "blur(10px)",
                                }}
                                formatter={(value: any) => [
                                    `${Number(value).toFixed(2)} SAR`,
                                    "",
                                ]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "12px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataWithPercentage} layout="horizontal">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                opacity={0.1}
                            />
                            <XAxis
                                type="number"
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="category"
                                stroke="currentColor"
                                opacity={0.5}
                                tick={{ fontSize: 11 }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: any) => [
                                    `${Number(value).toFixed(2)} SAR`,
                                    "",
                                ]}
                            />
                            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                                {dataWithPercentage.map((entry, index) => (
                                    <Cell
                                        key={`bar-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Statistical Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الفئات" : "Categories"}
                    </p>
                    <p className="text-lg font-bold text-foreground">{data.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "المتوسط" : "Mean"}
                    </p>
                    <p className="text-lg font-bold text-foreground">{(mean || 0).toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الوسيط" : "Median"}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                        {(median || 0).toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "الإجمالي" : "Total"}
                    </p>
                    <p className="text-lg font-bold text-foreground">{total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
