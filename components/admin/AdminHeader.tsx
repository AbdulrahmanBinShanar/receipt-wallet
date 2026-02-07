"use client";

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Menu } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminHeader() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <header className="sticky top-0 z-10 bg-background-card border-b border-border px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
                {/* Mobile menu button */}
                <button className="lg:hidden p-2 hover:bg-background-elevated rounded-lg">
                    <Menu className="h-6 w-6" />
                </button>

                <div className="hidden lg:block">
                    <h2 className="text-xl font-semibold text-foreground">
                        Admin Dashboard
                    </h2>
                </div>

                {/* User menu */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        icon={LogOut}
                        className="text-foreground-muted hover:text-foreground"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
