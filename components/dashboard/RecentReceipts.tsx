"use client";

import { Receipt } from '@/lib/services/receiptService';
import { useI18n } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import { FileText, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface RecentReceiptsProps {
    receipts: Receipt[];
}

export default function RecentReceipts({ receipts }: RecentReceiptsProps) {
    const { locale } = useI18n();

    const formatDate = (dateString?: string) => {
        if (!dateString) return locale === 'ar' ? 'غير محدد' : 'No date';
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (receipts.length === 0) {
        return (
            <Card className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="bg-primary-50 rounded-full p-4 mb-4 dark:bg-primary-900/20">
                    <FileText className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {locale === 'ar' ? 'لا توجد إيصالات حديثة' : 'No Recent Receipts'}
                </h3>
                <p className="text-foreground-muted mb-4 text-sm">
                    {locale === 'ar' ? 'ابدأ برفع إيصالاتك الأولى' : 'Start by uploading your first receipt'}
                </p>
            </Card>
        );
    }

    return (
        <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">
                    {locale === 'ar' ? 'أحدث الإيصالات' : 'Recent Receipts'}
                </h2>
                <Link
                    href="/app/vault"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                    {locale === 'ar' ? 'عرض الكل' : 'View All'}
                    <ArrowRight className={`h-4 w-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                </Link>
            </div>

            <div className="space-y-4">
                {receipts.slice(0, 5).map((receipt) => (
                    <Link
                        key={receipt.id}
                        href={`/app/vault/${receipt.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-elevated transition-all border border-transparent hover:border-border group"
                    >
                        {/* Thumbnail/Icon */}
                        <div className="h-12 w-12 rounded-lg bg-background-elevated border border-border flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                            {receipt.file_url ? (
                                <img
                                    src={receipt.file_url}
                                    alt={receipt.merchant}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <FileText className="h-6 w-6 text-foreground-muted" />
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">
                                {receipt.merchant || (locale === 'ar' ? 'غير محدد' : 'Unknown Merchant')}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-foreground-muted mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(receipt.date)}
                                </span>
                                {receipt.category && (
                                    <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded">
                                        {receipt.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right font-bold text-foreground whitespace-nowrap">
                            {receipt.total ? (
                                <span>{receipt.total.toFixed(2)} <span className="text-xs text-foreground-muted font-normal">{receipt.currency}</span></span>
                            ) : (
                                <span className="text-foreground-muted text-sm">—</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    );
}
