"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Wallet,
  ChevronRight,
  Bell,
  Home,
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const NavItem = ({ href, icon: Icon, label, isActive }) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
      isActive 
        ? "bg-[#003366] text-white shadow-lg shadow-blue-900/20" 
        : "text-gray-500 hover:bg-gray-100 hover:text-[#003366]"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={cn(isActive ? "text-[#D4AF37]" : "group-hover:text-[#003366]")} />
      <span className="font-medium">{label}</span>
    </div>
    {isActive && <ChevronRight size={16} className="text-white/50" />}
  </Link>
);

import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirection si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 sec
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if(res.ok) setNotifications(await res.json());
    } catch(e) {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: 'PUT' });
      fetchNotifications();
    } catch(e) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const allMenuItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de Bord" },
    { href: "/admin/sessions", icon: Calendar, label: "Sessions d'Examen" },
    { href: "/admin/candidates", icon: Users, label: "Gestion Candidats" },
    { href: "/admin/results", icon: ClipboardList, label: "Saisie de Notes" },
    { href: "/admin/accounting", icon: Wallet, label: "Comptabilité", roles: ["SUPER_ADMIN", "ACCOUNTANT", "SECRETARY"] },
    { href: "/admin/form-builder", icon: FileText, label: "Formulaire", roles: ["SUPER_ADMIN"] },
    { href: "/admin/settings", icon: Settings, label: "Paramètres", roles: ["SUPER_ADMIN"] },
    { href: "/admin/help", icon: HelpCircle, label: "Centre d'Aide" },
  ];

  const menuItems = allMenuItems.filter(item => 
    !item.roles || (session?.user?.role && item.roles.includes(session.user.role))
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#121212]">
        <div className="w-12 h-12 border-4 border-[#003366] dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#121212]">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-[#1E1E1E] border-r border-gray-100 dark:border-gray-800 flex flex-col sticky top-0 h-screen z-40">
        <div className="german-accent-bar h-1 w-full"></div>
        <div className="p-8 border-b border-gray-50 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-lg block text-[#003366] dark:text-gray-100">Spass mit Deutsch</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Administration</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Menu Principal</p>
          {menuItems.map((item) => (
            <NavItem 
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#121212] flex items-center justify-center text-[#003366] dark:text-gray-300 font-bold uppercase">
              {session.user.name?.substring(0, 2) || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate">{session.user.name || "Utilisateur"}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {session.user.role === "SUPER_ADMIN" ? "Super Administrateur" : session.user.role === "ACCOUNTANT" ? "Comptable" : "Secrétaire"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm mb-4"
          >
            <LogOut size={18} /> Déconnexion
          </button>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold text-center border-t border-gray-50 dark:border-gray-800 pt-4">
            SMD v1 produit par <a href="https://offre.guelichweb.online/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">Guelichweb</a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-8 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-xl font-bold text-[#003366] dark:text-gray-100">
            {menuItems.find(i => i.href === pathname)?.label || "Administration"}
          </h2>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-700"></div>
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#003366] dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <Home size={16} />
              <span>Accueil</span>
            </Link>
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-700"></div>
            <Link 
              href="/admin/help" 
              className="p-2.5 text-gray-400 hover:text-[#003366] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
              title="Centre d'Aide"
            >
              <HelpCircle size={20} />
            </Link>
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="relative z-50">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 text-gray-400 hover:text-[#003366] hover:bg-gray-50 rounded-xl relative transition-all">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-white flex items-center justify-center">{unreadCount}</span>}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                       <h3 className="font-bold text-[#003366] flex items-center gap-2"><Bell size={16}/> Notifications</h3>
                       {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline">Tout marquer comme lu</button>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-6 text-center text-sm text-gray-400">Aucune notification</div>
                       ) : (
                         notifications.map(n => (
                           <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${n.isRead ? 'opacity-60' : 'bg-blue-50/20'}`}>
                              <h4 className={`text-xs font-bold ${n.type === 'SUCCESS' ? 'text-green-600' : n.type === 'WARNING' ? 'text-orange-500' : 'text-[#003366]'} mb-1`}>{n.title}</h4>
                              <p className="text-[11px] text-gray-500 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] text-gray-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleDateString()} à {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                           </div>
                         ))
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Système opérationnel</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
