"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BookOpen,
  Settings,
  LogOut,
  Wallet,
  ChevronRight,
  Bell,
  Home,
  FileText,
  HelpCircle,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const NavItem = ({ href, icon: Icon, label, isActive, isSubItem = false, isCollapsed }) => (
  <Link
    href={href}
    title={isCollapsed ? label : ""}
    className={cn(
      "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative",
      isActive
        ? "bg-[#003366] text-white shadow-lg shadow-blue-900/20"
        : isSubItem 
          ? "text-gray-500 hover:bg-gray-50 hover:text-[#003366] py-2.5" 
          : "text-gray-500 hover:bg-gray-100 hover:text-[#003366]",
      isCollapsed && "justify-center px-0 w-12 mx-auto"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={isSubItem ? 18 : 20} className={cn(isActive ? "text-[#D4AF37]" : "group-hover:text-[#003366]")} />
      {!isCollapsed && <span className={cn("font-medium whitespace-nowrap", isSubItem ? "text-sm" : "text-base")}>{label}</span>}
    </div>
    {isActive && !isSubItem && !isCollapsed && <ChevronRight size={16} className="text-white/50" />}
    
    {isCollapsed && isActive && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4AF37] rounded-l-full"></div>
    )}
  </Link>
);

const NavGroup = ({ label, icon: Icon, children, isActive, isOpen, onToggle, isCollapsed }) => {
  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        title={isCollapsed ? label : ""}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
          isActive ? "bg-blue-50 text-[#003366]" : "text-gray-500 hover:bg-gray-50 hover:text-[#003366]",
          isCollapsed && "justify-center px-0 w-12 mx-auto"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={cn(isActive ? "text-[#003366]" : "group-hover:text-[#003366]")} />
          {!isCollapsed && <span className="font-bold whitespace-nowrap">{label}</span>}
        </div>
        {!isCollapsed && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="opacity-50" />
          </motion.div>
        )}
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            <div className="border-l-2 border-gray-100 dark:border-gray-800 ml-6 pl-2 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";
import { ChevronDown, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslations();
  const [openGroups, setOpenGroups] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirection si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Ouvrir automatiquement le groupe parent de l'item actif
  useEffect(() => {
    const findAndOpenGroup = () => {
      const structure = [
        { id: 'exam', items: ["/admin/sessions", "/admin/candidates", "/admin/results"] },
        { id: 'students', items: ["/admin/courses", "/admin/enrollments", "/admin/students"] },
        { id: 'comm', items: ["/admin/messages", "/admin/help"] },
        { id: 'config', items: ["/admin/form-builder", "/admin/settings"] },
      ];
      const activeGroup = structure.find(g => g.items.includes(pathname));
      if (activeGroup) {
        setOpenGroups(prev => ({ ...prev, [activeGroup.id]: true }));
      }
    };
    findAndOpenGroup();
  }, [pathname]);

  const toggleGroup = (groupId) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const menuStructure = [
    { 
      type: 'item', 
      href: "/admin/dashboard", 
      icon: LayoutDashboard, 
      label: t("admin.nav.dashboard") 
    },
    { 
      type: 'group',
      id: 'exam',
      label: t("admin.nav.examenOsd"),
      icon: GraduationCap,
      items: [
        { href: "/admin/sessions", icon: Calendar, label: t("admin.nav.sessions") },
        { href: "/admin/candidates", icon: Users, label: t("admin.nav.candidates") },
        { href: "/admin/results", icon: ClipboardList, label: t("admin.nav.results") },
      ]
    },
    {
      type: 'group',
      id: 'students',
      label: t("admin.nav.studentsCourses"),
      icon: Users,
      items: [
        { href: "/admin/courses", icon: BookOpen, label: t("admin.nav.courses") },
        { href: "/admin/enrollments", icon: ClipboardList, label: t("admin.nav.enrollments") },
        { href: "/admin/students", icon: GraduationCap, label: t("admin.nav.students") },
      ]
    },
    { 
      type: 'item', 
      href: "/admin/accounting", 
      icon: Wallet, 
      label: t("admin.nav.accounting"), 
      roles: ["SUPER_ADMIN", "ACCOUNTANT", "COMPTABLE", "SECRETARY"] 
    },
    {
      type: 'group',
      id: 'comm',
      label: t("admin.nav.communication"),
      icon: MessageSquare,
      items: [
        { href: "/admin/messages", icon: MessageSquare, label: t("admin.nav.messaging") },
        { href: "/admin/help", icon: HelpCircle, label: t("admin.nav.help") },
      ]
    },
    {
      type: 'group',
      id: 'config',
      label: t("admin.nav.configuration"),
      icon: Settings,
      items: [
        { href: "/admin/form-builder", icon: FileText, label: t("admin.nav.formBuilder"), roles: ["SUPER_ADMIN"] },
        { href: "/admin/settings", icon: Settings, label: t("admin.nav.settings"), roles: ["SUPER_ADMIN", "SECRETARY", "ACCOUNTANT", "COMPTABLE"] },
      ]
    }
  ];

  const filterItems = (items) => items.filter(item => 
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

  const SidebarContent = ({ isCollapsedMode }) => (
    <>
      <div className="german-accent-bar h-1 w-full"></div>
      <div className={cn("p-6 border-b border-gray-50 dark:border-gray-800 flex items-center", isCollapsedMode ? "justify-center" : "gap-3")}>
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain group-hover:scale-110 transition-transform" />
          {!isCollapsedMode && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="font-bold text-lg block text-[#003366] dark:text-gray-100 whitespace-nowrap">Spass mit Deutsch</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Administration</span>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {!isCollapsedMode && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">{t("admin.nav.menuTitle")}</p>}
        
        {menuStructure.map((menuItem) => {
          if (menuItem.type === 'item') {
            if (menuItem.roles && !menuItem.roles.includes(session.user.role)) return null;
            return (
              <NavItem
                key={menuItem.href}
                {...menuItem}
                isCollapsed={isCollapsedMode}
                isActive={pathname === menuItem.href}
              />
            );
          }

          const subItems = filterItems(menuItem.items);
          if (subItems.length === 0) return null;

          return (
            <NavGroup
              key={menuItem.id}
              label={menuItem.label}
              icon={menuItem.icon}
              isCollapsed={isCollapsedMode}
              isOpen={openGroups[menuItem.id]}
              onToggle={() => toggleGroup(menuItem.id)}
              isActive={subItems.some(i => pathname === i.href)}
            >
              {subItems.map((subItem) => (
                <NavItem
                  key={subItem.href}
                  {...subItem}
                  isSubItem
                  isCollapsed={isCollapsedMode}
                  isActive={pathname === subItem.href}
                />
              ))}
            </NavGroup>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 dark:border-gray-800">
        <div className={cn("bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 mb-4 flex items-center border border-gray-100 dark:border-gray-700", isCollapsedMode ? "justify-center" : "gap-3")}>
          <div className="w-10 h-10 min-w-[40px] rounded-full bg-blue-100 dark:bg-[#121212] flex items-center justify-center text-[#003366] dark:text-gray-300 font-bold uppercase">
            {session.user.name?.substring(0, 2) || "AD"}
          </div>
          {!isCollapsedMode && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate">{session.user.name || t("admin.nav.userDefault")}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-tighter">
                {session.user.role === "SUPER_ADMIN" ? t("admin.nav.roles.superAdmin") : (session.user.role === "ACCOUNTANT" || session.user.role === "COMPTABLE") ? t("admin.nav.roles.accountant") : t("admin.nav.roles.secretary")}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={t("nav.logout")}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm mb-2",
            isCollapsedMode && "px-0"
          )}
        >
          <LogOut size={18} /> {!isCollapsedMode && t("nav.logout")}
        </button>

        {!isCollapsedMode && (
          <div className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold text-center border-t border-gray-50 dark:border-gray-800 pt-4">
            SMD v1 produit par <a href="https://offre.guelichweb.online/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">Guelichweb</a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#121212]">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "hidden md:flex bg-white dark:bg-[#1E1E1E] border-r border-gray-100 dark:border-gray-800 flex-col sticky top-0 h-screen z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <SidebarContent isCollapsedMode={isCollapsed} />
      </aside>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1E1E1E] z-[60] flex flex-col md:hidden"
            >
              <SidebarContent isCollapsedMode={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-2.5 text-gray-400 hover:text-[#003366] hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              {isCollapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
            </button>

            <h2 className="text-lg md:text-xl font-bold text-[#003366] dark:text-gray-100 truncate max-w-[150px] md:max-w-none">
              {(() => {
                const allItems = menuStructure.flatMap(m => m.type === 'group' ? m.items : [m]);
                return allItems.find(i => i.href === pathname)?.label || t("admin.nav.administration");
              })()}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="hidden md:block h-8 w-px bg-gray-100 dark:bg-gray-700"></div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#003366] dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <Home size={16} />
              <span className="hidden lg:inline">{t("admin.nav.home")}</span>
            </Link>
            
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-700"></div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationBell apiUrl="/api/admin/notifications" />
              <LanguageSwitcher variant="compact" />
            </div>

            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">{t("common.systemOperational")}</span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

