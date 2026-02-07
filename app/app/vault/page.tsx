"use client";

import { useState, useEffect } from 'react';
import { useI18n } from "@/lib/i18n";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import ReceiptUploader from "@/components/vault/ReceiptUploader";
import ReceiptList from "@/components/vault/ReceiptList";
import EmptyState from "@/components/ui/EmptyState";
import { Receipt } from "@/lib/services/receiptService";

export default function VaultPage() {
    const { t } = useI18n();
    const [showUploader, setShowUploader] = useState(false);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch receipts
    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const response = await fetch('/api/receipts');
            if (response.ok) {
                const data = await response.json();
                setReceipts(data.receipts || []);
            }
        } catch (error) {
            console.error('Failed to fetch receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = (receipt: Receipt) => {
        setReceipts(prev => [receipt, ...prev]);
        setShowUploader(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("vault.title")}</h1>
                <Button
                    variant="primary"
                    icon={Upload}
                    onClick={() => setShowUploader(true)}
                >
                    {t("vault.upload")}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-foreground-muted">
                    Loading...
                </div>
            ) : receipts.length === 0 ? (
                <EmptyState
                    icon={Upload}
                    title={t("vault.empty")}
                    description={t("vault.empty.cta")}
                    action={{
                        label: t("vault.upload"),
                        icon: Upload,
                        onClick: () => setShowUploader(true),
                    }}
                />
            ) : (
                <ReceiptList initialReceipts={receipts} />
            )}

            {showUploader && (
                <ReceiptUploader
                    onUploadComplete={handleUploadComplete}
                    onClose={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
