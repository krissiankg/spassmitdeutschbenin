"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  ShieldCheck,
  Award,
  BookOpen,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { formatOSDResults } from "@/lib/osd-config";
import { useTranslations } from "@/hooks/useTranslations";

const DecisionBadge = ({ decision }) => {
  const config = {
    ADMIS: { icon: CheckCircle, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "ADMIS / BESTANDEN" },
    "AJOURNÉ": { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200", label: "AJOURNÉ / NICHT BESTANDEN" },
    AJOURNE: { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200", label: "AJOURNÉ / NICHT BESTANDEN" },
    PARTIEL: { icon: AlertTriangle, color: "bg-amber-50 text-amber-700 border-amber-200", label: "RÉSULTAT PARTIEL / TEILERGEBNIS" },
    ABSENT: { icon: XCircle, color: "bg-gray-100 text-gray-500 border-gray-200", label: "ABSENT" },
  };
  const c = config[decision] || config.ABSENT;
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold ${c.color}`}>
      <Icon size={20} />
      {c.label}
    </div>
  );
};

const ScoreRow = ({ name, score, maxScore, minScore, isTotal = false }) => {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-0 ${isTotal ? 'font-black text-sm' : 'text-sm'}`}>
      <div className="flex-1">
        <span className={isTotal ? 'text-[#003366]' : 'text-gray-600'}>{name}</span>
        {!isTotal && minScore !== undefined && (
          <span className="text-xs text-gray-400 ml-2">(max. {maxScore} / min. {minScore})</span>
        )}
        {isTotal && minScore !== undefined && (
          <span className="text-xs text-gray-400 ml-2">(max. {maxScore} / min. {minScore})</span>
        )}
      </div>
      <div className={`w-16 text-center border p-1 font-bold ${isTotal ? 'border-[#003366] text-[#003366] text-lg' : 'border-gray-300 text-gray-700'}`}>
        {score}
      </div>
    </div>
  );
};

const GroupBadge = ({ passed }) => (
  <div className={`px-4 py-1 border text-sm font-bold uppercase ${passed ? "border-[#10B981] text-[#10B981]" : "border-red-500 text-red-500"}`}>
    {passed ? "bestanden" : "nicht bestanden"}
  </div>
);

function formatDate(dateStr, locale = "fr") {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const localeMap = { fr: "fr-FR", en: "en-US", de: "de-DE" };
  return d.toLocaleDateString(localeMap[locale] || "fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ConsultationPage() {
  const { t, locale } = useTranslations();
  const [candidateNumber, setCandidateNumber] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null); // { candidate, results }
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!candidateNumber || !code) {
      toast.error(t("consultation.errors.fillFields"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateNumber: candidateNumber.trim(),
          consultationCode: code.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t("consultation.errors.notFound"));
        toast.error(json.error || t("consultation.errors.notFound"));
      } else {
        setData(json);
        toast.success(t("consultation.resultsFound"));
      }
    } catch (err) {
      setError(t("consultation.errors.serverError"));
      toast.error(t("consultation.errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    setCandidateNumber("");
    setCode("");
  };

  const handleDownloadPDF = async (result) => {
    // Dynamic import to avoid SSR issues with jsPDF
    const { generateResultPDF } = await import("@/lib/pdf-utils");
    const { formatOSDResults } = await import("@/lib/osd-config");
    
    const osdData = formatOSDResults(data.candidate.level, result.moduleScores);
    
    generateResultPDF(data.candidate, result.session, osdData, result);
    toast.success(t("consultation.downloadPdf"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="glass border-b border-gray-100 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-[#003366] font-bold">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span>Spass mit Deutsch</span>
          </Link>
          <div className="flex items-center gap-4">
            {data && (
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-[#003366] flex items-center gap-2 text-sm transition-colors"
              >
                <RefreshCw size={16} /> {t("consultation.newSearch")}
              </button>
            )}
            <Link
              href="/"
              className="text-gray-500 hover:text-[#003366] flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft size={16} /> {t("consultation.backHome")}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-10 pb-16">
        <AnimatePresence mode="wait">
          {!data ? (
            /* ========================================= */
            /* SEARCH FORM                                */
            /* ========================================= */
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto mt-10"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-blue-50 text-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search size={40} />
                  </div>
                  <h1 className="text-3xl font-bold text-[#003366] mb-3">
                    {t("consultation.title")}
                  </h1>
                  <p className="text-gray-500">
                    {t("consultation.searchSubtitle")}
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("consultation.candidateNumberLabel")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("consultation.candidateNumberPlaceholder")}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                      value={candidateNumber}
                      onChange={(e) => setCandidateNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("consultation.codeLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder={t("consultation.codePlaceholder")}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <ShieldCheck
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium"
                    >
                      <XCircle size={18} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        {t("consultation.searchingButton")}
                      </span>
                    ) : (
                      <>
                        {t("consultation.searchButton")}{" "}
                        <ArrowLeft className="rotate-180" size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h4 className="font-bold text-[#003366] mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-[#D4AF37]" size={18} /> {t("consultation.helpTitle")}
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                    <li className="flex items-start gap-2 italic">
                      • {t("consultation.helpItem1")}
                    </li>
                    <li className="flex items-start gap-2 italic">
                      • {t("consultation.helpItem2")}
                    </li>
                    <li className="flex items-start gap-2 italic">
                      • {t("consultation.helpItem3")}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ========================================= */
            /* RESULTS DISPLAY                            */
            /* ========================================= */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Candidate Header Card */}
              <div className="bg-gradient-to-br from-[#003366] to-[#004d99] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
                        {t("consultation.candidateHeader.candidate")}
                      </p>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1">
                        {data.candidate.firstName} {data.candidate.lastName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                          <GraduationCap size={16} className="text-[#D4AF37]" />
                          {t("consultation.candidateHeader.level")} {data.candidate.level}
                        </span>
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                          <BookOpen size={16} className="text-[#D4AF37]" />
                          N° {data.candidate.candidateNumber}
                        </span>
                        {data.candidate.center && (
                          <span className="text-white/40 text-sm">
                            {data.candidate.center}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <Award size={20} className="text-[#D4AF37]" />
                      <span className="text-sm font-bold">
                        {data.results.length} {t("consultation.candidateHeader.resultsPublished")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results - One card per session */}
              {data.results.map((result, idx) => {
                const osdData = formatOSDResults(data.candidate.level, result.moduleScores);

                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (idx + 1) }}
                    className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
                  >
                    {/* Session Header */}
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#003366]">
                          ÖSD Zertifikat {data.candidate.level}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar size={14} />
                          {t("consultation.sessionDate")} {formatDate(result.session.date, locale)}
                        </p>
                      </div>
                      <DecisionBadge decision={result.decision} />
                    </div>

                    {/* Module Scores OSD Style */}
                    <div className="px-8 py-8 space-y-10">
                      
                      {/* Schriftliche Prüfung */}
                      {osdData.schriftlich.modules.length > 0 && (
                        <div>
                           <div className="flex justify-between items-end mb-4 border-b-2 border-[#003366] pb-2">
                             <h4 className="font-bold text-[#003366] text-lg uppercase">
                               Schriftliche Prüfung am {formatDate(result.session.date, locale)}
                             </h4>
                             <GroupBadge passed={osdData.schriftlich.passed} />
                           </div>
                           <div className="pl-4">
                             {osdData.schriftlich.modules.map((m, i) => (
                               <ScoreRow key={i} name={m.moduleName} score={m.score} maxScore={m.maxScore} minScore={m.minScore} />
                             ))}
                             <div className="mt-4">
                               <ScoreRow 
                                  name="Schriftliche Prüfung gesamt" 
                                  score={osdData.schriftlich.score} 
                                  maxScore={osdData.schriftlich.max} 
                                  minScore={osdData.schriftlich.min} 
                                  isTotal={true} 
                               />
                             </div>
                           </div>
                        </div>
                      )}

                      {/* Mündliche Prüfung */}
                      {osdData.muendlich.modules.length > 0 && (
                        <div>
                           <div className="flex justify-between items-end mb-4 border-b-2 border-[#003366] pb-2">
                             <h4 className="font-bold text-[#003366] text-lg uppercase">
                               Mündliche Prüfung am {formatDate(result.session.date, locale)}
                             </h4>
                             <GroupBadge passed={osdData.muendlich.passed} />
                           </div>
                           <div className="pl-4">
                             {osdData.muendlich.modules.map((m, i) => (
                               <ScoreRow key={i} name={m.moduleName} score={m.score} maxScore={m.maxScore} minScore={m.minScore} />
                             ))}
                           </div>
                        </div>
                      )}

                      {/* Gesamt */}
                      <div className="pt-6 border-t-4 border-gray-100">
                         <div className="flex justify-between items-center mb-4">
                             <h4 className="font-black text-[#003366] text-xl">
                               ÖSD Zertifikat {data.candidate.level}
                             </h4>
                             <GroupBadge passed={osdData.total.passed} />
                         </div>
                         <div className="pl-4">
                           <ScoreRow 
                              name="GESAMTPUNKTEZAHL" 
                              score={osdData.total.score} 
                              maxScore={osdData.total.max} 
                              minScore={osdData.total.min} 
                              isTotal={true} 
                           />
                         </div>
                      </div>

                    </div>

                    {/* Summary Footer */}
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                       <div className="flex flex-col sm:flex-row items-center gap-6">
                          {result.mention && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">
                                {t("consultation.mention")}
                              </p>
                              <p className="text-lg font-bold text-[#003366]">
                                {result.mention}
                              </p>
                            </div>
                          )}
                       </div>
                       <button
                          onClick={() => handleDownloadPDF(result)}
                          className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/20 hover:translate-y-[-1px]"
                        >
                          <Download size={18} />
                          {t("consultation.downloadPdf")}
                        </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Info footer */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                <ShieldCheck size={24} className="text-[#003366] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#003366] mb-1">
                    {t("consultation.importantInfoTitle")}
                  </p>
                  <p className="text-sm text-blue-800/70 leading-relaxed">
                    {t("consultation.importantInfoText")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-10 text-gray-400 text-xs shadow-inner">
        <p>© 2026 Spass mit Deutsch Benin. {t("public.footer.rights")}</p>
      </footer>
    </div>
  );
}
