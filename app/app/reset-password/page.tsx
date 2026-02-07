"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";
import StarField from "@/components/ui/StarField";
import Link from "next/link";

type ResetMethod = "password" | "email";

export default function ResetPasswordPage() {
    const { locale } = useI18n();
    const router = useRouter();
    const [method, setMethod] = useState<ResetMethod>("password");

    // Old password method states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    // Loading and message states
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handlePasswordReset = async () => {
        setError("");
        setSuccess(false);

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(locale === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            setError(locale === "ar" ? "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" : "New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(locale === "ar" ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");

                // Redirect to profile after 2 seconds
                setTimeout(() => {
                    router.push("/app/profile");
                }, 2000);
            } else {
                setError(data.error || "Failed to change password");
            }
        } catch (err) {
            console.error("Password reset error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailReset = async () => {
        setError("");
        setSuccess(false);

        try {
            setLoading(true);
            const response = await fetch("/api/user/request-password-reset", {
                method: "POST",
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setError("");
            } else {
                setError(data.error || "Failed to send reset email");
            }
        } catch (err) {
            console.error("Email reset error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background */}
            <StarField />
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-background/80 z-10" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 md:p-8 max-w-2xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/app/profile"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {locale === "ar" ? "العودة إلى الملف الشخصي" : "Back to Profile"}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-primary-500/10">
                            <ShieldCheck className="h-8 w-8 text-primary-500" />
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-300 dark:to-primary-500">
                            {locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                        </h1>
                    </div>
                    <p className="text-foreground-muted text-lg">
                        {locale === "ar"
                            ? "اختر طريقة آمنة لتغيير كلمة المرور الخاصة بك"
                            : "Choose a secure method to change your password"}
                    </p>
                </div>

                {/* Method Tabs */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex gap-2 mb-6 p-1 bg-background-elevated rounded-lg">
                        <button
                            onClick={() => setMethod("password")}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${method === "password"
                                    ? "bg-primary-500 text-white"
                                    : "text-foreground-muted hover:text-foreground"
                                }`}
                        >
                            <Lock className="h-4 w-4 inline mr-2" />
                            {locale === "ar" ? "باستخدام كلمة المرور الحالية" : "With Current Password"}
                        </button>
                        <button
                            onClick={() => setMethod("email")}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${method === "email"
                                    ? "bg-primary-500 text-white"
                                    : "text-foreground-muted hover:text-foreground"
                                }`}
                        >
                            <Mail className="h-4 w-4 inline mr-2" />
                            {locale === "ar" ? "عبر البريد الإلكتروني" : "Via Email"}
                        </button>
                    </div>

                    {/* Old Password Method */}
                    {method === "password" && (
                        <div className="space-y-4">
                            <p className="text-sm text-foreground-muted mb-4">
                                {locale === "ar"
                                    ? "أدخل كلمة المرور الحالية للتحقق من هويتك، ثم أدخل كلمة المرور الجديدة."
                                    : "Enter your current password to verify your identity, then enter your new password."}
                            </p>

                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {locale === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-2 pr-10 bg-background-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-foreground"
                                        placeholder={locale === "ar" ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-muted hover:text-foreground"
                                    >
                                        {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {locale === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                                </label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-foreground"
                                    placeholder={locale === "ar" ? "أدخل كلمة مرور جديدة (6 أحرف على الأقل)" : "Enter new password (min 6 characters)"}
                                />
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {locale === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                                </label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-foreground"
                                    placeholder={locale === "ar" ? "أعد إدخال كلمة المرور الجديدة" : "Re-enter new password"}
                                />
                            </div>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {locale === "ar"
                                            ? "تم تغيير كلمة المرور بنجاح! جاري إعادة التوجيه..."
                                            : "Password changed successfully! Redirecting..."}
                                    </span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handlePasswordReset}
                                disabled={loading || success}
                                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {locale === "ar" ? "جاري التغيير..." : "Changing..."}
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        {locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Email Reset Method */}
                    {method === "email" && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-foreground">
                                    {locale === "ar"
                                        ? "سنرسل لك رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. انقر على الرابط لإعادة تعيين كلمة المرور الخاصة بك."
                                        : "We'll send you a password reset link to your email. Click the link to reset your password securely."}
                                </p>
                            </div>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {locale === "ar"
                                            ? "تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني."
                                            : "Reset link sent! Check your email."}
                                    </span>
                                </div>
                            )}

                            {/* Send Email Button */}
                            <button
                                onClick={handleEmailReset}
                                disabled={loading || success}
                                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {locale === "ar" ? "جاري الإرسال..." : "Sending..."}
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-5 w-5" />
                                        {locale === "ar" ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
