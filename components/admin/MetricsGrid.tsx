"use client";

import { DashboardMetrics } from '@/types/database';
import {
    Users,
    UserCheck,
    UserX,
    Receipt,
    TrendingUp,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
    metrics: DashboardMetrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
    const cards = [
        {
            title: 'Total Users',
            value: metrics.totalUsers.toLocaleString(),
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Active Users',
            value: metrics.activeUsers.toLocaleString(),
            icon: UserCheck,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Blocked Users',
            value: metrics.blockedUsers.toLocaleString(),
            icon: UserX,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            title: 'Total Receipts',
            value: metrics.totalReceipts.toLocaleString(),
            icon: Receipt,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'New Users Today',
            value: metrics.newUsersToday.toLocaleString(),
            icon: TrendingUp,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            title: 'Active Now',
            value: metrics.activeUsersNow.toLocaleString(),
            icon: Activity,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="bg-background-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-foreground-muted mb-1">
                                {card.title}
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {card.value}
                            </p>
                        </div>

                        <div className={cn('p-3 rounded-lg', card.bgColor)}>
                            <card.icon className={cn('h-6 w-6', card.color)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
