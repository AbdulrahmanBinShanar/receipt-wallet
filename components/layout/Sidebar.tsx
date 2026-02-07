"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderClosed, Bell, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import UserMenu from "./UserMenu";

const navItems = [
    { key: "nav.home", href: "/app", icon: Home },
    { key: "nav.vault", href: "/app/vault", icon: FolderClosed },
    { key: "nav.reminders", href: "/app/reminders", icon: Bell },
    { key: "nav.packs", href: "/app/packs", icon: Package },
    { key: "nav.settings", href: "/app/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useI18n();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-background-card border-e border-neutral-800">
            {/* Logo */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gradient">{t("app.name")}</h1>
                <UserMenu />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                                isActive
                                    ? "bg-primary-600/10 text-primary-500 font-medium"
                                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{t(item.key)}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
