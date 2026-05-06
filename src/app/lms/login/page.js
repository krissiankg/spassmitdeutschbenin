"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LmsLoginPage() {
  const { t } = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("student-credentials", {
        redirect: false,
        email,
        password,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
      });

      if (res?.error) {
        if (res.error === "2FA_REQUIRED") {
          setRequires2FA(true);
        } else {
          setError(res.error === "CredentialsSignin" ? t("auth.errorInvalidCredentials") : res.error);
        }
      } else {
        router.push("/lms/student/dashboard");
      }
    } catch (err) {
      setError(t("auth.errorGeneral"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-signin-bg relative">
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#003366] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group z-50"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>{t("auth.backHome")}</span>
      </Link>

      <div className="absolute top-8 right-8 z-50">
        <LanguageSwitcher />
      </div>

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
            <span className="lms-logo-sub">{t("auth.studentSpace")}</span>
          </div>
        </div>

        {/* Titre */}
        <h1 className="lms-title">{t("auth.studentWelcome")}</h1>
        <p className="lms-subtitle">
          {t("auth.studentSubtitle")}
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="lms-form">
          {!requires2FA ? (
            <>
              {/* Email */}
              <div className="lms-field">
                <label className="lms-label">{t("auth.emailLabel")}</label>
                <div className="lms-input-wrap">
                  <span className="lms-input-icon">
                    <Image
                      src="/icons/EnvelopeSimple.png"
                      alt="email"
                      width={18}
                      height={18}
                    />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lms-input"
                    placeholder={t("auth.emailPlaceholder")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lms-field">
                <div className="flex justify-between items-center mb-2">
                  <label className="lms-label mb-0">{t("auth.passwordLabel")}</label>
                  <Link
                    href="/lms/forgot-password"
                    className="text-xs font-bold text-[#003366] hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="lms-input-wrap">
                  <span className="lms-input-icon">
                    <Image
                      src="/icons/Lock.png"
                      alt="mot de passe"
                      width={18}
                      height={18}
                    />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lms-input lms-input-pw"
                    placeholder={t("auth.passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    className="lms-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    <Image
                      src="/icons/Eye.png"
                      alt="voir"
                      width={18}
                      height={18}
                      style={{ opacity: showPassword ? 1 : 0.4 }}
                    />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:border-[#003366] peer-checked:bg-[#003366] transition-all"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    {t("auth.rememberMe")}
                  </span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="lms-field">
                <label className="lms-label">{t("auth.2faLabel")}</label>
                <p className="text-[11px] text-gray-400 mb-2">{t("auth.2faSubtitle")}</p>
                <div className="lms-input-wrap">
                  <span className="lms-input-icon">
                    <Image
                      src="/icons/Lock.png"
                      alt="2fa"
                      width={18}
                      height={18}
                    />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="lms-input"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRequires2FA(false)}
                className="text-xs font-bold text-[#003366] hover:underline mb-6"
              >
                {t("auth.backToLogin")}
              </button>
            </>
          )}
          {/* Erreur */}
          {error && <p className="lms-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`lms-btn-submit ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t("common.loading")}
              </span>
            ) : (
              t("auth.loginButton")
            )}
          </button>
        </form>

        {/* Pas encore inscrit */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {t("register.noAccount")}{" "}
            <Link
              href="/register"
              className="text-[#003366] font-bold hover:underline"
            >
              {t("register.registerNow")}
            </Link>
          </p>
        </div>

      </div>

      <style jsx>{`
        /* ========== BACKGROUND ========== */
        .lms-signin-bg {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ========== CARD ========== */
        .lms-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 4px 40px rgba(0, 51, 102, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        /* ========== LOGO ========== */
        .lms-logo-block {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .lms-logo-img {
          object-fit: contain;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .lms-logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lms-logo-name {
          font-size: 15px;
          font-weight: 800;
          color: #003366;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .lms-logo-sub {
          font-size: 10px;
          color: #D4AF37;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ========== TITRE ========== */
        .lms-title {
          font-size: 26px;
          font-weight: 800;
          color: #0a0a0a;
          text-align: center;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
        }
        .lms-subtitle {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 28px;
        }

        /* ========== FORM ========== */
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
          opacity: 0.5;
        }
        .lms-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 1.5px solid #e5e7eb;
          border-radius: 50px;
          font-size: 14px;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lms-input::placeholder {
          color: #9ca3af;
          font-size: 13.5px;
        }
        .lms-input:focus {
          border-color: #003366;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.08);
        }
        .lms-input-pw {
          padding-right: 44px;
        }
        .lms-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: opacity 0.2s;
        }
        .lms-eye-btn:hover {
          opacity: 0.8;
        }

        /* ========== OPTIONS ROW ========== */
        .lms-row-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }
        .lms-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .lms-checkbox {
          width: 17px;
          height: 17px;
          border: 1.5px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          background: #fff;
          flex-shrink: 0;
        }
        .lms-checkbox--checked {
          background: #003366;
          border-color: #003366;
        }
        .lms-check-svg {
          width: 10px;
          height: 10px;
        }
        .lms-remember-text {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }
        .lms-forgot {
          font-size: 13px;
          font-weight: 600;
          color: #003366;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .lms-forgot:hover {
          color: #D4AF37;
          text-decoration: underline;
        }

        /* ========== ERROR ========== */
        .lms-error {
          font-size: 12.5px;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          margin: 0;
          font-weight: 500;
        }

        /* ========== SUBMIT BUTTON ========== */
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
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          letter-spacing: 0.2px;
        }
        .lms-btn-submit:hover:not(:disabled) {
          background: #002244;
        }
        .lms-btn-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        .lms-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .lms-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ========== SIGNUP LINK ========== */
        .lms-signup-link {
          text-align: center;
          font-size: 13.5px;
          color: #6b7280;
          margin: 24px 0 0;
          font-weight: 500;
        }
        .lms-signup-cta {
          font-weight: 800;
          color: #003366;
          text-decoration: none;
          margin-left: 3px;
          transition: color 0.15s;
        }
        .lms-signup-cta:hover {
          color: #D4AF37;
          text-decoration: underline;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 480px) {
          .lms-card {
            padding: 36px 24px 32px;
          }
        }
      `}</style>
    </div>
  );
}
