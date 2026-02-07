"use client";

import { useI18n } from '@/lib/i18n';
import { Receipt, TrendingUp, AlertCircle, Wallet } from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        totalReceipts: number;
        totalAmount?: number;
        upcomingReminders: number;
        expiringSoon: number;
    };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const { locale } = useI18n();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Spend - Gradient Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden group border border-primary-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                    <p className="text-primary-100 text-sm font-medium mb-1">
                        {locale === 'ar' ? 'إجمالي المصروفات' : 'Total Spend'}
                    </p>
                    <h3 className="text-3xl font-bold mb-1">
                        {stats.totalAmount?.toFixed(2) || '0.00'} <span className="text-lg font-normal opacity-80">SAR</span>
                    </h3>
                    <p className="text-xs text-primary-200 bg-white/10 inline-block px-2 py-1 rounded-full backdrop-blur-sm">
                        {locale === 'ar' ? 'هذا الشهر' : 'This Month'}
                    </p>
                </div>
            </div>

            {/* Total Receipts */}
            <div className="glass rounded-2xl p-6 shadow-sm hover:shadow-card-hover transition-all group">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-foreground-muted text-sm font-medium mb-1">
                            {locale === 'ar' ? 'عدد الإيصالات' : 'Total Receipts'}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground mb-1">
                            {stats.totalReceipts}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                        <Receipt className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="glass rounded-2xl p-6 shadow-sm hover:shadow-card-hover transition-all group">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-foreground-muted text-sm font-medium mb-1">
                            {locale === 'ar' ? 'تذكيرات قادمة' : 'Upcoming Reminders'}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground mb-1">
                            {stats.upcomingReminders}
                        </h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Expiring Soon */}
            <div className="glass rounded-2xl p-6 shadow-sm hover:shadow-card-hover transition-all group">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-foreground-muted text-sm font-medium mb-1">
                            {locale === 'ar' ? 'ضمان ينتهي قريباً' : 'Expiring Warranty'}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground mb-1">
                            {stats.expiringSoon}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
