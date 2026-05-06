"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Zap,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  Trophy,
  GraduationCap,
  Languages,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslations } from "@/hooks/useTranslations";

const LEVEL_STYLE = {
  A1: { gradient: 'from-[#4361EE] to-[#4CC9F0]', accent: '#4361EE', light: 'bg-blue-50', text: 'text-blue-600' },
  A2: { gradient: 'from-[#3A0CA3] to-[#7209B7]', accent: '#3A0CA3', light: 'bg-purple-50', text: 'text-purple-600' },
  B1: { gradient: 'from-[#D4AF37] to-[#F9E272]', accent: '#D4AF37', light: 'bg-yellow-50', text: 'text-yellow-700' },
  B2: { gradient: 'from-[#C0392B] to-[#E74C3C]', accent: '#C0392B', light: 'bg-red-50', text: 'text-red-600' },
  C1: { gradient: 'from-[#1A1A1B] to-[#3F3F40]', accent: '#1A1A1B', light: 'bg-gray-100', text: 'text-gray-900' },
  C2: { gradient: 'from-[#000000] to-[#2C3E50]', accent: '#000000', light: 'bg-gray-200', text: 'text-black' },
};

const DEFAULT_STYLE = { gradient: 'from-[#003366] to-[#004080]', accent: '#003366', light: 'bg-blue-50', text: 'text-blue-900' };

export default function MesCours() {
  const [activeTab, setActiveTab] = useState("formations");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslations();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        fetch("/api/lms/student/courses"),
        fetch("/api/lms/student/enrollments")
      ]);

      if (coursesRes.ok) setAvailableCourses(await coursesRes.json());
      if (enrollRes.ok) setMyEnrollments(await enrollRes.json());
    } catch (error) {
      console.error("Erreur de chargement:", error);
      toast.error(t("student.courses.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegister = async (courseId, courseName) => {
    const toastId = toast.loading(t("student.courses.registering", { name: courseName }));
    try {
      const res = await fetch("/api/lms/student/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(t("student.courses.registeredSuccess", { name: courseName }), { id: toastId });
        fetchData(); // Rafraîchir
      } else {
        toast.error(data.error || t("student.courses.enrollmentError"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("student.courses.networkError"), { id: toastId });
    }
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = myEnrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.status : null;
  };

  const getStyle = (level) => LEVEL_STYLE[level] || DEFAULT_STYLE;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Background Decorative Patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none opacity-[0.02]">
        <div className="absolute top-20 left-10 text-[15vw] font-black rotate-[-12deg]">SPASS</div>
        <div className="absolute top-[40%] right-10 text-[12vw] font-black rotate-[8deg]">DEUTSCH</div>
        <div className="absolute bottom-20 left-[20%] text-[10vw] font-black rotate-[-5deg]">EXZELLENZ</div>
      </div>

      {/* Modern Header Section */}
      <div className="relative mb-16 overflow-hidden min-h-[400px] flex items-center">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-[#020817]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative px-6 lg:px-12 py-24 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-8 text-center lg:text-left max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                SMD EXZELLENZ HUB
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter"
                >
                  {t("student.courses.title").split(' ')[0]} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    {t("student.courses.title").split(' ').slice(1).join(' ')}
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-lg font-medium max-w-md mx-auto lg:mx-0"
                >
                  {t("student.courses.subtitle")}
                </motion.p>
              </div>
            </div>

            {/* Premium Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] backdrop-blur-3xl p-1.5 rounded-[2rem] border border-white/10 flex items-center shadow-2xl"
            >
              {[
                { id: "formations", label: t("student.courses.myCourses"), icon: GraduationCap },
                { id: "catalogue", label: t("student.courses.catalogue"), icon: BookOpen }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-3 px-8 py-4 rounded-[1.7rem] text-xs font-bold transition-all duration-500 overflow-hidden
                    ${activeTab === tab.id
                      ? "text-[#020817]"
                      : "text-white/50 hover:text-white hover:bg-white/5"}
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon size={16} className="relative z-10" />
                  <span className="relative z-10 uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative px-6 lg:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "formations" ? (
            <motion.div
              key="formations"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="animate-spin text-[#003366]" size={40} />
                </div>
              ) : myEnrollments.filter(e => e.status === 'APPROVED').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {myEnrollments.filter(e => e.status === 'APPROVED').map((enrollment, i) => {
                    const style = getStyle(enrollment.course.level);
                    return (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white rounded-[2.5rem] p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 border border-gray-100/50"
                      >
                        <div className="bg-white rounded-[2.2rem] p-8 h-full flex flex-col relative overflow-hidden">
                          {/* Top Decorative Background */}
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradient} opacity-[0.03] rounded-bl-[5rem]`} />

                          <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg`}>
                              <BookOpen size={28} />
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {t("student.courses.active")}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                                {enrollment.course.level} • {enrollment.course.duration}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-2xl font-black text-[#020817] mb-2 leading-tight relative z-10">
                            {enrollment.course.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10 relative z-10">
                            <Calendar size={12} />
                            {t("student.courses.startedOn", { date: new Date(enrollment.createdAt).toLocaleDateString() })}
                          </div>

                          <div className="mt-auto space-y-8 relative z-10">
                            {/* Progress Section */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{t("student.courses.progression")}</span>
                                <span className="text-xs font-black text-blue-600">30%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "30%" }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full bg-gradient-to-r ${style.gradient} rounded-full`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button className="flex items-center justify-center gap-2 py-4 bg-[#020817] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-900/10 transition-all active:scale-95">
                                {t("student.courses.resume")}
                                <ArrowRight size={14} />
                              </button>
                              <button
                                onClick={() => toast.info(t("student.courses.certAvailableAtEnd"))}
                                className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                              >
                                <Award size={16} />
                                {t("student.courses.diploma")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-32 bg-[#F8FAFF] rounded-[5rem] border-2 border-dashed border-blue-100">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <GraduationCap size={48} className="text-blue-900 opacity-20" />
                  </div>
                  <h3 className="text-3xl font-black text-[#0A192F] mb-3">{t("student.courses.noCourses")}</h3>
                  <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">{t("student.courses.emptyLibrary")}</p>
                  <button
                    onClick={() => setActiveTab("catalogue")}
                    className="px-12 py-6 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-900/30 hover:scale-105 transition-all active:scale-95"
                  >
                    {t("student.courses.discoverCatalogue")}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="catalogue"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-20"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-[#0A192F] tracking-tighter">{t("student.courses.academicPath")}</h2>
                  <p className="text-gray-400 font-medium text-lg">{t("student.courses.chooseNextStep")}</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder={t("student.courses.searchLevel")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-3xl w-full md:w-80 outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all font-bold text-[#0A192F] shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {availableCourses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((course, i) => {
                  const style = getStyle(course.level);
                  const status = getEnrollmentStatus(course.id);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative flex flex-col bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.12)] transition-all duration-700 overflow-hidden border border-gray-100/50"
                    >
                      {/* Top Accent Bar / Pattern */}
                      <div className={`h-32 w-full relative overflow-hidden bg-gradient-to-br ${style.gradient}`}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      </div>

                      {/* Floating Level Seal */}
                      <div className="absolute top-20 left-8">
                        <div className={`w-20 h-20 rounded-2xl bg-white p-1 shadow-2xl shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700`}>
                          <div className={`w-full h-full rounded-[1.2rem] bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-3xl font-black`}>
                            {course.level}
                          </div>
                        </div>
                      </div>

                      {/* Price Ribbon */}
                      <div className="absolute top-6 right-0">
                        <div className={`pl-8 pr-6 py-2 bg-[#020817] text-white font-black text-sm rounded-l-full shadow-xl flex items-center gap-2 border-l-4 border-blue-400`}>
                          <Zap size={14} className="text-yellow-400" />
                          {course.price.toLocaleString()} F
                        </div>
                      </div>

                      <div className="p-8 pt-12 flex-1 flex flex-col">
                        <div className="mb-6 mt-4">
                          <h3 className="text-2xl font-black text-[#020817] leading-tight group-hover:text-blue-600 transition-colors">{course.name}</h3>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${style.light} ${style.text}`}>
                              {course.duration}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                          {course.description || t("student.courses.defaultDesc")}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <Calendar size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-gray-600 truncate">{course.days.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <Clock size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-gray-600 truncate">{course.timeStart}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!status) handleRegister(course.id, course.name);
                          }}
                          disabled={!!status}
                          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 text-xs shadow-lg
                            ${status === 'APPROVED'
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default shadow-none'
                              : status === 'PENDING'
                                ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20 cursor-default shadow-none'
                                : 'bg-[#020817] hover:bg-blue-600 text-white shadow-blue-900/10 hover:shadow-blue-600/30'
                            }
                          `}
                        >
                          {status === 'APPROVED' ? (
                            <>{t("student.courses.enrolled")} <CheckCircle2 size={16} /></>
                          ) : status === 'PENDING' ? (
                            <>{t("student.courses.pending")} <Loader2 size={16} className="animate-spin" /></>
                          ) : (
                            <>{t("student.courses.register")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
