"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const SAUDI_CITIES = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
    "الخبر", "الطائف", "تبوك", "بريدة", "خميس مشيط"
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [reminderPreferences, setReminderPreferences] = useState({
        push: true,
        email: false,
        whatsapp: false,
    });
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { locale, setLocale } = useI18n();
    const supabase = createClient();

    const handleComplete = async () => {
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Create profile
            const { error } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: fullName || null,
                locale: locale,
                created_at: new Date().toISOString(),
            });

            if (error) throw error;

            // Redirect to app
            router.push('/app');
        } catch (err: any) {
            console.error("Onboarding error:", err);
            alert(locale === "ar" ? "حدث خطأ، حاول مرة أخرى" : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-background-card">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-smooth ${s < step
                                        ? "bg-primary-600 text-white"
                                        : s === step
                                            ? "bg-primary-600 text-white"
                                            : "bg-background-elevated text-foreground-muted"
                                    }`}
                            >
                                {s < step ? <Check className="h-5 w-5" /> : s}
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <Card variant="glass" className="p-8">
                    {/* Step 1: Language */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    {locale === "ar" ? "مرحباً بك في حَفيظ!" : "Welcome to Hafiz!"}
                                </h2>
                                <p className="text-foreground-muted">
                                    {locale === "ar" ? "اختر لغتك المفضلة" : "Choose your preferred language"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLocale("ar")}
                                    className={`p-6 rounded-lg border-2 transition-smooth ${locale === "ar"
                                            ? "border-primary-600 bg-primary-600/10"
                                            : "border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    <div className="text-4xl mb-2">🇸🇦</div>
                                    <div className="text-lg font-semibold text-foreground">العربية</div>
                                    <div className="text-sm text-foreground-muted">Arabic</div>
                                </button>

                                <button
                                    onClick={() => setLocale("en")}
                                    className={`p-6 rounded-lg border-2 transition-smooth ${locale === "en"
                                            ? "border-primary-600 bg-primary-600/10"
                                            : "border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    <div className="text-4xl mb-2">🇬🇧</div>
                                    <div className="text-lg font-semibold text-foreground">English</div>
                                    <div className="text-sm text-foreground-muted">الإنجليزية</div>
                                </button>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full mt-8"
                                onClick={() => setStep(2)}
                                icon={locale === "ar" ? ArrowLeft : ArrowRight}
                                iconPosition={locale === "ar" ? "left" : "right"}
                            >
                                {locale === "ar" ? "التالي" : "Next"}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Profile */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    {locale === "ar" ? "أخبرنا عنك" : "Tell us about you"}
                                </h2>
                                <p className="text-foreground-muted">
                                    {locale === "ar" ? "معلومات اختيارية لتحسين التجربة" : "Optional info to improve your experience"}
                                </p>
                            </div>

                            <Input
                                label={locale === "ar" ? "الاسم الكامل (اختياري)" : "Full name (optional)"}
                                type="text"
                                placeholder={locale === "ar" ? "أحمد محمد" : "Ahmed Mohammed"}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {locale === "ar" ? "المدينة (اختياري)" : "City (optional)"}
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full h-10 px-4 rounded-lg border border-neutral-700 bg-background-elevated text-foreground hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
                                >
                                    <option value="">{locale === "ar" ? "اختر المدينة" : "Select city"}</option>
                                    {SAUDI_CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => setStep(1)}
                                >
                                    {locale === "ar" ? "السابق" : "Back"}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1"
                                    onClick={() => setStep(3)}
                                    icon={locale === "ar" ? ArrowLeft : ArrowRight}
                                    iconPosition={locale === "ar" ? "left" : "right"}
                                >
                                    {locale === "ar" ? "التالي" : "Next"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Reminders */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    {locale === "ar" ? "كيف تريد التذكيرات؟" : "How do you want reminders?"}
                                </h2>
                                <p className="text-foreground-muted">
                                    {locale === "ar" ? "يمكنك تغيير هذا لاحقاً من الإعدادات" : "You can change this later in settings"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-smooth cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🔔</div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {locale === "ar" ? "إشعارات التطبيق" : "Push notifications"}
                                            </div>
                                            <div className="text-sm text-foreground-muted">
                                                {locale === "ar" ? "موصى به" : "Recommended"}
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={reminderPreferences.push}
                                        onChange={(e) => setReminderPreferences({ ...reminderPreferences, push: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-smooth cursor-pointer opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">📧</div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                                            </div>
                                            <div className="text-sm text-foreground-muted">
                                                {locale === "ar" ? "قريباً" : "Coming soon"}
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        disabled
                                        className="w-5 h-5 rounded border-neutral-600"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-smooth cursor-pointer opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">💬</div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {locale === "ar" ? "واتساب" : "WhatsApp"}
                                            </div>
                                            <div className="text-sm text-foreground-muted">
                                                {locale === "ar" ? "قريباً" : "Coming soon"}
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        disabled
                                        className="w-5 h-5 rounded border-neutral-600"
                                    />
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => setStep(2)}
                                >
                                    {locale === "ar" ? "السابق" : "Back"}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1"
                                    onClick={handleComplete}
                                    loading={loading}
                                    icon={Check}
                                >
                                    {locale === "ar" ? "ابدأ الاستخدام" : "Get started"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
