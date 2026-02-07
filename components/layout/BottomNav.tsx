"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderClosed, Bell, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const navItems = [
    { key: "nav.home", href: "/app", icon: Home },
    { key: "nav.vault", href: "/app/vault", icon: FolderClosed },
    { key: "nav.reminders", href: "/app/reminders", icon: Bell },
    { key: "nav.packs", href: "/app/packs", icon: Package },
    { key: "nav.settings", href: "/app/settings", icon: Settings },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { t } = useI18n();

    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-background-card border-t border-neutral-800 glass z-40">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-smooth min-w-[64px]",
                                isActive
                                    ? "text-primary-500"
                                    : "text-foreground-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{t(item.key)}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
