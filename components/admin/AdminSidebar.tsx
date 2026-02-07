"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    ShieldCheck,
    Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Receipts', href: '/admin/receipts', icon: Receipt },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-background-card border-r border-border">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
                <div className="p-2 bg-primary-600 rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Admin Portal</h1>
                    <p className="text-xs text-foreground-muted">Receipt Wallet</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                                isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-foreground-muted hover:bg-background-elevated hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border">
                <p className="text-xs text-foreground-muted">
                    Data Science Analytics Dashboard
                </p>
            </div>
        </div>
    );
}
