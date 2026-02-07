"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

type SignupMode = "phone" | "email";

export default function SignupPage() {
    const [mode, setMode] = useState<SignupMode>("email");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();
    const { t, locale } = useI18n();
    const supabase = createClient();

    const handleEmailSignup = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        // Validation
        if (password !== confirmPassword) {
            setError(locale === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError(locale === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            setSuccess(
                locale === "ar"
                    ? "تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك."
                    : "Confirmation link sent to your email. Please check your inbox."
            );
        } catch (err: any) {
            setError(err.message || (locale === "ar" ? "حدث خطأ، حاول مرة أخرى" : "An error occurred"));
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSignup = async () => {
        setLoading(true);
        setError("");

        try {
            if (!otpSent) {
                // Send OTP
                const { error } = await supabase.auth.signInWithOtp({
                    phone: phone.startsWith('+') ? phone : `+966${phone}`,
                });

                if (error) throw error;
                setOtpSent(true);
            } else {
                // Verify OTP and create account
                const { error } = await supabase.auth.verifyOtp({
                    phone: phone.startsWith('+') ? phone : `+966${phone}`,
                    token: otp,
                    type: 'sms',
                });

                if (error) throw error;

                // Update profile with name
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ full_name: fullName })
                        .eq('id', user.id);
                }

                router.push('/auth/onboarding');
            }
        } catch (err: any) {
            setError(err.message || (locale === "ar" ? "حدث خطأ، حاول مرة أخرى" : "An error occurred"));
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
                        {locale === "ar" ? "إنشاء حساب جديد" : "Create a new account"}
                    </p>
                </div>

                {/* Signup Card */}
                <Card variant="glass" className="p-8">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600">
                                {success}
                            </div>
                            <Link href="/auth/login">
                                <Button variant="secondary" className="w-full">
                                    {locale === "ar" ? "العودة لتسجيل الدخول" : "Go to Login"}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Mode Toggle */}
                            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-background-elevated rounded-lg">
                                <button
                                    onClick={() => setMode("email")}
                                    className={`py-2 px-4 rounded-md transition-smooth flex items-center justify-center gap-2 ${mode === "email"
                                        ? "bg-primary-600 text-white"
                                        : "text-foreground-muted hover:text-foreground"
                                        }`}
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>{t("auth.email")}</span>
                                </button>
                                <button
                                    onClick={() => setMode("phone")}
                                    className={`py-2 px-4 rounded-md transition-smooth flex items-center justify-center gap-2 ${mode === "phone"
                                        ? "bg-primary-600 text-white"
                                        : "text-foreground-muted hover:text-foreground"
                                        }`}
                                >
                                    <Phone className="h-4 w-4" />
                                    <span>{t("auth.phone")}</span>
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Signup */}
                            {mode === "email" && (
                                <div className="space-y-4">
                                    <Input
                                        label={locale === "ar" ? "الاسم الكامل" : "Full Name"}
                                        type="text"
                                        placeholder={locale === "ar" ? "أدخل اسمك" : "Enter your name"}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />

                                    <Input
                                        label={t("auth.email")}
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <Input
                                        label={locale === "ar" ? "كلمة المرور" : "Password"}
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <Input
                                        label={locale === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={handleEmailSignup}
                                        loading={loading}
                                        disabled={!email || !password || !fullName}
                                        icon={locale === "ar" ? ArrowLeft : ArrowRight}
                                        iconPosition={locale === "ar" ? "left" : "right"}
                                    >
                                        {locale === "ar" ? "إنشاء حساب" : "Create Account"}
                                    </Button>
                                </div>
                            )}

                            {/* Phone Signup */}
                            {mode === "phone" && (
                                <div className="space-y-4">
                                    {!otpSent && (
                                        <Input
                                            label={locale === "ar" ? "الاسم الكامل" : "Full Name"}
                                            type="text"
                                            placeholder={locale === "ar" ? "أدخل اسمك" : "Enter your name"}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    )}

                                    <Input
                                        label={t("auth.phone")}
                                        type="tel"
                                        placeholder={locale === "ar" ? "5xxxxxxxx" : "5xxxxxxxx"}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={otpSent}
                                    />

                                    {otpSent && (
                                        <>
                                            <Input
                                                label={t("auth.otp")}
                                                type="text"
                                                placeholder="123456"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                            />
                                            <button
                                                onClick={() => {
                                                    setOtpSent(false);
                                                    setOtp("");
                                                }}
                                                className="text-sm text-primary-500 hover:underline"
                                            >
                                                {locale === "ar" ? "تغيير رقم الجوال" : "Change phone number"}
                                            </button>
                                        </>
                                    )}

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={handlePhoneSignup}
                                        loading={loading}
                                        disabled={!phone || !fullName || (otpSent && otp.length !== 6)}
                                        icon={locale === "ar" ? ArrowLeft : ArrowRight}
                                        iconPosition={locale === "ar" ? "left" : "right"}
                                    >
                                        {otpSent
                                            ? (locale === "ar" ? "تحقق وإنشاء حساب" : "Verify & Create Account")
                                            : (locale === "ar" ? "إرسال رمز التحقق" : "Send Verification Code")
                                        }
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-foreground-muted text-sm">
                        {locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                        <Link href="/auth/login" className="text-primary-500 hover:underline font-medium">
                            {locale === "ar" ? "تسجيل الدخول" : "Login"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
