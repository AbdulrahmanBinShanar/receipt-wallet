"use client";

import { useI18n } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import { Globe, Bell as BellIcon, Download, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
    const { t, locale, setLocale } = useI18n();

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t("settings.language")}</h1>
            </div>

            <div className="space-y-4">
                {/* Language */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-foreground-muted" />
                            <div>
                                <h3 className="font-medium text-foreground">{t("settings.language")}</h3>
                                <p className="text-sm text-foreground-muted">
                                    {locale === "ar" ? "العربية" : "English"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                        >
                            {locale === "ar" ? "English" : "العربية"}
                        </Button>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BellIcon className="h-5 w-5 text-foreground-muted" />
                        <h3 className="font-medium text-foreground">{t("settings.notifications")}</h3>
                    </div>
                    <p className="text-sm text-foreground-subtle ms-8">
                        {locale === "ar" ? "قريباً: إشعارات واتساب / رسائل قصيرة" : "Coming soon: WhatsApp / SMS notifications"}
                    </p>
                </Card>

                {/* Export Data */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-foreground-muted" />
                            <h3 className="font-medium text-foreground">{t("settings.export")}</h3>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            {t("common.download")}
                        </Button>
                    </div>
                </Card>

                {/* Delete Account */}
                <Card className="p-6 border-error/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-error" />
                            <h3 className="font-medium text-error">{t("settings.delete")}</h3>
                        </div>
                        <Button variant="danger" size="sm" disabled>
                            {t("common.delete")}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
