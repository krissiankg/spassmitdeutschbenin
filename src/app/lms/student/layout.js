"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Wallet,
  Award,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";

export default function StudentLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/lms/login");
    }
  }, [status, router]);

  // Fermer le profil au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: t("nav.dashboard"), icon: LayoutDashboard, href: "/lms/student/dashboard" },
    { name: t("nav.myCourses"), icon: BookOpen, href: "/lms/student/mes-cours" },
    { name: t("nav.messaging"), icon: MessageSquare, href: "/lms/student/messages" },
    { name: t("nav.planning"), icon: Calendar, href: "/lms/student/planning" },
    { name: t("nav.payments"), icon: Wallet, href: "/lms/student/paiements" },
    { name: t("nav.results"), icon: Award, href: "/lms/student/resultats" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/lms/login" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* Sidebar Desktop */}
      <aside
        className={`${isSidebarOpen ? "w-72" : "w-20"
          } hidden md:flex flex-col bg-[#003366] text-white transition-all duration-300 ease-in-out fixed h-full z-40 shadow-2xl`}
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="bg-[#D4AF37] p-2 rounded-xl shrink-0">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain brightness-0 invert" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-xl tracking-tight whitespace-nowrap"
            >
              SMD <span className="text-[#D4AF37]">LMS</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${isActive
                  ? "bg-[#D4AF37] text-[#003366] shadow-lg shadow-yellow-900/20"
                  : "text-blue-100 hover:bg-white/10"
                  }`}
              >
                <item.icon size={22} className={`${isActive ? "text-[#003366]" : "group-hover:scale-110 transition-transform"}`} />
                {isSidebarOpen && (
                  <span className="font-semibold text-sm">{item.name}</span>
                )}
                {isActive && isSidebarOpen && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-bold text-sm">{t("nav.logout")}</span>}
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex mt-4 w-full items-center justify-center p-2 text-white/40 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : "md:ml-20"}`}>

        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-black text-[#003366] hidden sm:block">
              {menuItems.find(i => i.href === pathname)?.name || "Tableau de bord"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder={t("header.search")}
                className="bg-transparent border-none outline-none text-sm ml-3 w-48 text-gray-600"
              />
            </div>

            <NotificationBell apiUrl="/api/lms/student/notifications" />
            <LanguageSwitcher variant="compact" />

            <div className="h-10 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3 relative" ref={profileRef}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#003366] leading-none mb-1">
                  {session?.user?.name || "Étudiant"}
                </p>
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-black shadow-lg hover:scale-105 transition-transform"
              >
                {(session?.user?.name || "S").charAt(0)}
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 right-0 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-4 overflow-hidden"
                  >
                      <div className="flex items-center gap-3 p-3 mb-4 bg-gray-50 rounded-2xl">
                        <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center text-white font-black text-xl">
                          {(session?.user?.name || "S").charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-[#003366] truncate">{session?.user?.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/lms/student/profil"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-4 p-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all group"
                        >
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            <Image src="/icons/User.png" alt="View" width={32} height={32} className="object-contain" />
                          </div>
                          <span className="text-gray-700">{t("nav.profile")}</span>
                        </Link>
                        <Link
                          href="/lms/student/parametres"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-4 p-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all group"
                        >
                          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            <Image src="/icons/Gear.png" alt="Edit" width={32} height={32} className="object-contain" />
                          </div>
                          <span className="text-gray-700">{t("nav.settings")}</span>
                        </Link>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-4 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                        >
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                            <LogOut size={22} />
                          </div>
                          <span className="font-bold">{t("nav.logout")}</span>
                        </button>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 pb-12">
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </div>
      </main>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="w-72 h-full bg-[#003366] p-6 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D4AF37] p-2 rounded-xl">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain brightness-0 invert" />
                  </div>
                  <span className="text-white font-black text-lg">SMD LMS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60">
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                        ? "bg-[#D4AF37] text-[#003366] font-bold shadow-lg shadow-yellow-900/20"
                        : "text-blue-100"
                        }`}
                    >
                      <item.icon size={22} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 text-red-300 rounded-xl"
                >
                  <LogOut size={22} />
                  <span className="font-bold">{t("nav.logout")}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
