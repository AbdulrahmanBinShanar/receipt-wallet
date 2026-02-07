"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import Button from "./Button";

interface NavbarProps {
    /** Whether to show auth buttons (for landing page) or app navigation */
    variant?: "landing" | "app";
}

export default function Navbar({ variant = "landing" }: NavbarProps) {
    const { t, locale, setLocale } = useI18n();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const landingLinks = [
        { href: "/#features", label: locale === "ar" ? "المميزات" : "Features" },
        { href: "/#pricing", label: locale === "ar" ? "الأسعار" : "Pricing" },
        { href: "/#about", label: locale === "ar" ? "عن التطبيق" : "About" },
    ];

    const appLinks = [
        { href: "/app", label: locale === "ar" ? "لوحة التحكم" : "Dashboard" },
        { href: "/app/vault", label: locale === "ar" ? "الخزنة" : "Vault" },
        { href: "/app/reminders", label: locale === "ar" ? "التذكيرات" : "Reminders" },
        { href: "/app/settings", label: locale === "ar" ? "الإعدادات" : "Settings" },
    ];

    const links = variant === "landing" ? landingLinks : appLinks;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                            H
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-300 dark:to-primary-500">
                            {t("app.name")}
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />

                        <button
                            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                            className="px-3 py-1.5 rounded-full border border-border bg-background-elevated hover:bg-background-card text-sm font-medium transition-colors"
                        >
                            {locale === "ar" ? "English" : "العربية"}
                        </button>

                        {variant === "landing" ? (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        {locale === "ar" ? "تسجيل الدخول" : "Login"}
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button variant="primary" size="sm" className="shadow-glow">
                                        {locale === "ar" ? "ابدأ الآن" : "Get Started"}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Link href="/app/profile">
                                <Button variant="ghost" size="sm">
                                    {locale === "ar" ? "الملف الشخصي" : "Profile"}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-background-elevated transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 border-t border-border/40 animate-fade-in">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-4 space-y-3 border-t border-border/40">
                            <div className="flex items-center justify-between px-4">
                                <span className="text-sm text-foreground-muted">
                                    {locale === "ar" ? "المظهر" : "Theme"}
                                </span>
                                <ThemeToggle />
                            </div>

                            <button
                                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background-elevated hover:bg-background-card text-sm font-medium transition-colors text-left"
                            >
                                {locale === "ar" ? "English" : "العربية"}
                            </button>

                            {variant === "landing" ? (
                                <>
                                    <Link href="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" size="md" className="w-full">
                                            {locale === "ar" ? "تسجيل الدخول" : "Login"}
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" size="md" className="w-full shadow-glow">
                                            {locale === "ar" ? "ابدأ الآن" : "Get Started"}
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <Link href="/app/profile" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" size="md" className="w-full">
                                        {locale === "ar" ? "الملف الشخصي" : "Profile"}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
