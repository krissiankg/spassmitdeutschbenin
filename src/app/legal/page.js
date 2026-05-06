"use client";
import React from "react";
import { Info, MapPin, Phone, Mail, Building, Globe, ArrowLeft, Database } from "lucide-react";
import Link from "next/link";

export default function LegalMentions() {
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Mentions Légales</h1>
          <p className="text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Informations obligatoires concernant l&apos;éditeur et l&apos;hébergeur de la plateforme Spass mit Deutsch Benin.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-20">
        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800 p-8 md:p-12 space-y-12">
          
          {/* Editor Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <Building size={28} />
              <h2 className="text-2xl font-bold">Éditeur de la Plateforme</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><Info size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Raison Sociale</p>
                    <p className="font-bold">Spass mit Deutsch Benin</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><MapPin size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Siège Social</p>
                    <p className="font-bold">Cotonou, République du Bénin</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><Mail size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email de contact</p>
                    <p className="font-bold">necsima@yahoo.fr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><Phone size={16}/></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Téléphone</p>
                    <p className="font-bold">+229 01 96 64 19 61</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hosting Section */}
          <section className="space-y-6 pt-12 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <Globe size={28} />
              <h2 className="text-2xl font-bold">Hébergement</h2>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
              <p className="text-sm leading-relaxed">
                Cette plateforme est hébergée par <strong>Vercel Inc.</strong>, situé au 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis. Les serveurs de production sont situés dans des datacenters certifiés conformes aux standards de sécurité internationaux.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#003366] dark:text-[#D4AF37]">
              <Database size={28} />
              <h2 className="text-2xl font-bold">Propriété Intellectuelle</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              L&apos;ensemble du contenu de cette plateforme (textes, logos, graphismes, icônes) est la propriété exclusive de Spass mit Deutsch Benin, sauf mention contraire. Toute reproduction, distribution ou modification, même partielle, est strictement interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.
            </p>
          </section>

          {/* Responsibility */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Limitation de Responsabilité</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Spass mit Deutsch Benin s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées. Toutefois, le centre ne pourra être tenu responsable des erreurs ou omissions, ainsi que de l&apos;indisponibilité temporaire du service pour cause de maintenance technique.
            </p>
          </section>

        </div>

        <div className="mt-12 text-center text-gray-400 text-xs">
          © {new Date().getFullYear()} Spass mit Deutsch Benin • Tous droits réservés
        </div>
      </div>
    </div>
  );
}
