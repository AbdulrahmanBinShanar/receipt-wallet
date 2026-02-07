"use client";

import { useI18n } from "@/lib/i18n";
import EmptyState from "@/components/ui/EmptyState";
import { Bell } from "lucide-react";

export default function RemindersPage() {
    const { t } = useI18n();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t("reminders.title")}</h1>
            </div>

            <EmptyState
                icon={Bell}
                title={t("reminders.empty")}
            />
        </div>
    );
}
