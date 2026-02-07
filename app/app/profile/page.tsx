"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    AlertTriangle,
    Loader2,
    Trash2,
    Lock,
} from "lucide-react";
import StarField from "@/components/ui/StarField";

interface UserProfile {
    user: {
        id: string;
        email: string;
        phone?: string;
        created_at: string;
        last_sign_in_at: string;
    };
    preferences: any;
    stats: {
        totalReceipts: number;
        totalSpending: number;
        remindersCount: number;
        accountAgeDays: number;
    };
}

export default function ProfilePage() {
    const { locale, t } = useI18n();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    // Password change states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/user/profile");
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            } else {
                console.error("Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            alert(locale === "ar" ? "يرجى إدخال كلمة المرور" : "Please enter your password");
            return;
        }

        if (deleteConfirmText !== "DELETE") {
            alert(locale === "ar" ? 'يرجى كتابة "DELETE" للتأكيد' : 'Please type "DELETE" to confirm');
            return;
        }

        try {
            setDeleteLoading(true);
            const response = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });

            if (response.ok) {
                // Account deleted successfully, redirect to home
                router.push("/");
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An unexpected error occurred");
        } finally {
            setDeleteLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <StarField />
                <div className="text-center relative z-10">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-foreground-muted">
                        {locale === "ar" ? "جاري التحميل..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <StarField />
                <div className="text-center relative z-10">
                    <p className="text-foreground-muted">
                        {locale === "ar" ? "فشل في تحميل الملف الشخصي" : "Failed to load profile"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Effects */}
            <StarField />
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-background/80 z-10" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-300 dark:to-primary-500 mb-2">
                        {locale === "ar" ? "الملف الشخصي" : "Profile"}
                    </h1>
                    <p className="text-foreground-muted text-lg">
                        {locale === "ar" ? "إدارة حسابك ومعلوماتك" : "Manage your account and information"}
                    </p>
                </div>

                {/* Account Information */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <User className="h-6 w-6 text-primary-500" />
                        {locale === "ar" ? "معلومات الحساب" : "Account Information"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary-500/10">
                                <Mail className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-foreground-muted mb-1">
                                    {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                                </p>
                                <p className="text-sm font-medium text-foreground break-all">
                                    {profile.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        {profile.user.phone && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Phone className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-foreground-muted mb-1">
                                        {locale === "ar" ? "رقم الهاتف" : "Phone"}
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {profile.user.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Account Created */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Calendar className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-foreground-muted mb-1">
                                    {locale === "ar" ? "تاريخ الإنشاء" : "Account Created"}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {new Date(profile.user.created_at).toLocaleDateString(
                                        locale === "ar" ? "ar-SA" : "en-US",
                                        { year: "numeric", month: "long", day: "numeric" }
                                    )}
                                </p>
                                <p className="text-xs text-foreground-muted">
                                    {profile.stats.accountAgeDays}{" "}
                                    {locale === "ar" ? "يوم" : "days ago"}
                                </p>
                            </div>
                        </div>

                        {/* Last Sign In */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Clock className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-foreground-muted mb-1">
                                    {locale === "ar" ? "آخر تسجيل دخول" : "Last Sign In"}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {new Date(profile.user.last_sign_in_at).toLocaleDateString(
                                        locale === "ar" ? "ar-SA" : "en-US",
                                        { year: "numeric", month: "short", day: "numeric" }
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Security */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Lock className="h-6 w-6 text-primary-500" />
                        {locale === "ar" ? "الأمان وكلمة المرور" : "Password & Security"}
                    </h2>
                    <p className="text-foreground-muted mb-6">
                        {locale === "ar"
                            ? "قم بتغيير كلمة المرور الخاصة بك من خلال صفحة إعادة تعيين كلمة المرور الآمنة."
                            : "Change your password through our secure password reset page."}
                    </p>
                    <a
                        href="/app/reset-password"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <Lock className="h-5 w-5" />
                        {locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                    </a>
                </div>

                {/* Danger Zone */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-red-500/30 bg-red-500/5">
                    <h2 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6" />
                        {locale === "ar" ? "حذف الحساب" : "Danger Zone"}
                    </h2>
                    <p className="text-foreground-muted mb-4">
                        {locale === "ar"
                            ? "حذف حسابك بشكل دائم. لا يمكن التراجع عن هذا الإجراء."
                            : "Permanently delete your account. This action cannot be undone."}
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="h-5 w-5" />
                        {locale === "ar" ? "حذف الحساب" : "Delete Account"}
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="glass rounded-2xl p-6 max-w-md w-full border border-red-500/30 bg-red-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <h3 className="text-2xl font-bold text-foreground">
                                {locale === "ar" ? "تأكيد حذف الحساب" : "Confirm Account Deletion"}
                            </h3>
                        </div>

                        <p className="text-foreground-muted mb-4">
                            {locale === "ar"
                                ? "هذا الإجراء سيحذف جميع بياناتك بشكل دائم، بما في ذلك:"
                                : "This action will permanently delete all your data, including:"}
                        </p>

                        <ul className="list-disc list-inside text-foreground-muted mb-6 space-y-1">
                            <li>{locale === "ar" ? "جميع الإيصالات" : "All receipts"}</li>
                            <li>{locale === "ar" ? "جميع التذكيرات" : "All reminders"}</li>
                            <li>{locale === "ar" ? "التفضيلات والإعدادات" : "Preferences and settings"}</li>
                            <li>{locale === "ar" ? "معلومات الحساب" : "Account information"}</li>
                        </ul>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {locale === "ar"
                                    ? "أدخل كلمة المرور للتأكيد"
                                    : "Enter your password to confirm"}
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-foreground"
                                placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {locale === "ar"
                                    ? 'اكتب "DELETE" للتأكيد'
                                    : 'Type "DELETE" to confirm'}
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-foreground"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText("");
                                    setDeletePassword("");
                                }}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 bg-background-elevated hover:bg-background-card text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {locale === "ar" ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {locale === "ar" ? "جاري الحذف..." : "Deleting..."}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-5 w-5" />
                                        {locale === "ar" ? "حذف نهائي" : "Delete Forever"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
