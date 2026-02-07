"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const { t, locale } = useI18n();
    const supabase = createClient();

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        try {
            const { error: signInError, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Check if user has admin role
            const { data: adminRole } = await supabase
                .from('admin_roles')
                .select('id')
                .eq('user_id', data.user.id)
                .single();

            // Check if profile exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (!profile) {
                router.push('/auth/onboarding');
            } else if (adminRole) {
                router.push('/admin');
            } else {
                router.push('/app');
            }
        } catch (err: any) {
            setError(err.message || (locale === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-background-card">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gradient mb-2">{t("app.name")}</h1>
                    <p className="text-foreground-muted">
                        {locale === "ar" ? "تسجيل الدخول إلى حسابك" : "Login to your account"}
                    </p>
                </div>

                {/* Login Card */}
                <Card variant="glass" className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label={t("auth.email")}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />

                        <Input
                            label={locale === "ar" ? "كلمة المرور" : "Password"}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={handleLogin}
                            loading={loading}
                            disabled={!email || !password}
                            icon={locale === "ar" ? ArrowLeft : ArrowRight}
                            iconPosition={locale === "ar" ? "left" : "right"}
                        >
                            {t("auth.login")}
                        </Button>
                    </div>
                </Card>

                {/* Signup Link */}
                <div className="text-center">
                    <p className="text-foreground-muted text-sm">
                        {locale === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
                        <Link href="/auth/signup" className="text-primary-500 hover:underline font-medium">
                            {locale === "ar" ? "إنشاء حساب" : "Sign up"}
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-foreground-muted hover:text-foreground transition-smooth text-sm"
                    >
                        {locale === "ar" ? "← العودة للرئيسية" : "← Back to home"}
                    </button>
                </div>
            </div>
        </div>
    );
}
