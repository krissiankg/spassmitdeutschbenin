"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, Presentation, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function ConnexionChoicePage() {
  const { t } = useTranslations();

  const portals = [
    {
      id: "student",
      title: t("connexion.studentPortal.title"),
      description: t("connexion.studentPortal.description"),
      icon: GraduationCap,
      href: "/lms/login",
      color: "#003366",
      badge: t("connexion.studentPortal.badge"),
      bg: "from-blue-50 to-white",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      textColor: "text-[#003366]",
    },
    {
      id: "teacher",
      title: t("connexion.teacherPortal.title"),
      description: t("connexion.teacherPortal.description"),
      icon: Presentation,
      href: "/formateur/login",
      color: "#D4AF37",
      badge: t("connexion.teacherPortal.badge"),
      bg: "from-amber-50 to-white",
      border: "border-amber-100",
      iconBg: "bg-amber-100",
      textColor: "text-[#856404]",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/20 py-12 px-4 relative overflow-hidden">
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto relative">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-12">
          <Link 
            href="/register" 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#003366] transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t("connexion.backToRegister")}</span>
          </Link>
          <Link 
            href="/" 
            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#003366] hover:shadow-md transition-all"
            title={t("connexion.home")}
          >
            <Home size={20} />
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-8 hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-4xl font-extrabold text-[#003366] tracking-tight mb-4">
            {t("connexion.portalTitle")}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t("connexion.portalSubtitle")}
          </p>
        </motion.div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portals.map((portal, idx) => (
            <motion.div
              key={portal.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div 
                className={`group relative h-full bg-gradient-to-br ${portal.bg} rounded-[2.5rem] p-10 border-2 ${portal.border} shadow-xl shadow-blue-900/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col`}
              >
                {/* Badge Status */}
                <div className="absolute top-6 right-6">
                   <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg ${portal.disabled ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {portal.badge}
                   </span>
                </div>

                <div className={`w-16 h-16 ${portal.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <portal.icon size={32} style={{ color: portal.color }} />
                </div>

                <h2 className={`text-2xl font-bold ${portal.textColor} mb-4`}>
                  {portal.title}
                </h2>
                
                <p className="text-gray-500 leading-relaxed mb-8 flex-1">
                  {portal.description}
                </p>

                {portal.disabled ? (
                  <div className="w-full py-4 px-6 rounded-2xl bg-gray-100 text-gray-400 font-bold text-center border border-gray-200">
                    {t("connexion.comingSoon")}
                  </div>
                ) : (
                  <Link 
                    href={portal.href}
                    className="w-full py-4 px-6 rounded-2xl bg-[#003366] text-white font-bold text-center shadow-lg shadow-blue-900/20 hover:bg-[#002244] transition-all transform active:scale-95"
                  >
                    {t("connexion.accessPortal")}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-400 mb-4">{t("connexion.adminQuestion")}</p>
          <Link 
            href="/login" 
            className="text-[#003366] font-bold hover:underline decoration-[#D4AF37] decoration-2 underline-offset-4"
          >
            {t("connexion.adminAccess")}
          </Link>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-16 uppercase tracking-[0.2em] font-bold">
          {t("connexion.secureSystem")}
        </p>
      </div>
    </div>
  );
}
