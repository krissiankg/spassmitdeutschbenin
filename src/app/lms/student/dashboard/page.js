"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Clock,
  Award,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  FileText,
  ChevronRight,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

const StatCard = ({ title, value, icon: Icon, color, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-[#003366]">{value}</h3>
  </motion.div>
);

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslations();
  const [data, setData] = useState(null);
  const [formSettings, setFormSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, settingsRes] = await Promise.all([
          fetch("/api/lms/student/overview"),
          fetch("/api/form-settings")
        ]);

        const overviewJson = await overviewRes.json();
        const settingsJson = await settingsRes.json();

        setData(overviewJson);
        setFormSettings(settingsJson.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-[2rem]"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] bg-white rounded-[2.5rem]"></div>
        <div className="h-[500px] bg-white rounded-[2.5rem]"></div>
      </div>
    </div>
  );

  const stats = [
    { title: t("student.dashboard.activeEnrollments"), value: data?.totalLevels || 0, icon: BookOpen, color: "bg-blue-500", trend: "+1 ce mois" },
    { title: t("student.dashboard.completedCourses"), value: "0", icon: Award, color: "bg-green-500" },
    { title: t("student.dashboard.courseHours"), value: "32h", icon: Clock, color: "bg-purple-500", trend: "Assiduité 95%" },
    { title: t("student.dashboard.remainingBalance"), value: `${(data?.remainingBalance || 0).toLocaleString()} FCFA`, icon: CreditCard, color: "bg-orange-500" },
  ];

  const osdActive = formSettings?.osdFormActive;

  return (
    <div className="space-y-10">

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tight mb-2">
            {t("student.dashboard.welcome")}, {session?.user?.name?.split(' ')[0]} ! 👋
          </h1>
          <p className="text-gray-500 font-medium">{t("student.dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/lms/student/planning')} className="bg-white border border-gray-200 text-[#003366] font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg shadow-blue-900/5">
            <Calendar size={18} /> {t("nav.planning")}
          </button>
          <button onClick={() => router.push('/lms/student/resultats')} className="bg-[#003366] text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/20">
            {t("student.dashboard.viewResults")} <ArrowUpRight size={18} />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Next Classes Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col"
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-[#003366]">{t("student.dashboard.activeCoursesTitle")}</h2>
            <button onClick={() => router.push('/lms/student/mes-cours')} className="text-sm font-bold text-[#D4AF37] hover:underline">{t("student.dashboard.accessCourses")}</button>
          </div>

          <div className="space-y-6 flex-1">
            {data?.enrollments?.filter(e => e.status === 'APPROVED').length > 0 ? (
              data.enrollments.filter(e => e.status === 'APPROVED').map((enrollment, i) => (
                <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:border-[#D4AF37]/30 transition-all group cursor-pointer" onClick={() => router.push('/lms/student/mes-cours')}>
                  <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                    <BookOpen size={24} className="text-[#003366]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-[#003366] mb-1">{enrollment.courseName}</h4>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <span className="text-[#D4AF37] font-black uppercase text-[10px] tracking-widest">{enrollment.courseLevel}</span>
                      • <span>{enrollment.days.join(', ')}</span>
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-black text-[#003366]">{enrollment.timeStart} - {enrollment.timeEnd}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                      <Clock size={12} /> {t("student.dashboard.fixedSchedule")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <BookOpen size={32} />
                </div>
                <p className="text-gray-400 font-bold text-sm">{t("student.dashboard.noActiveCourses")}</p>
                <button onClick={() => router.push('/lms/student/mes-cours')} className="mt-4 text-[#D4AF37] text-xs font-black uppercase tracking-widest hover:underline">{t("student.dashboard.viewCatalogue")}</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action / Notification Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#003366] to-[#002244] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden flex flex-col"
        >
          {/* Decorative element */}
          <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-[#D4AF37]/20 p-4 rounded-2xl w-fit">
                <AlertCircle size={32} className="text-[#D4AF37]" />
              </div>
              {osdActive ? (
                <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {t("register.openStatus")}
                </span>
              ) : (
                <span className="bg-gray-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <Lock size={10} />
                  {t("register.notAvailable")}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black mb-4 tracking-tight">{t("student.dashboard.importantInfo.title")}</h2>
            <p className="text-blue-100/70 text-sm leading-relaxed mb-8 flex-1">
              {osdActive
                ? t("student.dashboard.importantInfo.osdOpenDesc")
                : t("student.dashboard.importantInfo.osdClosedDesc")}
            </p>

            <div className="space-y-4">
              <button
                disabled={!osdActive}
                onClick={() => router.push('/register/osd')}
                className={`w-full py-5 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group
                  ${osdActive
                    ? "bg-[#D4AF37] text-[#003366] shadow-yellow-900/20 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed grayscale"
                  }
                `}
              >
                {osdActive ? t("student.dashboard.importantInfo.osdRegisterBtn") : t("student.dashboard.importantInfo.unavailable")}
                {osdActive && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              <button onClick={() => router.push('/lms/student/paiements')} className="w-full py-4 bg-white/5 text-white/70 font-black rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-xs uppercase tracking-widest">
                Consulter mes reçus
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex items-center gap-6 cursor-pointer hover:bg-gray-50/50 transition-all" onClick={() => router.push('/lms/student/resultats')}>
          <div className="bg-blue-50 p-5 rounded-3xl">
            <FileText size={28} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-[#003366] mb-1">{t("student.dashboard.announcements.monthlyReport")}</h4>
            <p className="text-sm text-gray-500">{t("student.dashboard.announcements.monthlyReportDesc")}</p>
          </div>
          <button className="p-3 text-gray-300 hover:text-[#003366] transition-colors"><ArrowUpRight /></button>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex items-center gap-6">
          <div className="bg-amber-50 p-5 rounded-3xl">
            <Users size={28} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-[#003366] mb-1">{t("student.dashboard.announcements.germanNight")}</h4>
            <p className="text-sm text-gray-500">{t("student.dashboard.announcements.germanNightDesc")}</p>
          </div>
          <button className="p-3 text-gray-300 hover:text-[#003366] transition-colors"><ArrowUpRight /></button>
        </div>
      </div>

    </div>
  );
}
