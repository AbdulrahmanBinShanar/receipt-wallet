"use client";

import { AnalyticsChartData } from '@/types/database';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ReceiptUploadChartProps {
    data: AnalyticsChartData[];
}

export default function ReceiptUploadChart({ data }: ReceiptUploadChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
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
                    formatter={(value: any) => [value + ' receipts', 'Uploaded']}
                />
                <Bar
                    dataKey="value"
                    fill="hsl(var(--color-primary-600))"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
