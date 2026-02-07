"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "ar" | "en";
type Direction = "rtl" | "ltr";

interface I18nContextType {
    locale: Locale;
    dir: Direction;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
    ar: {
        // Common
        "app.name": "حَفيظ",
        "common.save": "حفظ",
        "common.cancel": "إلغاء",
        "common.delete": "حذف",
        "common.edit": "تعديل",
        "common.search": "بحث",
        "common.filter": "تصفية",
        "common.upload": "رفع",
        "common.download": "تحميل",

        // Navigation
        "nav.home": "الرئيسية",
        "nav.vault": "الخزنة",
        "nav.reminders": "التذكيرات",
        "nav.packs": "الحقائب",
        "nav.settings": "الإعدادات",

        // Landing
        "landing.hero": "حَفيظ فواتيرك… ولا تضيع ضمانك",
        "landing.subtitle": "محفظة ذكية لإيصالاتك وضماناتك",
        "landing.cta": "جرّبه الآن",
        "landing.cta.secondary": "تعرّف على المزيد",

        // Auth
        "auth.phone": "رقم الجوال",
        "auth.email": "البريد الإلكتروني",
        "auth.otp": "رمز التحقق",
        "auth.login": "تسجيل الدخول",
        "auth.signup": "إنشاء حساب",
        "auth.logout": "تسجيل الخروج",
        "auth.profile": "الملف الشخصي",

        // Vault
        "vault.title": "الإيصالات",
        "vault.empty": "لا توجد إيصالات بعد",
        "vault.empty.cta": "أضف أول إيصال",
        "vault.upload": "رفع إيصال",
        "vault.scan": "مسح إيصال",

        // Receipt detail
        "receipt.merchant": "التاجر",
        "receipt.date": "التاريخ",
        "receipt.total": "الإجمالي",
        "receipt.vat": "ضريبة القيمة المضافة",
        "receipt.items": "العناصر",
        "receipt.warranty": "الضمان",
        "receipt.notes": "ملاحظات",
        "receipt.tags": "الوسوم",

        // Reminders
        "reminders.title": "التذكيرات",
        "reminders.upcoming": "القادمة",
        "reminders.past": "السابقة",
        "reminders.empty": "لا توجد تذكيرات",

        // Packs
        "packs.title": "حقائب العرض",
        "packs.create": "إنشاء حقيبة",
        "packs.empty": "لا توجد حقائب بعد",
        "packs.share": "مشاركة",
        "packs.reference": "رقم المرجع",

        // Settings
        "settings.language": "اللغة",
        "settings.notifications": "الإشعارات",
        "settings.export": "تصدير البيانات",
        "settings.delete": "حذف الحساب",
    },
    en: {
        // Common
        "app.name": "Hafiz",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.search": "Search",
        "common.filter": "Filter",
        "common.upload": "Upload",
        "common.download": "Download",

        // Navigation
        "nav.home": "Home",
        "nav.vault": "Vault",
        "nav.reminders": "Reminders",
        "nav.packs": "Packs",
        "nav.settings": "Settings",

        // Landing
        "landing.hero": "Keep your receipts… never lose your warranty",
        "landing.subtitle": "Smart wallet for your receipts and warranties",
        "landing.cta": "Try it now",
        "landing.cta.secondary": "Learn more",

        // Auth
        "auth.phone": "Phone number",
        "auth.email": "Email",
        "auth.otp": "Verification code",
        "auth.login": "Log in",
        "auth.signup": "Sign up",
        "auth.logout": "Log out",
        "auth.profile": "Profile",

        // Vault
        "vault.title": "Receipts",
        "vault.empty": "No receipts yet",
        "vault.empty.cta": "Add your first receipt",
        "vault.upload": "Upload receipt",
        "vault.scan": "Scan receipt",

        // Receipt detail
        "receipt.merchant": "Merchant",
        "receipt.date": "Date",
        "receipt.total": "Total",
        "receipt.vat": "VAT",
        "receipt.items": "Items",
        "receipt.warranty": "Warranty",
        "receipt.notes": "Notes",
        "receipt.tags": "Tags",

        // Reminders
        "reminders.title": "Reminders",
        "reminders.upcoming": "Upcoming",
        "reminders.past": "Past",
        "reminders.empty": "No reminders",

        // Packs
        "packs.title": "Show Packs",
        "packs.create": "Create pack",
        "packs.empty": "No packs yet",
        "packs.share": "Share",
        "packs.reference": "Reference ID",

        // Settings
        "settings.language": "Language",
        "settings.notifications": "Notifications",
        "settings.export": "Export data",
        "settings.delete": "Delete account",
    },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("ar");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("locale") as Locale | null;
        if (saved && (saved === "ar" || saved === "en")) {
            setLocaleState(saved);
        }
        setMounted(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
        document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLocale;
    };

    const dir: Direction = locale === "ar" ? "rtl" : "ltr";

    const t = (key: string): string => {
        return translations[locale][key as keyof typeof translations.ar] || key;
    };

    useEffect(() => {
        if (mounted) {
            document.documentElement.dir = dir;
            document.documentElement.lang = locale;
        }
    }, [locale, dir, mounted]);

    return (
        <I18nContext.Provider value={{ locale, dir, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within I18nProvider");
    }
    return context;
}
