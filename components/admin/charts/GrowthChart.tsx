"use client";

import { AnalyticsChartData } from '@/types/database';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface GrowthChartProps {
    data: AnalyticsChartData[];
}

export default function UserGrowthChart({ data }: GrowthChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--color-primary-600))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--color-primary-600))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis
                    dataKey="label"
                    stroke="hsl(var(--color-foreground-muted))"
                    fontSize={12}
                />
                <YAxis
                    stroke="hsl(var(--color-foreground-muted))"
                    fontSize={12}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--color-background-card))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--color-foreground))'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--color-primary-600))"
                    fillOpacity={1}
                    fill="url(#colorGrowth)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
