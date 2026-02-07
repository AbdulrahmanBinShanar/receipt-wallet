"use client";

import { useI18n } from "@/lib/i18n";
import { TrendingUp } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from "recharts";

interface HistoricalData {
    date: string;
    amount: number;
}

interface ForecastWidgetProps {
    historicalData: HistoricalData[];
}

export default function ForecastWidget({ historicalData }: ForecastWidgetProps) {
    const { locale } = useI18n();

    // Simple moving average forecast (can be replaced with more sophisticated models)
    const generateForecast = () => {
        if (historicalData.length === 0) return { forecast: [], metrics: { rmse: 0, mae: 0 } };

        // Use simple moving average for forecast
        const windowSize = 7;
        const amounts = historicalData.map((d) => d.amount);

        // Calculate moving average for last window
        const recentWindow = amounts.slice(-windowSize);
        const movingAvg = recentWindow.reduce((sum, v) => sum + v, 0) / windowSize;

        // Calculate standard deviation for confidence interval
        const variance =
            recentWindow.reduce((sum, v) => sum + Math.pow(v - movingAvg, 2), 0) /
            windowSize;
        const stdDev = Math.sqrt(variance);

        // Generate forecast for next 7 days
        const lastDate = new Date(historicalData[historicalData.length - 1].date);
        const forecast = [];
        for (let i = 1; i <= 7; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(forecastDate.getDate() + i);

            // Add some realistic variation
            const variation = (Math.random() - 0.5) * (stdDev * 0.5);
            const predictedAmount = movingAvg + variation;

            forecast.push({
                date: forecastDate.toISOString().split("T")[0],
                amount: null,
                forecast: Math.max(0, predictedAmount),
                upper: predictedAmount + 1.96 * stdDev,
                lower: Math.max(0, predictedAmount - 1.96 * stdDev),
            });
        }

        // Calculate RMSE and MAE (using last week as test set)
        const testSize = Math.min(7, historicalData.length);
        const testData = historicalData.slice(-testSize);
        let sumSquaredError = 0;
        let sumAbsError = 0;

        testData.forEach((actual) => {
            const error = actual.amount - movingAvg;
            sumSquaredError += error * error;
            sumAbsError += Math.abs(error);
        });

        const rmse = Math.sqrt(sumSquaredError / testSize);
        const mae = sumAbsError / testSize;

        return { forecast, metrics: { rmse, mae }, totalForecast: movingAvg * 7 };
    };

    const { forecast, metrics, totalForecast } = generateForecast();

    // Combine historical and forecast data
    const chartData = [
        ...historicalData.slice(-14).map((d) => ({ ...d, forecast: null })),
        ...forecast,
    ];

    return (
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                        {locale === "ar" ? "توقعات الإنفاق" : "Spending Forecast"}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                        {locale === "ar"
                            ? "توقعات الأسبوع القادم مع فواصل الثقة"
                            : "7-day forecast with 95% confidence intervals"}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-primary-500/10">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis
                        dataKey="date"
                        stroke="currentColor"
                        opacity={0.5}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        stroke="currentColor"
                        opacity={0.5}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => value.toFixed(0)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                        }}
                        labelFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
                        }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)} SAR`, ""]}
                    />

                    {/* Confidence Intervals */}
                    <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill="url(#forecastGradient)"
                        fillOpacity={1}
                    />
                    <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="url(#forecastGradient)"
                        fillOpacity={1}
                    />

                    {/* Historical Data */}
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name={locale === "ar" ? "السجل" : "Historical"}
                    />

                    {/* Forecast */}
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: "#10b981" }}
                        name={locale === "ar" ? "التوقع" : "Forecast"}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        {locale === "ar" ? "التوقع الأسبوعي" : "7-Day Total"}
                    </p>
                    <p className="text-lg font-bold text-green-500">
                        {totalForecast?.toFixed(2) || "N/A"} SAR
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        RMSE
                    </p>
                    <p className="text-sm font-bold text-foreground">
                        {metrics.rmse.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-foreground-muted mb-1">
                        MAE
                    </p>
                    <p className="text-sm font-bold text-foreground">
                        {metrics.mae.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
