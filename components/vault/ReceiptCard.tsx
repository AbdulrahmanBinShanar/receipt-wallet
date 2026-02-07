"use client";

import { Receipt } from '@/lib/services/receiptService';
import { FileText, Calendar, DollarSign, Tag, MoreVertical } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

interface ReceiptCardProps {
    receipt: Receipt;
    view?: 'grid' | 'list';
    onDelete?: (id: string) => void;
}

export default function ReceiptCard({ receipt, view = 'grid', onDelete }: ReceiptCardProps) {
    const { locale } = useI18n();

    const formatDate = (dateString?: string) => {
        if (!dateString) return locale === 'ar' ? 'غير محدد' : 'No date';
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
    };

    const formatAmount = (amount?: number, currency?: string) => {
        if (!amount) return locale === 'ar' ? 'غير محدد' : 'N/A';
        return `${amount.toFixed(2)} ${currency || 'SAR'}`;
    };

    if (view === 'list') {
        return (
            <Link href={`/app/vault/${receipt.id}`}>
                <div className="bg-background-card border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 bg-background-elevated rounded-lg overflow-hidden flex-shrink-0">
                            {receipt.file_url ? (
                                <img
                                    src={receipt.file_url}
                                    alt={receipt.merchant || 'Receipt'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-foreground-muted" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground truncate">
                                {receipt.merchant || (locale === 'ar' ? 'بدون اسم' : 'Unnamed')}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-foreground-muted">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(receipt.date)}</span>
                                </div>
                                {receipt.category && (
                                    <div className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        <span>{receipt.category}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                            <p className="text-xl font-bold text-foreground">
                                {formatAmount(receipt.total, receipt.currency)}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/app/vault/${receipt.id}`}>
            <div className="bg-background-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                {/* Image */}
                <div className="aspect-[4/3] bg-background-elevated relative overflow-hidden">
                    {receipt.file_url ? (
                        <img
                            src={receipt.file_url}
                            alt={receipt.merchant || 'Receipt'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-16 w-16 text-foreground-muted" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground truncate mb-2">
                        {receipt.merchant || (locale === 'ar' ? 'بدون اسم' : 'Unnamed')}
                    </h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-foreground-muted">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(receipt.date)}</span>
                            </div>
                            {receipt.category && (
                                <span className="px-2 py-1 bg-primary-600/10 text-primary-500 rounded text-xs">
                                    {receipt.category}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground-muted">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-foreground-muted">
                                    {locale === 'ar' ? 'المجموع' : 'Total'}
                                </span>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                {formatAmount(receipt.total, receipt.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
