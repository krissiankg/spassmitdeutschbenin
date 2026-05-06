"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Key, 
  Activity, 
  Eye, 
  EyeOff, 
  X, 
  Trash2, 
  LogOut,
  Monitor,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 py-4 px-6 border-b-2 transition-all font-bold text-sm ${
      activeTab === id 
        ? "border-[#003366] text-[#003366]" 
        : "border-transparent text-gray-400 hover:text-gray-600"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function SettingsPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [currentLocale, setCurrentLocale] = useState("fr");
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/lms/student/profile");
      const data = await res.json();
      setTwoFactorEnabled(data.twoFactorEnabled);
    };

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const stored = getCookie("NEXT_LOCALE") || "fr";
    setCurrentLocale(stored);

    fetchStatus();
  }, []);

  const handleToggle2FA = async () => {
    if (!twoFactorEnabled) {
      setTwoFactorLoading(true);
      try {
        const res = await fetch("/api/lms/student/2fa/generate", { method: "POST" });
        const data = await res.json();
        setQrCodeUrl(data.qrCodeUrl);
        setIs2FAModalOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setTwoFactorLoading(false);
      }
    } else {
      if (confirm("Voulez-vous vraiment désactiver la double authentification ?")) {
        await fetch("/api/lms/student/2fa/disable", { method: "POST" });
        setTwoFactorEnabled(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/lms/student/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode })
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setIs2FAModalOpen(false);
        setVerificationCode("");
      } else {
        alert("Code invalide");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lms/student/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        setMessage({ type: "success", text: t("settings.security.success") });
        setTimeout(() => {
          setIsModalOpen(false);
          setNewPassword("");
          setConfirmPassword("");
          setMessage({ type: "", text: "" });
        }, 2000);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || t("settings.security.error") });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = (code) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setCurrentLocale(code);
    setIsLangModalOpen(false);
    window.location.reload();
  };

  const LANGUAGES = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

  const currentLangLabel = LANGUAGES.find(l => l.code === currentLocale)?.label || "Français";

  const activityLogs = [
    { browser: "Chrome on Windows", ip: "192.149.122.128", time: "11:34 PM", current: true },
    { browser: "Mozilla on Windows", ip: "86.188.154.225", time: "Dec 20, 2026 10:34 PM" },
    { browser: "Chrome on iMac", ip: "192.149.122.128", time: "Dec 20, 2026 10:34 PM" },
    { browser: "Chrome on Windows", ip: "192.149.122.128", time: "Dec 20, 2026 10:34 PM" },
    { browser: "Mozilla on Windows", ip: "192.149.122.128", time: "Dec 20, 2026 10:34 PM" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#003366] mb-2">{t("settings.title")}</h1>
      </div>

      <div className="flex border-b border-gray-100">
        <TabButton id="preferences" label={t("settings.tabs.preferences")} icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="security" label={t("settings.tabs.security")} icon={Key} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="activity" label={t("settings.tabs.activity")} icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 space-y-8"
            >
              <h2 className="text-lg font-black text-[#003366]">{t("settings.preferences.title")}</h2>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-sm font-bold text-gray-400">{t("settings.preferences.language")}</p>
                    <p className="font-bold text-[#003366]">{currentLangLabel}</p>
                  </div>
                  <button 
                    onClick={() => setIsLangModalOpen(true)}
                    className="bg-gray-50 text-gray-600 text-xs font-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <Settings size={14} /> {t("settings.preferences.changeLanguage")}
                  </button>
                </div>
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-sm font-bold text-gray-400">{t("settings.preferences.dateFormat")}</p>
                    <p className="font-bold text-[#003366]">{t("settings.preferences.dateFormatValue")}</p>
                  </div>
                  <button className="bg-gray-50 text-gray-600 text-xs font-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-all">
                    {t("settings.preferences.change")}
                  </button>
                </div>
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-sm font-bold text-gray-400">{t("settings.preferences.timeZone")}</p>
                    <p className="font-bold text-[#003366]">{t("settings.preferences.timeZoneValue")}</p>
                  </div>
                  <button className="bg-gray-50 text-gray-600 text-xs font-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-all">
                    {t("settings.preferences.change")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 space-y-8"
            >
              <h2 className="text-lg font-black text-[#003366]">{t("settings.security.title")}</h2>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="font-bold text-[#003366] mb-1">{t("settings.security.saveLogs")}</p>
                    <p className="text-xs text-gray-400">{t("settings.security.saveLogsDesc")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="font-bold text-[#003366] mb-1">{t("settings.security.changePassword")}</p>
                    <p className="text-xs text-gray-400">{t("settings.security.changePasswordDesc")}</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-50 text-gray-600 text-xs font-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <Key size={14} /> {t("settings.security.changePassword")}
                  </button>
                </div>
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="font-bold text-[#003366] mb-1">{t("settings.security.twoFactor")}</p>
                    <p className="text-xs text-gray-400 max-w-md">{t("settings.security.twoFactorDesc")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={twoFactorEnabled}
                      onChange={handleToggle2FA}
                      disabled={twoFactorLoading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-6">
                  <div>
                    <p className="font-bold text-[#003366] mb-1">{t("settings.security.deleteAccount")}</p>
                    <p className="text-xs text-gray-400 max-w-md">{t("settings.security.deleteAccountDesc")}</p>
                  </div>
                  <button className="bg-red-50 text-red-600 text-xs font-black py-3 px-6 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2">
                    <Trash2 size={14} /> {t("settings.security.deleteAccount")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden"
            >
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">{t("settings.activity.browser")}</th>
                    <th className="px-8 py-5">{t("settings.activity.ip")}</th>
                    <th className="px-8 py-5">{t("settings.activity.time")}</th>
                    <th className="px-8 py-5 text-right">{t("settings.activity.action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activityLogs.map((log, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-8 py-5 flex items-center gap-3 font-bold text-[#003366]">
                        <Monitor size={16} className="text-gray-400" />
                        {log.browser}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500">{log.ip}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500">
                        {log.time}
                        {log.current && <span className="ml-3 text-[10px] bg-green-100 text-green-600 py-1 px-2 rounded-full font-black">{t("settings.activity.current")}</span>}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {!log.current && (
                          <button className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-[#003366] mb-8">{t("settings.security.modalTitle")}</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("settings.security.newPassword")}</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={t("settings.security.placeholderNew")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#003366] focus:ring-2 focus:ring-[#003366] transition-all pr-12"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("settings.security.confirmPassword")}</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder={t("settings.security.placeholderConfirm")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#003366] focus:ring-2 focus:ring-[#003366] transition-all pr-12"
                    />
                    <button 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {message.text && (
                  <div className={`flex items-center gap-2 p-4 rounded-xl text-xs font-bold ${
                    message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-xs font-black text-[#003366] bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    {t("common.cancel")}
                  </button>
                  <button 
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 py-4 text-xs font-black text-white bg-black rounded-2xl hover:bg-gray-900 transition-all disabled:opacity-50"
                  >
                    {loading ? t("settings.security.changing") : t("settings.security.changePassword")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIs2FAModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-2 bg-[#003366]"></div>
              
              <button 
                onClick={() => setIs2FAModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
                   <Key size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#003366]">{t("settings.security.twoFactorModalTitle")}</h2>
                  <p className="text-sm text-gray-500 font-medium">{t("settings.security.twoFactorModalDesc")}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-3xl inline-block border-2 border-white shadow-inner">
                   <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t("settings.security.verificationCode")}</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full text-center text-3xl tracking-[0.5em] p-4 bg-gray-50 border-none rounded-2xl font-black text-[#003366] focus:ring-2 focus:ring-[#003366] transition-all"
                      />
                   </div>
                   
                   <button 
                    onClick={handleVerify2FA}
                    disabled={twoFactorLoading || verificationCode.length < 6}
                    className="w-full py-5 text-sm font-black text-white bg-[#003366] rounded-2xl hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
                  >
                    {twoFactorLoading ? t("settings.security.verifying") : t("settings.security.verify")}
                  </button>
                  <button 
                    onClick={() => setIs2FAModalOpen(false)}
                    className="w-full py-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {isLangModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsLangModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-[#003366] mb-6">{t("settings.preferences.modalTitle")}</h2>

              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                      currentLocale === lang.code
                        ? "bg-[#003366] text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {currentLocale === lang.code && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setIsLangModalOpen(false)}
                  className="w-full py-4 text-xs font-black text-gray-400 hover:text-gray-600 transition-all"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
