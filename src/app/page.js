"use client";
import React from "react";
import Link from "next/link";
import { Search, ShieldCheck, Smartphone, CheckCircle, ArrowRight, HelpCircle, BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";

const Navbar = () => {
  const { t } = useTranslations();
  const { data: session, status } = useSession();

  const getDashboardUrl = () => {
    if (!session?.user?.role) return "/connexion";
    if (session.user.role === "STUDENT") return "/lms/student/dashboard";
    return "/admin/dashboard";
  };

  return (
  <nav className="sticky top-0 z-50 glass border-b border-gray-100 dark:border-gray-800">
    <div className="german-accent-bar h-1 w-full absolute top-0 left-0"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1">
      <div className="flex justify-between h-20 items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Spass mit Deutsch" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[#003366] dark:text-gray-100 whitespace-nowrap">
            Spass mit Deutsch <span className="text-[#D4AF37]">Benin</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="https://www.spassmitdeutschbenin.com/" target="_blank" className="text-[#003366] font-bold dark:text-[#D4AF37] hover:underline transition-colors text-sm whitespace-nowrap">{t("common.officialSite")}</Link>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>
          <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-[#003366] dark:hover:text-white transition-colors whitespace-nowrap">{t("public.howItWorks.title")}</Link>
          <Link href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-[#003366] dark:hover:text-white transition-colors whitespace-nowrap">{t("public.faq.title")}</Link>
          <ThemeToggle />
          <LanguageSwitcher variant="compact" />
          
          {status === "authenticated" ? (
            <Link href={getDashboardUrl()} className="flex items-center gap-2 bg-[#003366] dark:bg-[#D4AF37] text-white dark:text-[#003366] font-bold px-4 py-2 rounded-xl shadow-lg hover:opacity-90 transition-all text-sm whitespace-nowrap">
              <LayoutDashboard size={16} />
              {t("nav.dashboard")}
            </Link>
          ) : (
            <Link href="/connexion" className="text-[#003366] dark:text-[#D4AF37] font-bold hover:opacity-80 transition-all text-sm border-2 border-[#003366] dark:border-[#D4AF37] px-4 py-2 rounded-xl whitespace-nowrap">{t("common.login")}</Link>
          )}
          
          <Link href="/consultation" className="btn-primary py-2 px-5 text-sm whitespace-nowrap">{t("consultation.title")}</Link>
        </div>
      </div>
    </div>
  </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="card-premium p-8 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#003366] dark:text-[#D4AF37]">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-[#003366] dark:text-gray-100">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex items-start gap-6 relative group">
    <div className="absolute top-12 left-6 w-0.5 h-16 bg-gray-200 dark:bg-gray-700 group-last:hidden"></div>
    <div className="flex-shrink-0 w-12 h-12 bg-[#003366] dark:bg-[#D4AF37] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
      {number}
    </div>
    <div>
      <h4 className="text-xl font-bold mb-2 text-[#003366] dark:text-gray-100">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default function HomePage() {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 dark:from-[#001122]/50 to-white dark:to-[#121212] pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-[#D4AF37]/20 text-[#DD0000] dark:text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <GraduationCap size={14} /> {t("public.hero.portalTag")}
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#003366] dark:text-white tracking-tight mb-8 leading-[1.1]">
                {t("public.hero.title")}<span className="text-[#D4AF37]">{t("public.hero.titleAccent")}</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                {t("public.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/consultation" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/10">
                  {t("public.hero.ctaResults")} <Search size={20} />
                </Link>
                <Link href="https://www.spassmitdeutschbenin.com/" target="_blank" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2 border-2 border-[#003366] text-[#003366] hover:bg-blue-50 transition-all">
                  {t("public.hero.ctaMainSite")} <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Patterns (Bauhaus / Letters) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute top-[10%] left-[15%] text-[15rem] font-bold text-gray-200/40 dark:text-gray-800/40 opacity-30 select-none">Ä</div>
          <div className="absolute bottom-[20%] right-[10%] text-[20rem] font-bold text-[#D4AF37]/10 dark:text-[#D4AF37]/5 opacity-30 select-none">ß</div>
          <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-red-500/10 dark:bg-red-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-[#003366]/30 rounded-tl-full blur-3xl transform rotate-45" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/10 dark:bg-yellow-600/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#003366] dark:text-gray-100 mb-8 flex items-center gap-3">
                <BookOpen className="text-[#D4AF37]" size={36}/> {t("public.howItWorks.title")}
              </h2>
              <div className="space-y-10">
                <Step 
                  number="1" 
                  title={t("public.howItWorks.step1Title")} 
                  description={t("public.howItWorks.step1Desc")} 
                />
                <Step 
                  number="2" 
                  title={t("public.howItWorks.step2Title")} 
                  description={t("public.howItWorks.step2Desc")} 
                />
                <Step 
                  number="3" 
                  title={t("public.howItWorks.step3Title")} 
                  description={t("public.howItWorks.step3Desc")} 
                />
              </div>
            </div>
            <div className="bg-[#003366] rounded-3xl p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white font-medium">ÖSD Zertifikat B2</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">bestanden</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Schriftliche Prüfung</p>
                    {[
                      { m: "Lesen", s: "15", max: "20" },
                      { m: "Hören", s: "18", max: "20" },
                      { m: "Schreiben", s: "16", max: "30" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-white/80 text-sm">
                        <span>{item.m}</span>
                        <span className="font-mono">{item.s}<span className="text-white/30">/{item.max}</span></span>
                      </div>
                    ))}
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold pt-2">Mündliche Prüfung</p>
                    <div className="flex justify-between text-white/80 text-sm">
                      <span>Sprechen</span>
                      <span className="font-mono">20<span className="text-white/30">/30</span></span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-3 border-t border-white/10">
                      <span>Gesamtpunktezahl</span>
                      <span className="font-mono">69<span className="text-white/50">/100</span></span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-4 bg-[#D4AF37] text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-[#c4a132] transition-colors">
                  {t("public.howItWorks.downloadPdf")} <Smartphone size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#003366] dark:text-gray-100 mb-4">{t("public.features.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("public.features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Search} 
              title={t("public.features.card1Title")} 
              description={t("public.features.card1Desc")} 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title={t("public.features.card2Title")} 
              description={t("public.features.card2Desc")} 
            />
            <FeatureCard 
              icon={Smartphone} 
              title={t("public.features.card3Title")} 
              description={t("public.features.card3Desc")} 
            />
            <FeatureCard 
              icon={CheckCircle} 
              title={t("public.features.card4Title")} 
              description={t("public.features.card4Desc")} 
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-[#121212]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <HelpCircle size={48} className="mx-auto text-[#003366] dark:text-[#D4AF37] mb-4 opacity-20" />
            <h2 className="text-4xl font-bold text-[#003366] dark:text-gray-100 mb-4">{t("public.faq.title")}</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: t("public.faq.q1"), a: t("public.faq.a1") },
              { q: t("public.faq.q2"), a: t("public.faq.a2") },
              { q: t("public.faq.q3"), a: t("public.faq.a3") }
            ].map((faq, i) => (
              <div key={i} className="p-6 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-[#003366] dark:text-[#D4AF37] mb-2">{faq.q}</h4>
                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001a33] dark:bg-[#080808] text-white py-16 relative overflow-hidden">
        <div className="german-accent-bar h-1 w-full absolute top-0 left-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Spass mit Deutsch" className="w-12 h-12 object-contain" />
                <span className="font-bold text-2xl tracking-tight">Spass mit Deutsch Benin</span>
              </div>
              <p className="text-white/60 max-w-sm mb-6">
                {t("public.footer.description")}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-[#D4AF37]">{t("public.footer.navigation")}</h4>
              <ul className="space-y-4 text-white/50 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">{t("common.home")}</Link></li>
                <li><Link href="/consultation" className="hover:text-white transition-colors">{t("nav.results")}</Link></li>
                <li><Link href="/login" className="text-white/20 hover:text-white/40 transition-colors text-xs">{t("admin.nav.administration")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-[#D4AF37]">{t("public.footer.contact")}</h4>
              <ul className="space-y-4 text-white/50 text-sm">
                <li>{t("public.footer.location")}</li>
                <li>+229 01 96 64 19 61</li>
                <li>+229 01 96 81 94 92</li>
                <li>necsima@yahoo.fr</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-[10px] mt-8 pt-8 border-t border-white/5 uppercase tracking-widest font-bold">
            <p>{t("public.footer.rights")}</p>
            <div className="flex items-center gap-4">
               <span>SMD version 1 {t("public.footer.producedBy")} <a href="https://offre.guelichweb.online/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">Guelichweb</a></span>
            </div>
            <div className="flex gap-6">
              <Link href="/legal" className="hover:text-white cursor-pointer transition-colors">{t("public.footer.legal")}</Link>
              <Link href="/privacy" className="hover:text-white cursor-pointer transition-colors">{t("public.footer.privacy")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
