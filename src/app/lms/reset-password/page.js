"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Jeton de réinitialisation manquant.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }
    if (password.length < 8) {
      return setError("Le mot de passe doit faire au moins 8 caractères.");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lms/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

      setSuccess(true);
      setTimeout(() => {
        router.push("/lms/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) return null;

  return (
    <div className="lms-card">
      <div className="lms-logo-block">
        <Image src="/logo.png" alt="Logo" width={64} height={64} className="lms-logo-img" />
        <div className="lms-logo-text">
          <span className="lms-logo-name">Spass mit Deutsch</span>
          <span className="lms-logo-sub">Nouveau mot de passe</span>
        </div>
      </div>

      {success ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mot de passe mis à jour !</h2>
          <p className="text-gray-500 mb-8">Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la page de connexion...</p>
        </motion.div>
      ) : error && !token ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lien invalide</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link href="/lms/forgot-password" title="Demander un nouveau lien" className="text-[#003366] font-bold underline">Demander un nouveau lien</Link>
        </div>
      ) : (
        <>
          <h1 className="lms-title">Réinitialisation</h1>
          <p className="lms-subtitle">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>

          <form onSubmit={handleSubmit} className="lms-form">
            <div className="lms-field">
              <label className="lms-label">Nouveau mot de passe</label>
              <div className="lms-input-wrap">
                <span className="lms-input-icon"><Lock size={18} className="text-gray-400" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lms-input"
                  placeholder="Minimum 8 caractères"
                />
                <button 
                  type="button" 
                  className="absolute right-4 text-gray-400" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="lms-field">
              <label className="lms-label">Confirmer le mot de passe</label>
              <div className="lms-input-wrap">
                <span className="lms-input-icon"><Lock size={18} className="text-gray-400" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="lms-input"
                  placeholder="Répétez le mot de passe"
                />
              </div>
            </div>

            {error && <p className="lms-error">{error}</p>}

            <button type="submit" className="lms-btn-submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Mettre à jour mon mot de passe"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function LmsResetPasswordPage() {
  return (
    <div className="lms-signin-bg">
      <Suspense fallback={<Loader2 className="animate-spin text-[#003366]" size={40} />}>
        <ResetPasswordForm />
      </Suspense>

      <style jsx global>{`
        .lms-signin-bg {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', sans-serif;
        }
        .lms-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 4px 40px rgba(0, 51, 102, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .lms-logo-block { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px; }
        .lms-logo-name { font-size: 15px; font-weight: 800; color: #003366; line-height: 1.2; }
        .lms-logo-sub { font-size: 10px; color: #D4AF37; font-weight: 700; text-transform: uppercase; }
        .lms-title { font-size: 26px; font-weight: 800; color: #0a0a0a; text-align: center; margin: 0 0 10px; }
        .lms-subtitle { font-size: 13px; color: #6b7280; text-align: center; line-height: 1.6; margin: 0 0 28px; }
        .lms-form { display: flex; flex-direction: column; gap: 18px; }
        .lms-field { display: flex; flex-direction: column; gap: 7px; }
        .lms-label { font-size: 12.5px; font-weight: 600; color: #374151; }
        .lms-input-wrap { position: relative; display: flex; align-items: center; }
        .lms-input-icon { position: absolute; left: 14px; display: flex; align-items: center; pointer-events: none; }
        .lms-input { width: 100%; padding: 13px 14px 13px 42px; border: 1.5px solid #e5e7eb; border-radius: 50px; font-size: 14px; color: #111827; outline: none; }
        .lms-input:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.08); }
        .lms-btn-submit { width: 100%; padding: 15px; background: #003366; color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lms-btn-submit:hover { background: #002244; }
        .lms-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .lms-error { font-size: 12.5px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 14px; }
      `}</style>
    </div>
  );
}
