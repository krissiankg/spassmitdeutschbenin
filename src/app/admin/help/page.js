"use client";
import React, { useState } from "react";
import { 
  BookOpen, 
  UserCheck, 
  CreditCard, 
  ClipboardList, 
  Settings, 
  Shield, 
  HelpCircle,
  ChevronRight,
  Info,
  Calendar,
  Users,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const HelpSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-10 shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800/50 mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
    <div className="flex items-center gap-5 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-[#003366]/5 dark:bg-blue-400/10 flex items-center justify-center text-[#003366] dark:text-blue-400 border border-[#003366]/10 dark:border-blue-400/20">
        <Icon size={28} />
      </div>
      <h2 className="text-3xl font-extrabold text-[#003366] dark:text-gray-100 tracking-tight">{title}</h2>
    </div>
    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
      {children}
    </div>
  </div>
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

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Général", icon: BookOpen },
    { id: "secretary", label: "Secrétariat", icon: UserCheck },
    { id: "accounting", label: "Comptabilité", icon: CreditCard },
    { id: "admin", label: "Administration", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <h1 className="text-5xl font-black text-[#003366] dark:text-white tracking-tighter mb-4">
            Centre d&apos;Aide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
            Guides complets et tutoriels pour maîtriser votre plateforme de gestion d&apos;examens.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 sticky top-24 z-20 bg-[#F8FAFC]/80 dark:bg-[#121212]/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id 
                ? "bg-[#003366] text-white shadow-2xl shadow-blue-900/40 scale-105" 
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
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <HelpSection title="Présentation de la Plateforme" icon={BookOpen}>
              <p className="text-xl">
                L&apos;interface d&apos;administration de **Spass mit Deutsch Benin** a été conçue pour offrir une expérience fluide, sécurisée et performante. Elle automatise les processus critiques tout en garantissant une traçabilité totale.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Info size={80}/></div>
                  <h3 className="font-black text-2xl text-[#003366] dark:text-blue-300 mb-3 flex items-center gap-3">
                    Objectif principal
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Simplifier le cycle de vie d&apos;une session, de l&apos;inscription à la distribution numérique des résultats.</p>
                </div>
                <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Shield size={80}/></div>
                  <h3 className="font-black text-2xl text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-3">
                    Sécurité renforcée
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Un journal d&apos;audit permanent enregistre chaque modification sensible pour prévenir toute erreur humaine.</p>
                </div>
              </div>
            </HelpSection>
          </motion.div>
        )}

        {activeTab === "secretary" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <HelpSection title="Guide du Secrétariat" icon={UserCheck}>
              <div className="space-y-12">
                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4 flex items-center gap-3">
                    <Calendar size={24} /> 1. Gestion des Sessions
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-6">La session est le coeur de l&apos;organisation.</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p>Définissez clairement le **Niveau visé** car il détermine les modules de notes qui seront affichés plus tard.</p>
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    <Users size={24} /> 2. Inscription des Candidats
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Step number="1" title="Mode Individuel" description="Utilisez le formulaire pour les inscriptions tardives ou de dernière minute." />
                    <Step number="2" title="Import Excel (Recommandé)" description="Gagnez du temps en important des centaines de candidats en un seul clic via nos fichiers modèles." />
                  </div>
                  <div className="mt-8 p-6 bg-[#003366]/5 dark:bg-blue-400/5 rounded-3xl border-2 border-dashed border-[#003366]/20 dark:border-blue-400/20">
                    <p className="text-sm font-bold text-[#003366] dark:text-blue-300 flex items-center gap-2">
                       <HelpCircle size={16}/> À SAVOIR : Le système attribue automatiquement un Matricule et un Code Secret dès l&apos;inscription.
                    </p>
                  </div>
                </section>

                <section className="p-10 bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150"><ClipboardList size={200}/></div>
                  <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                    <Shield size={32} className="text-[#D4AF37]" /> Publication Officielle
                  </h3>
                  <p className="text-lg text-blue-100/90 mb-8 max-w-2xl">
                    Le bouton **Publier** ne doit être cliqué qu&apos;une fois la saisie vérifiée.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest">Email auto aux candidats</span>
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest">Ouverture du portail web</span>
                  </div>
                </section>
              </div>
            </HelpSection>
          </motion.div>
        )}

        {activeTab === "accounting" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <HelpSection title="Guide de la Comptabilité" icon={CreditCard}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    Gestion des Flux Financiers
                  </h3>
                  <div className="grid gap-6">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                      <h4 className="font-black text-xl text-emerald-800 dark:text-emerald-400 mb-2">Paiements & Statuts</h4>
                      <p className="text-emerald-700/80 dark:text-emerald-300/80">Le système calcule automatiquement le reste-à-payer pour chaque élève. Un paiement partiel mettra le dossier en &quot;Orange&quot; (Partiel).</p>
                    </div>
                    <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
                      <h4 className="font-black text-xl text-[#003366] dark:text-blue-300 mb-2">Génération de Reçus</h4>
                      <p className="text-blue-800/80 dark:text-blue-300/80">Ne remettez les reçus officiels que via le bouton **Générer Reçu PDF** pour assurer une numérotation unique.</p>
                    </div>
                  </div>
                </section>

                <section className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                  <h4 className="font-black text-xl mb-4">Configuration des Tarifs</h4>
                  <p className="mb-6">C&apos;est ici que vous définissez si un niveau B2 coûte plus cher qu&apos;un niveau A1, ou si l&apos;examen de préparation est inclus ou non.</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <ArrowRight size={16} /> Les tarifs modifiés ne sont pas rétroactifs.
                  </div>
                </section>
              </div>
            </HelpSection>
          </motion.div>
        )}

        {activeTab === "admin" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <HelpSection title="Audit & Sécurité" icon={Shield}>
              <div className="space-y-12">
                <section>
                   <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4">Journal d&apos;Audit Intégral</h3>
                   <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-8">&quot;Rien n&apos;est jamais vraiment supprimé sans trace.&quot;</p>
                   <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex gap-4 items-start">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm">Modification de note : Enregistrée avec l&apos;ancienne et la nouvelle valeur.</p>
                     </div>
                     <div className="flex gap-4 items-start">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm">Suppression de candidat : Trace qui a effectué l&apos;action et quand.</p>
                     </div>
                   </div>
                </section>
              </div>
            </HelpSection>
          </motion.div>
        )}
      </div>
    </div>
  );
}
