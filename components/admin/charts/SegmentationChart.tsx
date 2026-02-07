"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface SegmentationChartProps {
    data: {
        segment: string;
        count: number;
        avgEngagement: number;
    }[];
}

const COLORS = {
    'Power Users': 'hsl(var(--color-primary-600))',
    'Active Users': 'hsl(142, 76%, 36%)', // green
    'At Risk': 'hsl(38, 92%, 50%)', // yellow/orange
    'Inactive': 'hsl(0, 84%, 60%)' // red
};

export default function SegmentationChart({ data }: SegmentationChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis
                    dataKey="segment"
                    stroke="hsl(var(--color-foreground-muted))"
                    fontSize={12}
                />
                <YAxis
                    stroke="hsl(var(--color-foreground-muted))"
                    fontSize={12}
                    label={{
                        value: 'User Count',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--color-foreground-muted))' }
                    }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--color-background-card))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--color-foreground))'
                    }}
                    formatter={(value, name) => {
                        if (!value) return ['0', name];
                        if (name === 'count') return [String(value), 'Users'];
                        if (name === 'avgEngagement') return [value + '%', 'Avg Engagement'];
                        return [String(value), name];
                    }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.segment as keyof typeof COLORS] || 'hsl(var(--color-primary-600))'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
