"use client";

import { useI18n } from "@/lib/i18n";
import EmptyState from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

export default function PacksPage() {
    const { t } = useI18n();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t("packs.title")}</h1>
            </div>

            <EmptyState
                icon={Package}
                title={t("packs.empty")}
            />
        </div>
    );
}
