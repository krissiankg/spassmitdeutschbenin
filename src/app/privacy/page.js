"use client";
import React from "react";
import { ShieldCheck, Eye, Lock, FileText, UserCheck, ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#1E293B] dark:text-gray-300">
      {/* Header Section */}
      <div className="relative bg-[#003366] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Politique de Confidentialité</h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Conformément au Code du Numérique du Bénin (Loi n° 2017-20), nous nous engageons à protéger vos données personnelles et votre vie privée.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-20">
        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800 p-8 md:p-12 space-y-12">
          
          {/* Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <ShieldCheck size={28} />
              <h2 className="text-2xl font-bold">Engagement de Protection</h2>
            </div>
            <p className="leading-relaxed">
              Le centre <strong>Spass mit Deutsch Benin</strong> accorde une importance capitale à la sécurité de vos informations. Cette politique détaille la manière dont nous collectons, utilisons et protégeons vos données personnelles dans le cadre de nos services de formation et d&apos;examens.
            </p>
          </section>

          {/* Data Collection */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <Eye size={28} />
              <h2 className="text-2xl font-bold">Données Collectées</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Identité", desc: "Nom, prénoms, date et lieu de naissance, nationalité." },
                { title: "Contact", desc: "Adresse email, numéro de téléphone, adresse de résidence." },
                { title: "Académique", desc: "Niveau de langue, inscriptions aux cours et résultats d'examens." },
                { title: "Financier", desc: "Historique des paiements et reçus de scolarité." }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-[#003366] dark:text-gray-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Finalities */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <FileText size={28} />
              <h2 className="text-2xl font-bold">Finalités du Traitement</h2>
            </div>
            <p className="leading-relaxed">
              Vos données sont traitées exclusivement pour les objectifs suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600 dark:text-gray-400">
              <li>Gestion des inscriptions aux cours et aux examens ÖSD.</li>
              <li>Suivi pédagogique et publication des résultats.</li>
              <li>Communication administrative et notifications système.</li>
              <li>Établissement des factures et gestion comptable.</li>
            </ul>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <Lock size={28} />
              <h2 className="text-2xl font-bold">Sécurité des Données</h2>
            </div>
            <p className="leading-relaxed">
              Conformément à l&apos;article 415 du Code du Numérique, nous mettons en œuvre des mesures techniques rigoureuses :
            </p>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
              <p className="text-sm italic text-[#003366] dark:text-blue-300 leading-relaxed">
                &quot;Toutes les communications sont protégées par le protocole HTTPS. Les mots de passe sont hashés via l&apos;algorithme bcrypt et les accès administratifs sont tracés via un journal d&apos;audit permanent.&quot;
              </p>
            </div>
          </section>

          {/* Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <UserCheck size={28} />
              <h2 className="text-2xl font-bold">Vos Droits</h2>
            </div>
            <p className="leading-relaxed">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;opposition sur vos données. Pour exercer ces droits, vous pouvez :
            </p>
            <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">Contactez notre délégué à la protection des données :</p>
              <p className="text-lg font-black text-[#003366] dark:text-white">necsima@yahoo.fr</p>
              <p className="text-xs text-gray-500 mt-2">Délai de réponse moyen : 48h ouvrables.</p>
            </div>
          </section>

          {/* APDP Mention */}
          <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Autorité de Protection (APDP)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Ce traitement de données est en cours de déclaration auprès de l&apos;Autorité de Protection des Données Personnelles du Bénin. Pour toute plainte non résolue par nos soins, vous pouvez saisir l&apos;APDP sur www.apdp.bj.
                </p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-12 text-center text-gray-400 text-xs">
          Dernière mise à jour : 5 Mai 2026 • Spass mit Deutsch Benin
        </div>
      </div>
    </div>
  );
}
