"use client";

import { useI18n } from "@/lib/i18n";

interface HeatmapCell {
    day: number; // 0-6 (Sun-Sat) or 1-31 (day of month)
    hour: number; // 0-23 or week number
    value: number;
}

interface TemporalHeatmapProps {
    data: HeatmapCell[];
    mode?: "dayOfWeek" | "dayOfMonth";
}

export default function TemporalHeatmap({
    data,
    mode = "dayOfWeek",
}: TemporalHeatmapProps) {
    const { locale } = useI18n();

    const daysOfWeek =
        locale === "ar"
            ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getColorIntensity = (value: number, max: number): string => {
        if (value === 0) return "bg-background-elevated";
        const intensity = value / max;
        if (intensity > 0.75) return "bg-primary-600";
        if (intensity > 0.5) return "bg-primary-500";
        if (intensity > 0.25) return "bg-primary-400";
        return "bg-primary-300";
    };

    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // Create grid: rows = days, cols = hours/weeks
    const grid: number[][] = [];
    const rows = mode === "dayOfWeek" ? 7 : 31;
    const cols = mode === "dayOfWeek" ? 24 : 4; // 24 hours or 4 weeks

    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(0);
    }

    data.forEach((cell) => {
        if (cell.day < rows && cell.hour < cols) {
            grid[cell.day][cell.hour] = cell.value;
        }
    });

    return (
        <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                    {locale === "ar" ? "النمط الزمني" : "Temporal Spending Pattern"}
                </h3>
                <p className="text-sm text-foreground-muted">
                    {mode === "dayOfWeek"
                        ? locale === "ar"
                            ? "الإنفاق حسب اليوم والساعة"
                            : "Spending by day of week & hour"
                        : locale === "ar"
                            ? "الإنفاق حسب يوم الشهر والأسبوع"
                            : "Spending by day of month & week"}
                </p>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Column Headers (Hours or Weeks) */}
                    <div className="flex gap-0.5 mb-1 ml-16">
                        {Array.from({ length: cols }, (_, i) => (
                            <div
                                key={i}
                                className="text-xs text-foreground-muted text-center"
                                style={{ width: mode === "dayOfWeek" ? "30px" : "60px" }}
                            >
                                {mode === "dayOfWeek" ? (i === 0 ? "12AM" : i === 12 ? "12PM" : "") : `W${i + 1}`}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Grid */}
                    {grid.map((row, dayIndex) => (
                        <div key={dayIndex} className="flex gap-0.5 mb-0.5">
                            {/* Row Header (Day) */}
                            <div className="w-16 text-xs text-foreground-muted flex items-center">
                                {mode === "dayOfWeek"
                                    ? daysOfWeek[dayIndex]
                                    : `Day ${dayIndex + 1}`}
                            </div>

                            {/* Cells */}
                            {row.map((value, hourIndex) => (
                                <div
                                    key={hourIndex}
                                    className={`${getColorIntensity(
                                        value,
                                        maxValue
                                    )} rounded transition-all hover:scale-110 hover:shadow-lg cursor-pointer group relative`}
                                    style={{
                                        width: mode === "dayOfWeek" ? "30px" : "60px",
                                        height: "30px",
                                    }}
                                    title={`${value.toFixed(2)} SAR`}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {value.toFixed(2)} SAR
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-xs text-foreground-muted">
                    {locale === "ar" ? "أقل" : "Less"}
                </span>
                <div className="flex gap-1">
                    {[0.1, 0.3, 0.5, 0.7, 1].map((intensity, i) => (
                        <div
                            key={i}
                            className={`w-6 h-6 rounded ${getColorIntensity(
                                maxValue * intensity,
                                maxValue
                            )}`}
                        />
                    ))}
                </div>
                <span className="text-xs text-foreground-muted">
                    {locale === "ar" ? "أكثر" : "More"}
                </span>
            </div>
        </div>
    );
}
