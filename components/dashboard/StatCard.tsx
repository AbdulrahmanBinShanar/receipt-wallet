"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number; // Percentage change
    stdDev?: number; // Standard deviation
    icon?: React.ReactNode;
    sparklineData?: number[]; // For mini chart
    gradient?: string;
}

export default function StatCard({
    title,
    value,
    subtitle,
    change,
    stdDev,
    icon,
    sparklineData,
    gradient = "from-primary-600 to-primary-700",
}: StatCardProps) {
    const getTrendIcon = () => {
        if (change === undefined || change === 0) return <Minus className="h-4 w-4" />;
        return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (change === undefined || change === 0) return "text-foreground-muted";
        return change > 0 ? "text-green-500" : "text-red-500";
    };

    // Simple sparkline SVG generator with gradient
    const renderSparkline = () => {
        if (!sparklineData || sparklineData.length === 0) return null;

        const max = Math.max(...sparklineData);
        const min = Math.min(...sparklineData);
        const range = max - min || 1;
        const width = 120;
        const height = 40;
        const step = width / (sparklineData.length - 1);

        const points = sparklineData
            .map((value, index) => {
                const x = index * step;
                const y = height - ((value - min) / range) * height;
                return `${x},${y}`;
            })
            .join(" ");

        return (
            <svg width={width} height={height} className="opacity-70">
                <defs>
                    <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                <polyline
                    points={points}
                    fill="none"
                    stroke="url(#sparkline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-blue-500 to-primary-600 opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />

            {/* Glass card */}
            <div className="relative m-[2px] rounded-2xl bg-background-card/80 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                {/* Floating background icon with pulse */}
                {icon && (
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-all duration-300 group-hover:scale-110">
                        <div className="scale-[2.5] animate-pulse">{icon}</div>
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 space-y-4">
                    {/* Title */}
                    <div className="flex items-center justify-between">
                        <p className="text-foreground-muted text-sm font-semibold uppercase tracking-wider">
                            {title}
                        </p>
                        {icon && (
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <div className="group-hover:scale-110 transition-transform">
                                    {icon}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Value and Trend */}
                    <div className="space-y-2">
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground-muted">
                                {value}
                            </h3>
                            {change !== undefined && (
                                <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${change > 0 ? 'bg-green-500/20 text-green-500' :
                                        change < 0 ? 'bg-red-500/20 text-red-500' :
                                            'bg-gray-500/20 text-gray-500'
                                    }`}>
                                    {getTrendIcon()}
                                    <span>{Math.abs(change).toFixed(1)}%</span>
                                </div>
                            )}
                        </div>

                        {/* Subtitle and Stats */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                {subtitle && (
                                    <p className="text-xs font-medium text-foreground-muted bg-background-elevated/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-border/50">
                                        {subtitle}
                                    </p>
                                )}
                                {stdDev !== undefined && (
                                    <p className="text-xs text-foreground-muted/70 font-mono">
                                        σ: {stdDev.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Sparkline */}
                            {sparklineData && (
                                <div className="ml-auto text-primary-500">
                                    {renderSparkline()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
