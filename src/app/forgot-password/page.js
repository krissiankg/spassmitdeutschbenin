"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {
  const { t } = useTranslations();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("auth.errorGeneral"));

      setMessage(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative">
      <Link 
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#003366] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group z-50"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>{t("auth.backToLogin") || "Retour à la connexion"}</span>
      </Link>

      <div className="absolute top-8 right-8 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-900/5 mb-6 group hover:scale-105 transition-transform duration-300">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 border border-gray-100">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email envoyé !</h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                {message || "Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe sous peu."}
              </p>
              <Link 
                href="/login"
                className="inline-block px-8 py-4 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#002244] transition-all"
              >
                {t("auth.backToLogin") || "Retour à la connexion"}
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#003366] tracking-tight mb-2">Mot de passe oublié ?</h1>
                <p className="text-gray-500 font-medium text-sm">Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("auth.emailLabel")}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003366] transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none text-gray-900 font-medium"
                      placeholder="admin@spassmitdeutschbenin.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#003366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-10 text-gray-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Spass mit Deutsch Benin. {t("auth.allRightsReserved")}
        </p>
      </div>
    </div>
  );
}
