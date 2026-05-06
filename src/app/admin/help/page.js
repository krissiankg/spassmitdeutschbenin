"use client";
import React, { useState } from "react";
import { 
  BookOpen, 
  UserCheck, 
  CreditCard, 
  ClipboardList, 
  Shield, 
  HelpCircle,
  Info,
  Calendar,
  Users,
  MessageSquare,
  Lock,
  PieChart,
  Mail,
  Zap,
  ArrowRight,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

const HelpSection = ({ title, icon: Icon, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800/50 mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/10"
  >
    <div className="flex items-center gap-5 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-[#003366]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#003366] dark:text-[#D4AF37] border border-[#003366]/10 dark:border-[#D4AF37]/20">
        <Icon size={28} />
      </div>
      <h2 className="text-3xl font-black text-[#003366] dark:text-gray-100 tracking-tight">{title}</h2>
    </div>
    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
      {children}
    </div>
  </motion.div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-5 group">
    <div className="w-10 h-10 rounded-full bg-[#003366] dark:bg-[#D4AF37] text-white dark:text-[#003366] flex items-center justify-center font-black shrink-0 text-lg shadow-lg shadow-blue-900/10">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 transition-colors group-hover:text-[#003366] dark:group-hover:text-[#D4AF37]">{title}</h4>
      <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-[#003366] dark:text-blue-300",
    amber: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-400"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden group ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Icon size={80}/></div>
      <h3 className="font-black text-2xl mb-3 flex items-center gap-3">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 font-medium">{desc}</p>
    </div>
  );
};

export default function HelpPage() {
  const { t, loaded } = useTranslations();
  const [activeTab, setActiveTab] = useState("general");

  if (!loaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: t("admin.help.tabs.general"), icon: BookOpen },
    { id: "secretary", label: t("admin.help.tabs.secretary"), icon: UserCheck },
    { id: "accounting", label: t("admin.help.tabs.accounting"), icon: CreditCard },
    { id: "communication", label: t("admin.help.tabs.communication"), icon: MessageSquare },
    { id: "security", label: t("admin.help.tabs.security"), icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-black uppercase tracking-widest rounded-full border border-[#D4AF37]/20">
              {t("admin.help.sections.adminGuideTag")}
            </span>
          </div>
          <h1 className="text-6xl font-black text-[#003366] dark:text-white tracking-tighter mb-4">
            {t("admin.help.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
            {t("admin.help.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 sticky top-24 z-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-lg shadow-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id 
                ? "bg-[#003366] text-white shadow-xl shadow-blue-900/40 scale-105" 
                : "bg-white dark:bg-[#1E1E1E] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? "text-[#D4AF37]" : ""} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {activeTab === "general" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.presentation.title")} icon={BookOpen}>
              <p className="text-xl font-medium">
                {t("admin.help.sections.presentation.desc")}
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <FeatureCard 
                  title={t("admin.help.sections.presentation.objective")} 
                  desc={t("admin.help.sections.presentation.objectiveDesc")} 
                  icon={Zap} 
                  color="blue" 
                />
                <FeatureCard 
                  title={t("admin.help.sections.presentation.security")} 
                  desc={t("admin.help.sections.presentation.securityDesc")} 
                  icon={Shield} 
                  color="amber" 
                />
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "secretary" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.secretary.title")} icon={UserCheck}>
              <div className="space-y-12">
                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4 flex items-center gap-3">
                    <Calendar size={24} /> {t("admin.help.sections.secretary.sessions")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">{t("admin.help.sections.secretary.sessionsDesc")}</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <Info className="text-[#003366] dark:text-[#D4AF37]" />
                    <p className="text-sm font-bold uppercase tracking-wide">{t("payments.draftVsPublished")}</p>
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    <Users size={24} /> {t("admin.help.sections.secretary.candidates")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Step number="1" title={t("admin.help.sections.secretary.modeIndividual")} description={t("admin.help.sections.secretary.modeIndividualDesc")} />
                    <Step number="2" title={t("admin.help.sections.secretary.modeImport")} description={t("admin.help.sections.secretary.modeImportDesc")} />
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4 flex items-center gap-3">
                    <Mail size={24} /> {t("admin.help.sections.secretary.credentials")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">{t("admin.help.sections.secretary.credentialsDesc")}</p>
                </section>

                <div className="p-10 bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150"><ClipboardList size={200}/></div>
                  <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                    <Shield size={32} className="text-[#D4AF37]" /> {t("admin.help.sections.secretary.results")}
                  </h3>
                  <p className="text-lg text-blue-100/90 mb-8 max-w-2xl">
                    {t("admin.help.sections.secretary.resultsDesc")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400" /> {t("payments.autoEmail")}
                    </span>
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400" /> {t("payments.portalAccess")}
                    </span>
                  </div>
                </div>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "accounting" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.accounting.title")} icon={CreditCard}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    {t("admin.help.sections.accounting.flows")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <FeatureCard 
                      title={t("admin.help.sections.accounting.status")} 
                      desc={t("admin.help.sections.accounting.statusDesc")} 
                      icon={PieChart} 
                      color="emerald" 
                    />
                    <FeatureCard 
                      title={t("admin.help.sections.accounting.receipts")} 
                      desc={t("admin.help.sections.accounting.receiptsDesc")} 
                      icon={FileText} 
                      color="blue" 
                    />
                  </div>
                </section>

                <section className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                  <h4 className="font-black text-2xl text-[#003366] dark:text-[#D4AF37] mb-4 flex items-center gap-3">
                    <Zap size={24} /> {t("admin.help.sections.accounting.pricing")}
                  </h4>
                  <p className="mb-6 font-medium">{t("admin.help.sections.accounting.pricingDesc")}</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <ArrowRight size={16} /> {t("payments.pricingNotice")}
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-emerald-100 dark:border-emerald-900">
                  <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mb-4">
                    {t("admin.help.sections.accounting.dashboard")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{t("admin.help.sections.accounting.dashboardDesc")}</p>
                </section>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.communication.title")} icon={MessageSquare}>
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <Step number="1" title={t("admin.help.sections.communication.chat")} description={t("admin.help.sections.communication.chatDesc")} />
                  <Step number="2" title={t("admin.help.sections.communication.attachments")} description={t("admin.help.sections.communication.attachmentsDesc")} />
                </div>
                
                <section className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-2xl font-black text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-3">
                    <Mail size={24} /> {t("admin.help.sections.communication.notifications")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {t("admin.help.sections.communication.notificationsDesc")}
                  </p>
                </section>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.security.title")} icon={Shield}>
              <div className="space-y-12">
                <section>
                   <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4">{t("admin.help.sections.security.audit")}</h3>
                   <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-8">{t("admin.help.sections.security.auditDesc")}</p>
                   <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex gap-4 items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm font-medium">{t("payments.auditDetail1")}</p>
                     </div>
                     <div className="flex gap-4 items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm font-medium">{t("payments.auditDetail2")}</p>
                     </div>
                   </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  <FeatureCard 
                    title={t("admin.help.sections.security.rbac")} 
                    desc={t("admin.help.sections.security.rbacDesc")} 
                    icon={Lock} 
                    color="amber" 
                  />
                  <FeatureCard 
                    title={t("admin.help.sections.security.twoFactor")} 
                    desc={t("admin.help.sections.security.twoFactorDesc")} 
                    icon={Shield} 
                    color="indigo" 
                  />
                </div>
              </div>
            </HelpSection>
          </div>
        )}
      </div>

      {/* FAQ Quick Link */}
      <div className="p-12 bg-white dark:bg-[#1A1A1A] rounded-[3rem] border border-gray-100 dark:border-gray-800 text-center shadow-xl shadow-black/5">
        <HelpCircle size={48} className="mx-auto text-[#D4AF37] mb-6" />
        <h2 className="text-3xl font-black text-[#003366] dark:text-white mb-4">{t("admin.help.sections.footer.title")}</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {t("admin.help.sections.footer.desc")}
        </p>
        <a 
          href="https://wa.me/22966368705" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          {t("admin.help.sections.footer.button")}
        </a>
      </div>
    </div>
  );
}
