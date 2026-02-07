"use client";

import { useState, useEffect } from 'react';
import { Receipt } from '@/lib/services/receiptService';
import ReceiptCard from './ReceiptCard';
import { Grid, List, Search, Filter, SlidersHorizontal } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n';

interface ReceiptListProps {
    initialReceipts: Receipt[];
}

export default function ReceiptList({ initialReceipts }: ReceiptListProps) {
    const { locale } = useI18n();
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [receipts, setReceipts] = useState(initialReceipts);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

    // Get unique categories
    const categories = Array.from(
        new Set(receipts.map(r => r.category).filter(Boolean))
    ) as string[];

    // Filter and sort receipts
    const filteredReceipts = receipts
        .filter(receipt => {
            const matchesSearch = !searchTerm ||
                receipt.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.category?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || receipt.category === categoryFilter;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return (b.total || 0) - (a.total || 0);
            }
        });

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-background-card border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted pointer-events-none" />
                        <Input
                            placeholder={locale === 'ar' ? 'ابحث عن إيصالات...' : 'Search receipts...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">
                            {locale === 'ar' ? 'كل الفئات' : 'All Categories'}
                        </option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="date">
                            {locale === 'ar' ? 'التاريخ' : 'Date'}
                        </option>
                        <option value="amount">
                            {locale === 'ar' ? 'المبلغ' : 'Amount'}
                        </option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-smooth ${view === 'grid'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-smooth ${view === 'list'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-foreground-muted">
                    {locale === 'ar'
                        ? `عرض ${filteredReceipts.length} من ${receipts.length} إيصال`
                        : `Showing ${filteredReceipts.length} of ${receipts.length} receipts`
                    }
                </div>
            </div>

            {/* Receipts Grid/List */}
            {filteredReceipts.length === 0 ? (
                <div className="text-center py-16 text-foreground-muted">
                    <p>{locale === 'ar' ? 'لا توجد إيصالات' : 'No receipts found'}</p>
                </div>
            ) : (
                <div className={
                    view === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                }>
                    {filteredReceipts.map(receipt => (
                        <ReceiptCard
                            key={receipt.id}
                            receipt={receipt}
                            view={view}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
