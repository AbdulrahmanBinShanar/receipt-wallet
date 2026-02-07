"use client";

import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock, Database, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StarField from "@/components/ui/StarField";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const { t, locale, setLocale, dir } = useI18n();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Dynamic icon for RTL/LTR
  const ArrowIcon = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-primary-500/30">

      {/* Background Effect */}
      <StarField />

      {/* Gradient Ambient Light */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Modern Navbar */}
      <Navbar variant="landing" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 animate-fade-in backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {locale === "ar" ? "مدعوم بالذكاء الاصطناعي 2.0" : "Powered by Gemini 2.0 Flash"}
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            {locale === "ar" ? (
              <>
                حفَيظ...<br />
                <span className="text-gradient">حقّك محفوظ.</span>
              </>
            ) : (
              <>
                Hafiz... <br />
                <span className="text-gradient">Your Rights, Protected</span>
              </>
            )}
          </h2>

          <p className="text-xl text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            {locale === "ar" ?
              "محفظة ذكية تستخدم الذكاء الاصطناعي لاستخراج بيانات إيصالاتك، تذكيرك بمواعيد الضمان، وتنظيم مشترياتك في مكان واحد." :
              "Smart wallet utilizing AI to extract receipt data, remind you of warranty expirations, and organize your purchases in one secure place."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                className="w-full sm:w-auto shadow-glow hover:shadow-glow-lg transition-all duration-300"
                icon={ArrowIcon}
                iconPosition="right"
              >
                {locale === "ar" ? "ابدأ الآن مجاناً" : "Start Now for Free"}
              </Button>
            </Link>

            <Link href="/auth/login" className="w-full sm:w-auto sm:hidden">
              <Button variant="secondary" size="xl" className="w-full">
                {locale === "ar" ? "تسجيل الدخول" : "Login"}
              </Button>
            </Link>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-3 px-6 py-4 rounded-xl text-foreground hover:bg-white/5 transition-colors group w-full sm:w-auto justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </div>
              <span className="font-semibold">
                {locale === "ar" ? "شاهد كيف يعمل" : "Watch Demo"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Steps */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              title: locale === "ar" ? "امسح أو ارفع" : "Scan or Upload",
              desc: locale === "ar" ? "التقط صورة للإيصال أو ارفع ملف PDF مباشرة" : "Take a photo of receipt or upload PDF directly",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              step: "02",
              title: locale === "ar" ? "استخراج ذكي" : "AI Extraction",
              desc: locale === "ar" ? "الذكاء الاصطناعي يستخرج البيانات تلقائياً بدقة عالية" : "AI automatically extracts structured data with high precision",
              gradient: "from-primary-500 to-emerald-500"
            },
            {
              step: "03",
              title: locale === "ar" ? "حقيبة العرض" : "Show Pack",
              desc: locale === "ar" ? "نُنشئ لك صفحة منظمة عند الحاجة للصيانة أو الاسترجاع" : "We generate an organized page for maintenance or returns",
              gradient: "from-purple-500 to-pink-500"
            },
          ].map((item, i) => (
            <div key={i} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-2xl opacity-20 group-hover:opacity-60 blur transition duration-500`} />
              <div className="relative h-full bg-background-card/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex flex-col">
                <h4 className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${item.gradient} mb-6 opacity-50`}>
                  {item.step}
                </h4>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-foreground-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-24 relative z-10 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {locale === "ar" ? "أمان وخصوصية تامة" : "Complete Security & Privacy"}
            </h3>
            <p className="text-foreground-muted">
              {locale === "ar" ? "بياناتك مشفرة ومحفوظة بمعايير عالمية" : "Your data is encrypted and stored with global standards"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Lock,
                title: locale === "ar" ? "تشفير تام" : "Full Encryption",
                desc: locale === "ar" ? "بياناتك مُشفَّرة وآمنة" : "Your data is encrypted and secure",
              },
              {
                icon: Database,
                title: locale === "ar" ? "تخزين محلي" : "Local Storage",
                desc: locale === "ar" ? "البيانات على خوادم آمنة" : "Data stored on secure servers",
              },
              {
                icon: ShieldCheck,
                title: locale === "ar" ? "لا نبيع بياناتك" : "Never Sold",
                desc: locale === "ar" ? "خصوصيتك مضمونة 100%" : "Your privacy guaranteed 100%",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="mb-6 inline-flex p-5 rounded-2xl bg-background-elevated border border-border group-hover:border-primary-500/50 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="h-8 w-8 text-primary-500" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-foreground-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-border/50 text-center relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-foreground-muted text-sm">
            © 2026 {t("app.name")} - {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
          <div className="flex gap-6 text-sm text-foreground-muted">
            <a href="#" className="hover:text-primary-500 transition-colors">{locale === "ar" ? "الشروط والأحكام" : "Terms"}</a>
            <a href="#" className="hover:text-primary-500 transition-colors">{locale === "ar" ? "سياسة الخصوصية" : "Privacy"}</a>
            <a href="#" className="hover:text-primary-500 transition-colors">{locale === "ar" ? "تواصل معنا" : "Contact"}</a>
          </div>
        </div>
      </footer>

      {/* Video Modal Placeholder (Optional) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsVideoModalOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <p>{locale === "ar" ? "فيديو توضيحي قريباً" : "Demo Video Coming Soon"}</p>
            </div>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

