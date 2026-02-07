"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LogOut, User } from "lucide-react";

export default function UserMenu() {
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { t } = useI18n();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-elevated transition-smooth"
            >
                <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-500" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute end-0 mt-2 w-56 bg-background-card border border-neutral-700 rounded-lg shadow-card-hover z-20 overflow-hidden">
                        <div className="p-3 border-b border-neutral-800">
                            <p className="text-sm text-foreground-muted">
                                {user.email || user.phone}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-start hover:bg-background-elevated transition-smooth flex items-center gap-2 text-error"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>{t("auth.logout")}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
