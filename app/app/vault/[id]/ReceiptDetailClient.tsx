"use client";

import { useState } from 'react';
import { Receipt } from '@/lib/services/receiptService';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Edit, Trash2, Calendar, DollarSign, Tag, FileText, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ReceiptViewer from '@/components/vault/ReceiptViewer';
import { useI18n } from '@/lib/i18n';

interface ReceiptDetailClientProps {
    receipt: Receipt;
}

export default function ReceiptDetailClient({ receipt }: ReceiptDetailClientProps) {
    const router = useRouter();
    const { locale } = useI18n();
    const [showViewer, setShowViewer] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        merchant: receipt.merchant || '',
        date: receipt.date || '',
        total: receipt.total || 0,
        category: receipt.category || '',
        currency: receipt.currency || 'SAR'
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return locale === 'ar' ? 'غير محدد' : 'No date';
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/receipts/${receipt.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update receipt:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

        try {
            const response = await fetch(`/api/receipts/${receipt.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                router.push('/app/vault');
            }
        } catch (error) {
            console.error('Failed to delete receipt:', error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-smooth"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>{locale === 'ar' ? 'رجوع' : 'Back'}</span>
                </button>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                {locale === 'ar' ? 'حفظ' : 'Save'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" icon={Edit} onClick={() => setIsEditing(true)}>
                                {locale === 'ar' ? 'تعديل' : 'Edit'}
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                                {locale === 'ar' ? 'حذف' : 'Delete'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image */}
                <div className="lg:col-span-2">
                    <Card className="p-0 overflow-hidden">
                        <div className="aspect-[4/3] bg-background-elevated relative">
                            <img
                                src={receipt.file_url}
                                alt={receipt.merchant || 'Receipt'}
                                className="w-full h-full object-contain cursor-pointer"
                                onClick={() => setShowViewer(true)}
                            />
                            <button
                                onClick={() => setShowViewer(true)}
                                className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-smooth"
                            >
                                <Eye className="h-4 w-4" />
                                <span>{locale === 'ar' ? 'عرض' : 'View'}</span>
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            {locale === 'ar' ? 'التفاصيل' : 'Details'}
                        </h2>

                        <div className="space-y-4">
                            {/* Merchant */}
                            <div>
                                <label className="text-sm text-foreground-muted mb-1 block">
                                    {locale === 'ar' ? 'المتجر' : 'Merchant'}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.merchant}
                                        onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium">
                                        {receipt.merchant || (locale === 'ar' ? 'غير محدد' : 'Unknown')}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-sm text-foreground-muted mb-1 block">
                                    {locale === 'ar' ? 'التاريخ' : 'Date'}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ) : (
                                    <p className="text-foreground font-medium">{formatDate(receipt.date)}</p>
                                )}
                            </div>

                            {/* Total */}
                            <div>
                                <label className="text-sm text-foreground-muted mb-1 block">
                                    {locale === 'ar' ? 'المجموع' : 'Total'}
                                </label>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.total}
                                            onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                                            className="flex-1 px-3 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <input
                                            type="text"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-20 px-3 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-foreground">
                                        {receipt.total?.toFixed(2)} {receipt.currency}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-sm text-foreground-muted mb-1 block">
                                    {locale === 'ar' ? 'الفئة' : 'Category'}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ) : (
                                    <p className="text-foreground">
                                        {receipt.category || (locale === 'ar' ? 'غير محدد' : 'Uncategorized')}
                                    </p>
                                )}
                            </div>

                            {/* Warranty */}
                            {receipt.warranty_months && (
                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">{locale === 'ar' ? 'الضمان' : 'Warranty'}</span>
                                    </div>
                                    <p className="text-foreground font-medium">
                                        {receipt.warranty_months} {locale === 'ar' ? 'شهر' : 'months'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Items (if available) */}
                    {receipt.extracted_json?.items && receipt.extracted_json.items.length > 0 && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                {locale === 'ar' ? 'العناصر' : 'Items'}
                            </h3>
                            <div className="space-y-2">
                                {receipt.extracted_json.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-foreground">{item.name}</span>
                                        <span className="text-foreground-muted">
                                            {item.price?.toFixed(2)} {receipt.currency}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {showViewer && (
                <ReceiptViewer
                    imageUrl={receipt.file_url}
                    onClose={() => setShowViewer(false)}
                />
            )}
        </div>
    );
}
