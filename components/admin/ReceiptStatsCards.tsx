"use client";

import {
    Receipt,
    FileCheck,
    Archive,
    TrendingUp,
    File,
    Package,
    CheckCircle2,
    BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceiptStatsCardsProps {
    stats: {
        totalReceipts: number;
        activeReceipts: number;
        archivedReceipts: number;
        todayReceipts: number;
        totalPages: number;
        totalItems: number;
        extractedCount: number;
        avgItemsPerReceipt: number;
        extractionRate: number;
    };
}

export default function ReceiptStatsCards({ stats }: ReceiptStatsCardsProps) {
    const cards = [
        {
            title: 'Total Receipts',
            value: stats.totalReceipts.toLocaleString(),
            icon: Receipt,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Active Receipts',
            value: stats.activeReceipts.toLocaleString(),
            icon: FileCheck,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Archived',
            value: stats.archivedReceipts.toLocaleString(),
            icon: Archive,
            color: 'text-gray-500',
            bgColor: 'bg-gray-500/10',
        },
        {
            title: 'Uploaded Today',
            value: stats.todayReceipts.toLocaleString(),
            icon: TrendingUp,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Total Pages',
            value: stats.totalPages.toLocaleString(),
            icon: File,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Total Items',
            value: stats.totalItems.toLocaleString(),
            icon: Package,
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
