"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Plus,
  Loader2,
  Wand2,
  Check,
  HelpCircle,
  MessageSquare,
  Wallet,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "react-hot-toast";

const COLORS = ['#003366', '#D4AF37', '#3b82f6', '#10b981', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, trend, color, loading, t }) => (
  <div className="card-premium p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
      </div>
      {trend && !loading && (
        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}%
        </span>
      )}
    </div>
    {loading ? (
      <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mb-1"></div>
    ) : (
      <h3 className="text-3xl font-bold text-[#003366] dark:text-gray-100 mb-1">{value}</h3>
    )}
    <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">{label}</p>
  </div>
);

const RecentMessages = ({ conversations, loading, t }) => (
  <div className="card-premium p-8 h-full flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-[#003366] dark:text-white flex items-center gap-2">
        <MessageSquare size={20} className="text-blue-500" />
        {t("admin.dashboard.messagesRecent")}
      </h3>
      <Link href="/admin/messages" className="text-xs font-black text-[#D4AF37] uppercase tracking-widest hover:underline">{t("admin.dashboard.viewAll")}</Link>
    </div>

    <div className="space-y-4 flex-1">
      {loading ? (
        [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-2xl" />)
      ) : conversations.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
          <MessageSquare size={40} className="mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest">{t("admin.dashboard.noMessages")}</p>
        </div>
      ) : (
        conversations.slice(0, 5).map((conv) => {
          const lastMsg = conv.messages[0];
          const partner = conv.participants.find(p => p.candidate)?.candidate || { firstName: "Inconnu", lastName: "" };
          return (
            <Link key={conv.id} href={`/admin/messages?id=${conv.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-100 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#121212] flex items-center justify-center text-[#003366] font-bold text-xs">
                {partner.firstName[0]}{partner.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-800 dark:text-white truncate">{partner.firstName} {partner.lastName}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{lastMsg?.content || t("admin.dashboard.newConversation")}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          );
        })
      )}
    </div>
  </div>
);

const FinanceQuickStats = ({ stats, loading, t }) => (
  <div className="card-premium p-8 h-full bg-gradient-to-br from-white to-blue-50/30 dark:from-[#1E1E1E] dark:to-[#121212]">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-xl font-bold text-[#003366] dark:text-white flex items-center gap-2">
        <MessageSquare size={20} className="text-emerald-500" />
        {t("admin.dashboard.treasuryStatus")}
      </h3>
      <Link href="/admin/accounting" className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:scale-110 transition-transform">
        <ArrowUpRight size={18} className="text-blue-600" />
      </Link>
    </div>

    {loading ? (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    ) : (
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("admin.dashboard.totalReceived")}</p>
          <h4 className="text-2xl font-black text-emerald-600">{(stats?.totalReceived || 0).toLocaleString()} <span className="text-xs opacity-50">F</span></h4>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("admin.dashboard.remainingToCollect")}</p>
          <h4 className="text-2xl font-black text-orange-600">{(stats?.totalOutstanding || 0).toLocaleString()} <span className="text-xs opacity-50">F</span></h4>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(stats?.totalReceived / stats?.totalExpected * 100) || 0}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase">{((stats?.totalReceived / stats?.totalExpected * 100) || 0).toFixed(0)}%</span>
        </div>
      </div>
    )}
  </div>
);

export default function DashboardPage() {
  const { t } = useTranslations();
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [accountingStats, setAccountingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingConv, setLoadingConv] = useState(true);

  const isSecretary = session?.user?.role === "SECRETARY";
  const hasFinanceAccess = ["SUPER_ADMIN", "ACCOUNTANT"].includes(session?.user?.role);

  // Quick Add Candidate Form
  const [quickForm, setQuickForm] = useState({ firstName: "", lastName: "", level: "A1" });
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickForm.firstName || !quickForm.lastName) return toast.error(t("admin.dashboard.errorFillName"));
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: quickForm.firstName,
          lastName: quickForm.lastName,
          level: quickForm.level,
          email: "",
          sessionId: null,
        })
      });

      if (res.ok) {
        toast.success(t("admin.dashboard.successCandidateAdded"));
        setQuickForm({ firstName: "", lastName: "", level: "A1" });
        fetchDashboardData();
      } else {
        toast.error(t("admin.dashboard.errorCandidateAdd"));
      }
    } catch (err) {
      toast.error(t("admin.dashboard.errorNetwork"));
    } finally {
      setIsAdding(false);
    }
  };

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) setConversations(await res.json());
    } catch (e) { }
    finally { setLoadingConv(false); }
  };

  const fetchAccounting = async () => {
    try {
      const res = await fetch("/api/admin/accounting/stats");
      if (res.ok) setAccountingStats(await res.json());
    } catch (e) { }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchConversations();
    if (hasFinanceAccess) fetchAccounting();
  }, [fetchDashboardData, hasFinanceAccess]);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-[#003366] dark:text-gray-100 tracking-tight">
            {t("common.greeting")}, {session?.user?.name || "Admin"} ! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-500 mt-1">
            {isSecretary
              ? t("admin.dashboard.welcomeSecretary")
              : t("admin.dashboard.welcomeAdmin")}
          </p>
        </motion.div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Calendar size={18} /> {t("admin.dashboard.report")}
          </button>
          {!isSecretary && (
            <Link href="/admin/sessions" className="btn-primary flex items-center gap-2 py-2 text-sm shadow-lg shadow-blue-900/10">
              <Plus size={18} /> {t("admin.dashboard.newSession")}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          icon={Users}
          label={t("admin.dashboard.totalCandidates")}
          value={data?.stats?.totalCandidates?.toLocaleString() || "0"}
          loading={loading}
          color="bg-blue-100 dark:bg-blue-900/30"
          t={t}
        />
        <StatCard
          icon={GraduationCap}
          label={t("admin.dashboard.totalStudents")}
          value={data?.stats?.totalStudents?.toLocaleString() || "0"}
          loading={loading}
          color="bg-emerald-100 dark:bg-emerald-900/30"
          t={t}
        />
        <StatCard
          icon={Calendar}
          label={t("admin.dashboard.activeSessions")}
          value={data?.stats?.activeSessions || "0"}
          loading={loading}
          color="bg-purple-100"
          t={t}
        />
        <StatCard
          icon={CheckCircle}
          label={t("admin.dashboard.publishedResults")}
          value={data?.stats?.publishedResults || "0"}
          loading={loading}
          color="bg-green-100"
          t={t}
        />
        <StatCard
          icon={Clock}
          label={t("admin.dashboard.pendingResults")}
          value={data?.stats?.pendingResults || "0"}
          loading={loading}
          color="bg-orange-100"
          t={t}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 card-premium p-8 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 ">{t("admin.dashboard.registrationFlow")}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">{t("admin.dashboard.last6MonthsActivity")}</p>
            </div>
          </div>
          {loading ? (
            <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-[#003366] dark:text-gray-100 " size={32} /></div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRegistrations || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003366" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#003366" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#003366' }}
                  />
                  <Area type="monotone" dataKey="total" name={t("admin.dashboard.inscriptions")} stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Messaging Quick View */}
        <RecentMessages conversations={conversations} loading={loadingConv} t={t} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Finance Stats (If superadmin or accountant) */}
        {hasFinanceAccess ? (
          <FinanceQuickStats stats={accountingStats} loading={loading} t={t} />
        ) : (
          <div className="card-premium p-8 bg-gradient-to-br from-[#00315f] to-[#01213f] text-white border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
              <HelpCircle size={24} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{t("admin.dashboard.needHelp")}</h3>
            <p className="text-sm text-blue-100/80 mb-8 leading-relaxed">
              {t("admin.dashboard.helpGuidesDesc")}
            </p>
            <Link href="/admin/help" className="group/btn flex items-center justify-between w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#b8952d] text-[#003366] rounded-2xl transition-all shadow-lg shadow-[#D4AF37]/20">
              <span className="font-bold text-sm">{t("admin.dashboard.openTutorial")}</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}

        {/* Level Chart */}
        <div className="card-premium p-8">
          <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-2">{t("admin.dashboard.activePaths")}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{t("admin.dashboard.distributionByLevel")}</p>
          {loading ? (
            <div className="h-48 flex justify-center items-center"><Loader2 className="animate-spin text-[#003366] dark:text-gray-100 " size={32} /></div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.levelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {data?.levelDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {data?.levelDistribution?.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#003366] dark:text-gray-100 ">{t("admin.dashboard.quickAdd")}</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{t("admin.dashboard.newCandidate")}</p>
            </div>
          </div>

          <form onSubmit={handleQuickAdd} className="space-y-4">
            <input value={quickForm.firstName} onChange={e => setQuickForm({ ...quickForm, firstName: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none" placeholder={t("admin.dashboard.firstName")} />
            <input value={quickForm.lastName} onChange={e => setQuickForm({ ...quickForm, lastName: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none" placeholder={t("admin.dashboard.lastName")} />
            <select value={quickForm.level} onChange={e => setQuickForm({ ...quickForm, level: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none">
              <option value="A1">{t("admin.dashboard.levelA1")}</option>
              <option value="A2">{t("admin.dashboard.levelA2")}</option>
              <option value="B1">{t("admin.dashboard.levelB1")}</option>
              <option value="B2">{t("admin.dashboard.levelB2")}</option>
            </select>
            <button disabled={isAdding} className="w-full mt-2 py-3 bg-[#003366] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#002244] transition-colors flex items-center justify-center gap-2">
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {t("admin.dashboard.generateDossier")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
