"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LmsForgotPasswordPage() {
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
      const res = await fetch("/api/lms/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

      setMessage(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-signin-bg relative">
      <Link 
        href="/lms/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#003366] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group z-50"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Retour à la connexion</span>
      </Link>

      <div className="lms-card">
        {/* Logo */}
        <div className="lms-logo-block">
          <Image
            src="/logo.png"
            alt="Logo Spass mit Deutsch"
            width={64}
            height={64}
            className="lms-logo-img"
          />
          <div className="lms-logo-text">
            <span className="lms-logo-name">Spass mit Deutsch</span>
            <span className="lms-logo-sub">Récupération</span>
          </div>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email envoyé !</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              {message || "Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe sous peu."}
            </p>
            <Link 
              href="/lms/login"
              className="inline-block px-8 py-4 rounded-full bg-[#003366] text-white font-bold hover:bg-[#002244] transition-all"
            >
              Retour à la connexion
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="lms-title">Mot de passe oublié ?</h1>
            <p className="lms-subtitle">
              Pas de panique ! Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="lms-form">
              <div className="lms-field">
                <label className="lms-label">Adresse e-mail</label>
                <div className="lms-input-wrap">
                  <span className="lms-input-icon">
                    <Mail size={18} className="text-gray-400" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lms-input"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {error && <p className="lms-error">{error}</p>}

              <button type="submit" className="lms-btn-submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Envoyer le lien de récupération"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
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
        .lms-logo-block {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .lms-logo-name {
          font-size: 15px;
          font-weight: 800;
          color: #003366;
          line-height: 1.2;
        }
        .lms-logo-sub {
          font-size: 10px;
          color: #D4AF37;
          font-weight: 700;
          text-transform: uppercase;
        }
        .lms-title {
          font-size: 26px;
          font-weight: 800;
          color: #0a0a0a;
          text-align: center;
          margin: 0 0 10px;
        }
        .lms-subtitle {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 28px;
        }
        .lms-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .lms-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .lms-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
        }
        .lms-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lms-input-icon {
          position: absolute;
          left: 14px;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .lms-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 1.5px solid #e5e7eb;
          border-radius: 50px;
          font-size: 14px;
          color: #111827;
          outline: none;
        }
        .lms-input:focus {
          border-color: #003366;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.08);
        }
        .lms-btn-submit {
          width: 100%;
          padding: 15px;
          background: #003366;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .lms-btn-submit:hover { background: #002244; }
        .lms-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .lms-error {
          font-size: 12.5px;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
        }
      `}</style>
    </div>
  );
}
