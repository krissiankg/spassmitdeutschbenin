"use client";
import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] md:bottom-6 md:left-auto md:right-6 md:max-w-md md:left-4"
        >
          <div className="bg-white dark:bg-[#1A1A1A] rounded-t-2xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl md:shadow-blue-900/20 border-t md:border border-gray-100 dark:border-gray-800 p-4 md:p-6 relative overflow-hidden">
            {/* Background pattern - Hidden on mobile for clarity */}
            <div className="hidden md:block absolute -top-12 -right-12 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col gap-3 md:gap-5 relative z-10">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-[#D4AF37] rounded-lg md:rounded-2xl flex items-center justify-center">
                    <Cookie size={18} className="md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-bold text-[#003366] dark:text-white text-sm md:text-base">Respect de votre vie privée</h4>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="md:hidden p-1 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience.
                  Consultez notre <Link href="/privacy" className="text-[#003366] dark:text-[#D4AF37] font-bold hover:underline">Politique de Confidentialité</Link>.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={acceptCookies}
                    className="flex-1 py-2 md:py-3 bg-[#003366] dark:bg-[#D4AF37] text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-opacity"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 py-2 md:py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="hidden md:block absolute -top-1 -right-1 p-1 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
