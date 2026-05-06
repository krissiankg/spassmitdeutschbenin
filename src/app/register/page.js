"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function RegisterChoicePage() {
  const { t } = useTranslations();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/form-settings")
      .then(r => r.json())
      .then(d => { setSettings(d.settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (settings && !settings.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#003366] mb-4">{t("register.closedTitle")}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{settings.closingMessage}</p>
          <Link href="/" className="inline-block bg-[#003366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors">
            {t("register.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const simpleActive = settings?.simpleFormActive ?? true;
  const osdActive = settings?.osdFormActive ?? false;

  const forms = [
    {
      type: "simple",
      href: "/register/simple",
      active: simpleActive,
      icon: "📚",
      badge: t("register.simple.badge"),
      badgeColor: "bg-green-100 text-green-700",
      title: t("register.simple.title"),
      subtitle: t("register.simple.subtitle"),
      description: t("register.simple.description"),
      features: t.raw("register.simple.features"),
      cta: t("register.simple.cta"),
      color: "#003366",
      bg: "from-blue-50 to-white",
      border: "border-[#003366]",
      disabledMsg: t("register.simple.disabledMsg"),
    },
    {
      type: "osd",
      href: "/register/osd",
      active: osdActive,
      icon: "🎓",
      badge: t("register.osd.badge"),
      badgeColor: "bg-amber-100 text-amber-700",
      title: t("register.osd.title"),
      subtitle: t("register.osd.subtitle"),
      description: t("register.osd.description"),
      features: t.raw("register.osd.features"),
      cta: t("register.osd.cta"),
      color: "#D4AF37",
      bg: "from-amber-50 to-white",
      border: "border-[#D4AF37]",
      disabledMsg: t("register.osd.disabledMsg"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <Link href="/">
            <img src="/logo.png" alt="Spass mit Deutsch Benin" className="h-20 mx-auto object-contain mb-6 hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-4xl font-extrabold text-[#003366] tracking-tight mb-3">
            {t("register.portalTitle")}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t("register.portalSubtitle")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form, idx) => (
            <motion.div
              key={form.type}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15 }}
              className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                form.active
                  ? `${form.border} shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${form.bg}`
                  : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60 grayscale"
              }`}
            >
              {/* Désactivé overlay */}
              {!form.active && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded-3xl">
                  <span className="text-4xl mb-3">🔒</span>
                  <p className="text-sm font-bold text-gray-500 text-center px-6">{form.disabledMsg}</p>
                </div>
              )}

              <div className="p-8">
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${form.badgeColor}`}>
                    {form.badge}
                  </span>
                  {form.active && (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                      {t("register.openStatus")}
                    </span>
                  )}
                </div>

                {/* Icon + Title */}
                <div className="mb-4">
                  <span className="text-5xl">{form.icon}</span>
                  <h2 className="text-2xl font-extrabold mt-3" style={{ color: form.active ? form.color : "#9ca3af" }}>
                    {form.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium mt-1">{form.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{form.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {form.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: form.active ? form.color + '20' : '#f3f4f6', color: form.active ? form.color : '#9ca3af' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {form.active ? (
                  <Link
                    href={form.href}
                    className="block w-full py-4 text-center text-white font-bold rounded-2xl text-base shadow-lg transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ backgroundColor: form.color }}
                  >
                    {form.cta}
                  </Link>
                ) : (
                  <div className="block w-full py-4 text-center text-gray-400 font-bold rounded-2xl text-base bg-gray-200">
                    {t("register.notAvailable")}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bouton de connexion */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link 
            href="/connexion" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-gray-100 text-[#003366] font-bold shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 transition-all group"
          >
            {t("register.alreadyAccount")} <span className="group-hover:text-[#D4AF37] transition-colors">{t("register.loginLink")}</span>
          </Link>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-10 uppercase tracking-widest">
          SMD v1 produit par{" "}
          <a href="https://offre.guelichweb.online/" target="_blank" rel="noopener noreferrer" className="text-[#003366] hover:underline">
            Guelichweb
          </a>
        </p>
      </div>
    </div>
  );
}
