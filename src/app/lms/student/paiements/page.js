"use client";
import React, { useEffect, useState } from "react";
import {
  Wallet,
  Download,
  ArrowUpRight,
  Search,
  Filter,
  CreditCard,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BadgeInfo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import { useTranslations } from "@/hooks/useTranslations";

export default function MyPaymentsPage() {
  const { data: session } = useSession();
  const { t } = useTranslations();

  const [data, setData] = useState({
    candidates: [],
    totalDue: 0,
    totalPaid: 0,
    balance: 0,
    payments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/lms/student/payments");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  if (loading) return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-48 bg-gray-100 rounded-[2.5rem]"></div>
      <div className="h-96 bg-gray-100 rounded-[2.5rem]"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">

      {/* Header & Stats Container */}
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight mb-2">{t("payments.title")}</h1>
          <p className="text-gray-500">{t("payments.subtitle")}</p>

          {data.balance > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-amber-900/5 relative overflow-hidden group"
            >
              <div className="bg-amber-100 p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                <AlertCircle className="text-amber-600" size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-xl text-amber-900 mb-1">{t("payments.alertTitle")}</h4>
                <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                  {t("payments.alertMessage")}
                </p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <div className="px-6 py-3 bg-[#003366] text-white rounded-2xl text-xs font-black uppercase tracking-widest text-center">
                  {t("payments.remaining")}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </motion.div>
          )}
        </div>

        {/* Balance Card Stack */}
        <div className="w-full xl:w-[400px] space-y-4">
          <div className="bg-[#003366] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1">{t("payments.totalDue")}</p>
              <h2 className="text-4xl font-black mb-6">{data.totalDue.toLocaleString()} <span className="text-lg font-medium opacity-60">FCFA</span></h2>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                  <p className="text-[9px] font-bold text-blue-200 uppercase mb-1">{t("payments.totalPaid")}</p>
                  <p className="text-lg font-black text-green-400">{data.totalPaid.toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                  <p className="text-[9px] font-bold text-blue-200 uppercase mb-1">{t("payments.remaining")}</p>
                  <p className="text-lg font-black text-amber-400">{data.balance.toLocaleString()}</p>
                </div>
              </div>
            </div>
            {/* Abstract blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Enrollments & Costs Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-xl">
                  <FileText className="text-[#003366]" size={20} />
                </div>
                <h3 className="text-xl font-black text-[#003366]">{t("payments.enrollmentDetails")}</h3>
              </div>
            </div>

            <div className="p-2">
              {data.candidates.length === 0 ? (
                <div className="p-12 text-center text-gray-400">{t("payments.noFileFound")}</div>
              ) : (
                <div className="space-y-2">
                  {data.candidates.map(candidate => (
                    <div key={candidate.id} className="p-6 hover:bg-gray-50 rounded-[2rem] transition-all group border border-transparent hover:border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="px-3 py-1 bg-[#003366] text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 inline-block">{t("payments.level")} {candidate.level}</span>
                          <h4 className="text-lg font-black text-[#003366]">{t("payments.fileNumber", { number: candidate.candidateNumber })}</h4>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t("payments.status")}</p>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${candidate.paymentStatus === "PAID"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>
                              {candidate.paymentStatus === "PAID" ? t("payments.PAID") : t("payments.UNPAID")}
                            </span>
                          </div>
                          {candidate.paymentStatus === "PAID" && (
                            <button
                              onClick={() => generateInvoicePDF(candidate, session?.user)}
                              className="p-3 bg-[#003366]/5 text-[#003366] hover:bg-[#003366] hover:text-white rounded-2xl transition-all group/btn"
                              title="Télécharger le reçu"
                            >
                              <Download size={20} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                        {/* Courses Enrollments (Simple/Normal) */}
                        {candidate.enrollments.map(en => (
                          <div key={en.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                              <span className="font-bold text-gray-700">{en.course.name}</span>
                              {en.status === 'APPROVED' && <span className="text-[8px] font-black px-1.5 py-0.5 bg-green-100 text-green-700 rounded uppercase">{t("payments.enrolled")}</span>}
                            </div>
                            <span className="font-black text-[#003366]">{en.course.price.toLocaleString()} F</span>
                          </div>
                        ))}

                        {/* OSD Modules */}
                        {candidate.resolvedModules?.map(m => (
                          <div key={m.code} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                              <span className="font-bold text-gray-700">{m.label}</span>
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded uppercase">{t("payments.osdModule")}</span>
                            </div>
                            <span className="font-black text-[#003366]">{m.price.toLocaleString()} F</span>
                          </div>
                        ))}

                        {/* OSD Prep Courses */}
                        {candidate.resolvedPrep?.map(p => (
                          <div key={p.code} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                              <span className="font-bold text-gray-700">{p.label}</span>
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded uppercase">{t("payments.prepCourse")}</span>
                            </div>
                            <span className="font-black text-[#003366]">{p.price.toLocaleString()} F</span>
                          </div>
                        ))}

                        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("payments.subtotal")}</span>
                          <span className="text-lg font-black text-[#003366]">{candidate.totalAmount?.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        {candidate.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => generateInvoicePDF(candidate, session?.user)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-[#003366] hover:bg-blue-50 transition-all shadow-sm"
                          >
                            <Download size={16} /> {t("payments.downloadReceipt")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-xl">
                  <History className="text-amber-600" size={20} />
                </div>
                <h3 className="text-xl font-black text-[#003366]">{t("payments.recentPayments")}</h3>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {data.payments.length === 0 ? (
                <div className="p-12 text-center text-gray-300 text-xs italic">{t("payments.noPaymentEffected")}</div>
              ) : (
                data.payments.map((p, i) => (
                  <div key={p.id} className="p-6 hover:bg-gray-50/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-black text-[#003366]">{new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t("payments.methods." + p.method)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-600">+{p.amount.toLocaleString()} F</p>
                        <p className="text-[10px] text-gray-400 font-bold">{t("payments.level")} {p.candidateLevel}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-[#003366] to-[#004488] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                <BadgeInfo className="text-blue-200" size={24} />
              </div>
              <h4 className="text-xl font-black mb-3">{t("payments.howToPay")}</h4>
              <div className="space-y-4 text-sm text-blue-100/80 leading-relaxed mb-8">
                <p>{t("payments.payOptions")}</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0 text-[10px] font-black">1</div>
                    <span>{t("payments.cashOption")}</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0 text-[10px] font-black">2</div>
                    <span>{t("payments.mobileOption")}</span>
                  </li>
                </ul>
                <p className="text-xs italic mt-4 opacity-60">{t("payments.keepReceipt")}</p>
              </div>
              <button className="w-full py-4 bg-white text-[#003366] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                {t("payments.contactSupport")}
              </button>
            </div>
            <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
          </div>
        </div>

      </div>

      {/* Security Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <CheckCircle2 className="text-green-500 shrink-0" size={32} />
          <p className="text-sm text-[#003366] font-bold leading-tight">{t("payments.adminCertified")}</p>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <CreditCard className="text-blue-500 shrink-0" size={32} />
          <p className="text-sm text-[#003366] font-bold leading-tight">{t("payments.historyAccess")}</p>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <Clock className="text-amber-500 shrink-0" size={32} />
          <p className="text-sm text-[#003366] font-bold leading-tight">{t("payments.realTimeUpdate")}</p>
        </div>
      </div>

    </div>
  );
}
