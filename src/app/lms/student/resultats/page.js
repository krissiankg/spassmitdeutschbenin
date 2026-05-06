"use client";
import React from "react";
import { Award, Download, FileCheck, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function ResultsPage() {
  const { t } = useTranslations();
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight mb-2">{t("student.results.title")}</h1>
          <p className="text-gray-500">{t("student.results.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Certification Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden"
        >
          <div className="relative z-10">
             <div className="bg-green-50 p-4 rounded-2xl w-fit mb-8 text-green-600">
                <FileCheck size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#003366] mb-4">{t("student.results.certificateTitle", { level: "A1" })}</h3>
             <p className="text-gray-500 leading-relaxed mb-10">
                {t("student.results.certificateDesc", { level: "A1", session: "Mars 2026" })}
             </p>
             <button className="flex items-center gap-2 px-8 py-4 bg-[#003366] text-white font-black rounded-2xl hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/20">
                <Download size={20} /> {t("student.results.downloadCert")}
             </button>
          </div>
          <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-green-50/50 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Action Card */}
        <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 flex flex-col justify-center items-center text-center">
           <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
              <Award size={48} className="text-[#D4AF37]" />
           </div>
           <h3 className="text-xl font-black text-[#003366] mb-2">{t("student.results.viewDetailed")}</h3>
           <p className="text-gray-500 text-sm max-w-xs mb-8">
             {t("student.results.viewDetailedDesc")}
           </p>
           <a 
            href="/consultation" 
            className="flex items-center gap-2 text-[#D4AF37] font-black hover:underline underline-offset-8"
           >
              {t("student.results.accessPortal")} <ExternalLink size={18} />
           </a>
        </div>

      </div>

      {/* Empty State / placeholder for future results */}
      <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
         <p className="text-gray-300 font-black uppercase tracking-widest text-sm italic">{t("student.results.futureResults")}</p>
      </div>

    </div>
  );
}
