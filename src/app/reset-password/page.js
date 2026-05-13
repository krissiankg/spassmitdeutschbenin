"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function ResetPasswordForm() {
  const { t } = useTranslations();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError("Le lien de réinitialisation est invalide ou manquant.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

      setMessage(data.message);
      setSubmitted(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mot de passe réinitialisé !</h2>
            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
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
              <h1 className="text-2xl font-bold text-[#003366] tracking-tight mb-2">Nouveau mot de passe</h1>
              <p className="text-gray-500 font-medium text-sm">Créez un nouveau mot de passe sécurisé pour votre compte.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("auth.passwordLabel") || "NOUVEAU MOT DE PASSE"}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003366] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none text-gray-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003366] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none text-gray-900 font-medium"
                    placeholder="••••••••"
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
                disabled={loading || !token}
                className="w-full bg-[#003366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Réinitialiser le mot de passe"
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative">
      <div className="absolute top-8 right-8 z-50">
        <LanguageSwitcher />
      </div>
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="animate-spin text-[#003366]" size={40} /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
