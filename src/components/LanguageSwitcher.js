"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷", shortLabel: "FR" },
  { code: "en", label: "English", flag: "🇬🇧", shortLabel: "EN" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", shortLabel: "DE" },
];

export function LanguageSwitcher({ variant = "default" }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("fr");
  const dropdownRef = useRef(null);

  // Read locale from cookie on mount
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const stored = getCookie("NEXT_LOCALE") || "fr";
    setCurrentLocale(stored);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeLanguage = (code) => {
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setCurrentLocale(code);
    setIsOpen(false);
    // Reload page to apply new locale
    router.refresh();
    window.location.reload();
  };

  const current = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  // Compact variant for smaller headers
  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-bold text-gray-600 dark:text-gray-300"
          title="Changer de langue"
        >
          <span>{current.flag}</span>
          <span>{current.shortLabel}</span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[200]"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    currentLocale === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/20 font-bold text-[#003366] dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {currentLocale === lang.code && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#003366] dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] hover:border-[#003366] dark:hover:border-blue-500 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm"
        title="Changer de langue"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.shortLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[200]"
          >
            <div className="p-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    currentLocale === lang.code
                      ? "bg-[#003366] text-white font-bold shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {currentLocale === lang.code && (
                    <span className="ml-auto text-xs opacity-75">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
