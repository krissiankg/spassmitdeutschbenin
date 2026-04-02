"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,

  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { generateResultPDF } from "@/lib/pdf-utils";
import { toast } from "react-hot-toast";

const ResultRow = ({ label, score, max, min, isSubtotal, isTotal }) => (
  <div className={`flex justify-between items-center py-4 border-b border-gray-50 last:border-0 ${isSubtotal ? 'bg-gray-50/50 -mx-2 px-2 rounded-lg' : ''} ${isTotal ? 'bg-[#003366]/5 -mx-2 px-2 rounded-lg' : ''}`}>
    <div>
      <span className={`font-medium ${isSubtotal || isTotal ? 'font-bold text-[#003366]' : 'text-gray-700'}`}>{label}</span>
      {min !== undefined && <span className="text-[10px] text-gray-400 ml-2">(min. {min})</span>}
    </div>
    <div className="flex items-center gap-4">
      <span className={`text-xl font-black ${score >= (min || 0) ? 'text-[#003366]' : 'text-red-500'}`}>{score}</span>
      <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg">/ {max}</span>
    </div>
  </div>
);

const SectionHeader = ({ title, status }) => (
  <div className="flex justify-between items-center py-3 mt-2">
    <span className="text-sm font-bold text-[#003366] uppercase tracking-wider">{title}</span>
    {status && <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'bestanden' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>}
  </div>
);

export default function ResultDetailPage() {
  // Mock data - would be fetched from API in real app
  const candidate = {
    name: "AGOSSOU Marie",
    number: "2603002",
    level: "B2",
    status: "bestanden",
    total: 69,
    totalMax: 100,
    totalMin: 60,
    code: "XYZ789"
  };

  const session = {
    title: "Session Mars 2026",
    date: "2026-03-15",
  };

  // B2 structure based on ÖSD Zertifikat B2
  const schriftlicheResults = [
    { module: "Lesen", score: 15, max: 20, min: 10 },
    { module: "Hören", score: 18, max: 20, min: 10 },
    { module: "Schreiben", score: 16, max: 30, min: 15 },
  ];
  const schriftlicheGesamt = { score: 49, max: 70, min: 42 };

  const muendlicheResults = [
    { module: "Sprechen", score: 20, max: 30, min: 18 },
  ];

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.loading("Génération du relevé de notes...");
    try {
      await generateResultPDF(candidate, session, results);
      toast.dismiss();
      toast.success("Téléchargement réussi !");
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de la génération du PDF.");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <nav className="glass border-b border-gray-100 py-4 bg-white/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-[#003366] font-bold">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span>Spass mit Deutsch</span>
          </Link>
          <Link href="/consultation" className="text-gray-500 hover:text-[#003366] flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft size={16} /> Nouvelle recherche
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Card */}
          <div className="bg-[#003366] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <span className="inline-block bg-[#D4AF37] text-white text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full mb-4">
                  Résultat Officiel
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-4">{candidate.name}</h1>
                <div className="flex flex-wrap gap-6 text-white/60 text-sm font-medium">
                  <span className="flex items-center gap-2"><User size={16} className="text-[#D4AF37]" /> {candidate.number}</span>
                  <span className="flex items-center gap-2"><Calendar size={16} className="text-[#D4AF37]" /> {session.title}</span>
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-[#D4AF37]" /> Cotonou, Bénin</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center min-w-[180px]">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-2">Décision</p>
                <div className="flex flex-col items-center gap-2">
                  {candidate.status === "ADMIS" ? (
                    <CheckCircle2 size={48} className="text-green-400 mb-2" />
                  ) : (
                    <XCircle size={48} className="text-red-400 mb-2" />
                  )}
                  <span className="text-2xl font-black tracking-tighter">{candidate.status}</span>
                </div>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                <circle cx="100" cy="0" r="30" />
                <circle cx="0" cy="100" r="20" />
              </svg>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Scores Detail */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
                  <FileText className="text-[#D4AF37]" size={20} /> Détail des notes — ÖSD Zertifikat {candidate.level}
                </h3>
                
                <SectionHeader title="Schriftliche Prüfung" status="bestanden" />
                <div className="divide-y divide-gray-50">
                  {schriftlicheResults.map((res, i) => (
                    <ResultRow key={i} label={res.module} score={res.score} max={res.max} min={res.min} />
                  ))}
                  <ResultRow label="Schriftliche Prüfung gesamt" score={schriftlicheGesamt.score} max={schriftlicheGesamt.max} min={schriftlicheGesamt.min} isSubtotal />
                </div>

                <SectionHeader title="Mündliche Prüfung" status="bestanden" />
                <div className="divide-y divide-gray-50">
                  {muendlicheResults.map((res, i) => (
                    <ResultRow key={i} label={res.module} score={res.score} max={res.max} min={res.min} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 bg-gradient-to-br from-white to-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#003366] mb-1">Gesamtpunktezahl</h3>
                    <p className="text-sm text-gray-400">Score total sur l&apos;ensemble des épreuves (min. {candidate.totalMin})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-[#003366]">{candidate.total}<span className="text-lg opacity-30"> / {candidate.totalMax}</span></p>
                    <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28">
                <h4 className="font-bold text-[#003366] mb-6">Documents</h4>
                <div className="space-y-4">
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10 disabled:opacity-70"
                  >
                    {isDownloading ? (
                      "Génération..."
                    ) : (
                      <>Télécharger PDF <Download size={20} /></>
                    )}
                  </button>
                  <button className="w-full btn-secondary py-4 flex items-center justify-center gap-3">
                    Imprimer <Printer size={20} />
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-50 bg-yellow-50/50 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <div className="flex gap-3 items-start">
                    <AlertCircle size={20} className="text-[#D4AF37] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#b08f2a] uppercase tracking-wider mb-2">Information</p>
                      <p className="text-xs text-[#8d7121] leading-relaxed">
                        Ce relevé numérique est provisoire. Le certificat officiel sera disponible au centre 15 jours après la délibération.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#D4AF37] rounded-3xl p-8 text-white shadow-xl shadow-yellow-900/10">
                <Trophy size={40} className="mb-4 text-white/30" />
                <h4 className="text-xl font-bold mb-2">Félicitations !</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  Votre réussite témoigne de votre investissement. Continuez vos efforts pour passer au niveau supérieur.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="text-center py-12 text-gray-400 text-xs">
        <p>© 2026 Spass mit Deutsch Benin. Plateforme de Résultats Numérique.</p>
        <div className="flex justify-center gap-6 mt-4">
          <span>Identifiant vérifié: {candidate.code}</span>
        </div>
      </footer>
    </div>
  );
}
