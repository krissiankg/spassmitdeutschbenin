"use client";
import React, { useState, useEffect } from "react";
import { 
  User, Shield, Send, Lock, Eye, EyeOff, Loader2, Save, Users, 
  Plus, Trash2, Mail, CreditCard, Edit2, History, ShieldAlert, 
  Calendar, BarChart3, TrendingUp, Settings2, Database, LayoutDashboard
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Pagination from "@/components/Pagination";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const userRole = session?.user?.role || "SECRETARY";
  
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAccountant = userRole === "ACCOUNTANT" || userRole === "COMPTABLE" || isSuperAdmin;
  const isSecretary = userRole === "SECRETARY" || isSuperAdmin;

  const [activeTab, setActiveTab] = useState("profile");
  
  // Tab states
  const [profileForm, setProfileForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "SECRETARY" });
  
  const [sessions, setSessions] = useState([]);
  const [selectedSessionForEmails, setSelectedSessionForEmails] = useState("");
  
  const [pricings, setPricings] = useState([]);
  const [editingPricing, setEditingPricing] = useState(null);
  const [pricingForm, setPricingForm] = useState({ label: "", price: 0, category: "MODULE", code: "", level: "A1" });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [lmsStats, setLmsStats] = useState({ total: 0, withoutAccess: 0 });
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(25);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditActionFilter, setAuditActionFilter] = useState("All");
  
  const [smtpStatus, setSmtpStatus] = useState("unknown"); // unknown, connected, error
  
  // General Messaging State
  const [generalMessage, setGeneralMessage] = useState({ title: "", body: "", group: "ALL_STUDENTS" });
  
  const [loading, setLoading] = useState(false);

  // Tab Definitions
  const TABS = [
    { id: "profile", label: "Mon Profil", icon: User, roles: ["SUPER_ADMIN", "SECRETARY", "ACCOUNTANT", "COMPTABLE"], group: "Personnel" },
    { id: "users", label: "Gestion des Rôles", icon: Users, roles: ["SUPER_ADMIN"], group: "Administration" },
    { id: "pricing", label: "Tarifs & Finances", icon: CreditCard, roles: ["SUPER_ADMIN", "ACCOUNTANT", "COMPTABLE"], group: "Administration" },
    { id: "communications", label: "Outils d'Envoi Mail", icon: Send, roles: ["SUPER_ADMIN", "SECRETARY"], group: "Système" },
    { id: "lms", label: "Accès LMS Étudiants", icon: Lock, roles: ["SUPER_ADMIN", "SECRETARY"], group: "Système" },
    { id: "audit", label: "Journal d'Audit", icon: History, roles: ["SUPER_ADMIN"], group: "Sécurité" },
  ];

  const allowedTabs = TABS.filter(t => t.roles.includes(userRole));

  const loadUsers = React.useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  }, [isSuperAdmin]);

  const loadSessions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadPricings = React.useCallback(async () => {
    if (!isAccountant) return;
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricings(await res.json());
    } catch (e) { console.error(e); }
  }, [isAccountant]);

  const loadStats = React.useCallback(async () => {
    if (!isAccountant) return;
    try {
      const res = await fetch("/api/admin/accounting/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  }, [isAccountant]);

  const loadLmsStats = React.useCallback(async () => {
    if (!isSecretary) return;
    try {
      const res = await fetch("/api/admin/candidates/credentials/stats");
      if (res.ok) setLmsStats(await res.json());
    } catch (e) { console.error(e); }
  }, [isSecretary]);

  const loadAuditLogs = React.useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${auditPage}&limit=${auditLimit}&action=${auditActionFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditTotal(data.total || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isSuperAdmin, auditPage, auditLimit, auditActionFilter]);

  // Load Initial Data
  useEffect(() => {
    if (session?.user) {
      setProfileForm(f => ({ ...f, name: session.user.name, email: session.user.email }));
    }
    if (isSuperAdmin) {
       loadUsers();
       loadAuditLogs();
    }
    if (isAccountant) {
       loadPricings();
       loadStats();
    }
    if (isSecretary) {
      loadLmsStats();
    }
    loadSessions();
  }, [session, isSuperAdmin, isAccountant, isSecretary, auditPage, auditLimit, auditActionFilter, loadUsers, loadPricings, loadAuditLogs, loadSessions, loadStats, loadLmsStats]);

  const handleCleanupLogs = async () => {
    const months = 2;
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    const dateStr = date.toISOString().split('T')[0];

    if (!confirm(`Voulez-vous vraiment supprimer tous les journaux d'audit créés avant le ${dateStr} ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?before=${dateStr}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Nettoyage réussi");
        loadAuditLogs();
      } else {
        toast.error(data.error || "Erreur lors du nettoyage");
      }
    } catch (e) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: editingPricing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPricing ? { ...pricingForm, id: editingPricing } : pricingForm)
      });
      if (res.ok) {
        toast.success(editingPricing ? "Tarif mis à jour" : "Tarif créé");
        setEditingPricing(null);
        setIsPricingModalOpen(false);
        loadPricings();
      } else {
        toast.error("Erreur de modification");
      }
    } catch (err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const deletePricing = async (id) => {
    if (!confirm("Supprimer ce tarif ?")) return;
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tarif supprimé");
        loadPricings();
      }
    } catch (e) { toast.error("Erreur réseau"); }
  };

  // Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        await update({ name: data.name, email: data.email });
        toast.success("Profil mis à jour !");
        setProfileForm({ ...profileForm, currentPassword: "", newPassword: "" });
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  // User Management
  const handleUserModalTrigger = (u = null) => {
    if (u) {
      setEditingUser(u.id);
      setUserForm({ name: u.name, email: u.email, role: u.role, password: "" });
    } else {
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", role: "SECRETARY" });
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser && !userForm.password) {
      return toast.error("Le mot de passe est obligatoire pour un nouvel utilisateur");
    }

    setLoading(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });

      if (res.ok) {
        toast.success(editingUser ? "Utilisateur modifié" : "Utilisateur créé");
        loadUsers();
        setIsUserModalOpen(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur système");
      }
    } catch (error) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Utilisateur supprimé");
        loadUsers();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur");
      }
    } catch (error) { toast.error("Erreur réseau"); }
  };

  const handleSendUserCredentials = async (u) => {
    if (!confirm(`Envoyer les identifiants de connexion à ${u.name} (${u.email}) ?`)) return;
    
    const t = toast.loading(`Envoi des identifiants à ${u.name}...`);
    try {
      const res = await fetch("/api/admin/users/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id })
      });
      if (res.ok) {
        toast.success("Email envoyé avec succès !", { id: t });
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de l'envoi", { id: t });
      }
    } catch (e) {
      toast.error("Erreur réseau", { id: t });
    }
  };

  // Communications
  const handleSendCodes = async () => {
    if (!selectedSessionForEmails) return toast.error("Sélectionnez une session");
    if (!confirm("Êtes-vous sûr de vouloir envoyer les codes à tous les candidats de cette session ?")) return;

    const t = toast.loading("Envoi des emails en cours...");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/communications/send-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSessionForEmails })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`${data.successCount} emails envoyés (${data.failCount} échecs sur ${data.total} candidats).`, { id: t });
      } else {
        toast.error(data.error || "Erreur d'envoi", { id: t });
      }
    } catch (error) { toast.error("Erreur réseau", { id: t }); }
    finally { setLoading(false); }
  };

  const handleSendGeneralMessage = async (e) => {
    e.preventDefault();
    if (!generalMessage.title || !generalMessage.body) return toast.error("Le titre et le message sont obligatoires");
    
    const t = toast.loading("Envoi du message en cours...");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/communications/send-general-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: generalMessage.title, 
          body: generalMessage.body, 
          recipientGroup: generalMessage.group 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`${data.successCount} messages envoyés avec succès.`, { id: t });
        setGeneralMessage({ ...generalMessage, title: "", body: "" });
      } else {
        toast.error(data.error || "Erreur d'envoi", { id: t });
      }
    } catch (error) { toast.error("Erreur réseau", { id: t }); }
    finally { setLoading(false); }
  };

  const handleTestEmail = async () => {
    const t = toast.loading("Test de connexion SMTP...");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Succès ! SMTP configuré correctement.", { id: t });
        setSmtpStatus("connected");
      } else {
        toast.error(data.error || "Erreur de configuration", { id: t, duration: 6000 });
        setSmtpStatus("error");
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur", { id: t });
      setSmtpStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 flex items-center gap-3">
          <Settings2 size={24} />
          Paramètres du Système
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
          Gérez votre profil et les configurations système en tant que <span className="font-bold text-[#D4AF37]">{userRole.replace('_', ' ').toLowerCase().replace(/\b\w/g, s => s.toUpperCase())}</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-6 shrink-0">
          {["Personnel", "Administration", "Système", "Sécurité"].map(group => {
            const groupTabs = allowedTabs.filter(t => t.group === group);
            if (groupTabs.length === 0) return null;

            return (
              <div key={group} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-3">{group}</h3>
                <div className="space-y-1">
                  {groupTabs.map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                        activeTab === tab.id 
                          ? "bg-[#003366] text-white shadow-xl shadow-blue-900/20 scale-[1.02]" 
                          : "bg-white/50 dark:bg-[#121212]/50 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E1E1E] hover:text-[#003366] dark:hover:text-white border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? "bg-white/10" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                        <tab.icon size={16} />
                      </div>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sécurité du Compte</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Modifiez vos informations personnelles et votre mot de passe.</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nom Complet</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Adresse Email</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all dark:text-white" />
                </div>
                
                <div className="md:col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Lock size={16}/> Changer de mot de passe (Optionnel)</h3>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Mot de Passe Actuel</label>
                  <input type={showPassword1 ? "text" : "password"} value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all dark:text-white" />
                  <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-10 text-gray-400 dark:text-gray-500"><Eye size={18}/></button>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nouveau Mot de Passe</label>
                  <input type={showPassword2 ? "text" : "password"} value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all dark:text-white" />
                  <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-10 text-gray-400 dark:text-gray-500"><Eye size={18}/></button>
                </div>

                <div className="md:col-span-2 flex justify-end mt-4">
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-[#003366] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#002244] transition-colors shadow-lg shadow-blue-900/10">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "users" && isSuperAdmin && (
             <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
               <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestion des Rôles</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Ajoutez des secrétaires, comptables ou autres admins.</p>
                </div>
                <button onClick={() => handleUserModalTrigger()} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-gray-100 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-100 dark:bg-blue-900/30 transition-all">
                  <Plus size={16}/> Ajouter
                </button>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600 font-bold">
                       <th className="pb-3 text-left">Utilisateur</th>
                       <th className="pb-3">Email</th>
                       <th className="pb-3">Rôle</th>
                       <th className="pb-3 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                     {users.map(u => (
                       <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A] transition-colors">
                         <td className="py-4 font-bold text-gray-800 dark:text-gray-200">{u.name}</td>
                         <td className="py-4 text-sm text-gray-500 dark:text-gray-500">{u.email}</td>
                         <td className="py-4">
                            <span className={`px-2 py-1 rounded font-bold text-[10px] tracking-wide ${u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                              {u.role}
                            </span>
                         </td>
                          <td className="py-4 text-right flex justify-end gap-2">
                             <button 
                               onClick={() => handleSendUserCredentials(u)} 
                               title="Envoyer les identifiants"
                               className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
                             >
                               <Send size={16}/>
                             </button>
                             <button onClick={() => handleUserModalTrigger(u)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 transition-all"><Edit2 size={16}/></button>
                             {u.id !== session?.user?.id && (
                               <button onClick={() => deleteUser(u.id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:bg-red-900/30 transition-all"><Trash2 size={16}/></button>
                             )}
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === "pricing" && isAccountant && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-50 dark:border-gray-800/50 shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <TrendingUp size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Reçu Total</span>
                  </div>
                  <div className="text-2xl font-black text-[#003366] dark:text-white">
                    {stats?.totalReceived?.toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-40">FCFA</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Sur {stats?.totalCandidates} candidats enregistrés</div>
                </div>
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-50 dark:border-gray-800/50 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-600 mb-2">
                    <BarChart3 size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">En Attente</span>
                  </div>
                  <div className="text-2xl font-black text-[#003366] dark:text-white">
                    {stats?.totalOutstanding?.toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-40">FCFA</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Montant restant à recouvrer</div>
                </div>
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-50 dark:border-gray-800/50 shadow-sm">
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <LayoutDashboard size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Taux de Paiement</span>
                  </div>
                  <div className="text-2xl font-black text-[#003366] dark:text-white">
                    {stats?.totalExpected ? Math.round((stats.totalReceived / stats.totalExpected) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Global sur l&apos;ensemble de la base</div>
                </div>
              </div>

              {/* Pricing List */}
              <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Catalogue des Tarifs</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Configurez les prix des modules, cours et frais annexes.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingPricing(null);
                      setPricingForm({ label: "", price: 0, category: "MODULE", code: "", level: "A1" });
                      setIsPricingModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#003366] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002244] transition-all"
                  >
                    <Plus size={16}/> Ajouter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="pb-3">Libellé</th>
                        <th className="pb-3">Catégorie</th>
                        <th className="pb-3">Niveau</th>
                        <th className="pb-3">Prix (FCFA)</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {pricings.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A] transition-colors group">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{p.label}</span>
                              <span className="text-[10px] text-gray-400 font-mono uppercase">{p.code}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-bold text-gray-500">{p.category}</span>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-bold text-[#003366] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">{p.level || 'Tous'}</span>
                          </td>
                          <td className="py-4">
                            <span className="font-black text-emerald-600">{p.price.toLocaleString('fr-FR')}</span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingPricing(p.id);
                                  setPricingForm({ label: p.label, price: p.price, category: p.category, code: p.code, level: p.level || "A1" });
                                  setIsPricingModalOpen(true);
                                }}
                                className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100"
                              >
                                <Edit2 size={14}/>
                              </button>
                              <button onClick={() => deletePricing(p.id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100">
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "communications" && isSecretary && (
             <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Codes de Consultation (Envoi Massif)</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Expédiez par email les codes d&apos;accès aux résultats.</p>
                  </div>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 p-6">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm mb-4">
                    <Send size={16} /> Envoi par Session
                  </div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Sélectionner la Session Cible</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select 
                      className="flex-1 px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all font-bold text-sm"
                      value={selectedSessionForEmails}
                      onChange={e => setSelectedSessionForEmails(e.target.value)}
                    >
                      <option value="">-- Choisir une session --</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.level}) - {s._count?.candidates || 0} candidats</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleSendCodes}
                      disabled={loading}
                      className="px-6 py-3 bg-[#003366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#002244] transition-colors shadow-lg shadow-blue-900/10 whitespace-nowrap"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Lancer l&apos;Envoi
                    </button>
                  </div>
                  <div className="flex items-start gap-2 mt-4 opacity-70">
                    <ShieldAlert size={14} className="mt-0.5 text-amber-600" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      L&apos;envoi va distribuer le code secret à TOUS les candidats ayant une adresse email valide dans cette session.
                    </p>
                  </div>
                </div>

                {/* New General Messaging Section */}
                <div className="mt-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 p-6">
                  <div className="flex items-center gap-2 text-[#003366] dark:text-blue-400 font-bold text-sm mb-4">
                    <Mail size={16} /> Messagerie Générale (Email No-Reply)
                  </div>
                  
                  <form onSubmit={handleSendGeneralMessage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Objet du Message</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Information importante - Spass mit Deutsch"
                          className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-white transition-all font-bold text-sm"
                          value={generalMessage.title}
                          onChange={e => setGeneralMessage({ ...generalMessage, title: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Destinataires</label>
                        <select 
                          className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-white transition-all font-bold text-sm"
                          value={generalMessage.group}
                          onChange={e => setGeneralMessage({ ...generalMessage, group: e.target.value })}
                        >
                          <option value="ALL_STUDENTS">Tous les Étudiants (Cours réguliers)</option>
                          <option value="OSD_CANDIDATES">Tous les Candidats (Examens ÖSD)</option>
                          <option value="ADMIN_TEAM">L&apos;équipe Administrative uniquement</option>
                          <option value="EVERYONE">Tout le monde (Étudiants + Candidats + Admin)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Corps du Message</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Écrivez votre message ici..."
                          className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-white transition-all text-sm min-h-[120px]"
                          value={generalMessage.body}
                          onChange={e => setGeneralMessage({ ...generalMessage, body: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-[#003366] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Envoyer le Message Email
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <Database size={16} className="text-emerald-500" />
                    Statut du Serveur Email
                  </h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Vérifiez si le système SMTP est correctement authentifié.
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleTestEmail}
                      disabled={loading}
                      className="px-6 py-2 bg-white dark:bg-[#1A1A1A] text-[#003366] dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-all"
                    >
                      <Mail size={16} />
                      Tester la connexion SMTP
                    </button>
                    {smtpStatus !== "unknown" && (
                      <div className={`flex items-center gap-2 text-xs font-bold ${smtpStatus === "connected" ? "text-emerald-600" : "text-red-600"}`}>
                        <div className={`w-2 h-2 rounded-full ${smtpStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        {smtpStatus === "connected" ? "Serveur Opérationnel" : "Erreur de Connexion"}
                      </div>
                    )}
                  </div>
                </div>
             </div>
          )}

          {activeTab === "lms" && isSecretary && (
             <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestion des Accès LMS</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Initialisez les mots de passe et gérez l&apos;onboarding des étudiants.</p>
                  </div>
                </div>

                {/* LMS Access Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800/50">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Étudiants</div>
                    <div className="text-xl font-black text-[#003366] dark:text-white">{lmsStats.total}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50">
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase mb-1">Sans Accès LMS</div>
                    <div className="text-xl font-black text-amber-700 dark:text-amber-400">{lmsStats.withoutAccess}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#003366] dark:text-blue-400 mb-2">Génération en Masse</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Crée des mots de passe pour les comptes sans accès (sans envoi email).</p>
                    <div className="flex gap-4">
                      <select 
                        className="flex-1 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl outline-none text-sm font-bold dark:text-white"
                        value={selectedSessionForEmails}
                        onChange={e => setSelectedSessionForEmails(e.target.value)}
                      >
                        <option value="">-- Choisir une session --</option>
                        <option value="SIMPLE">Tous les Étudiants (LMS)</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                      <button 
                        onClick={async () => {
                          if (!selectedSessionForEmails) return toast.error("Sélectionnez une session");
                          const t = toast.loading("Action en cours...");
                          setLoading(true);
                          try {
                            const res = await fetch("/api/admin/candidates/credentials", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: 'INITIALIZE', sessionId: selectedSessionForEmails })
                            });
                            const data = await res.json();
                            if (res.ok) toast.success(`${data.successCount} comptes initialisés.`, { id: t });
                          } catch (e) { toast.error("Erreur", { id: t }); }
                          finally { setLoading(false); }
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-[#003366] text-white rounded-xl font-bold text-sm"
                      >
                        Initialiser
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50/30 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">Déploiement Massive des Identifiants</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Envoie les identifiants par email (avec réinitialisation du mot de passe).</p>
                    <div className="flex gap-4">
                      <select 
                        className="flex-1 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl outline-none text-sm font-bold dark:text-white"
                        value={selectedSessionForEmails}
                        onChange={e => setSelectedSessionForEmails(e.target.value)}
                      >
                        <option value="">-- Choisir une session --</option>
                        <option value="SIMPLE">Tous les Étudiants (LMS)</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                      <button 
                        onClick={async () => {
                          if (!selectedSessionForEmails) return toast.error("Sélectionnez une session");
                          if (!confirm("Envoyer à toute la session ?")) return;
                          const t = toast.loading("Envoi massif...");
                          setLoading(true);
                          try {
                            const res = await fetch("/api/admin/candidates/credentials", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: 'SEND_CREDENTIALS', sessionId: selectedSessionForEmails, force: true })
                            });
                            const data = await res.json();
                            if (res.ok) toast.success(`${data.successCount} emails envoyés.`, { id: t });
                          } catch (e) { toast.error("Erreur", { id: t }); }
                          finally { setLoading(false); }
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm"
                      >
                        Lancer l&apos;Envoi
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === "audit" && isSuperAdmin && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Journal d&apos;Audit</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Traçabilité complète des actions administratives.</p>
                </div>
                <button 
                  onClick={handleCleanupLogs}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Nettoyer
                </button>
              </div>

              <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#121212]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
                      <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Admin</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Cible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{log.adminName}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase">{log.action.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">{log.targetName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination 
                   total={auditTotal}
                   page={auditPage}
                   limit={auditLimit}
                   onPageChange={setAuditPage}
                   onLimitChange={(l) => { setAuditLimit(l); setAuditPage(1); }}
                   loading={loading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsPricingModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">{editingPricing ? "Modifier le Tarif" : "Nouveau Tarif"}</h3>
             <form onSubmit={handleUpdatePrice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Libellé</label>
                    <input required type="text" value={pricingForm.label} onChange={e => setPricingForm({...pricingForm, label: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Code Technique</label>
                    <input required type="text" value={pricingForm.code} onChange={e => setPricingForm({...pricingForm, code: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prix (FCFA)</label>
                    <input required type="number" value={pricingForm.price} onChange={e => setPricingForm({...pricingForm, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Catégorie</label>
                    <select value={pricingForm.category} onChange={e => setPricingForm({...pricingForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white">
                      <option value="MODULE">Module</option>
                      <option value="PREP_COURSE">Cours de Préparation</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Niveau</label>
                    <select value={pricingForm.level} onChange={e => setPricingForm({...pricingForm, level: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white">
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="GLOBAL">Global</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPricingModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Annuler</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-[#003366] rounded-xl hover:bg-[#002244] transition-all">
                    {loading ? "Envoi..." : "Valider"}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">{editingUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}</h3>
             <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nom Complet</label>
                  <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                  <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rôle</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white">
                    <option value="SUPER_ADMIN">Super Administrateur</option>
                    <option value="SECRETARY">Secrétaire (Saisie Notes)</option>
                    <option value="ACCOUNTANT">Comptable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mot de Passe {editingUser && "(Laisser vide pour ne pas changer)"}</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl dark:text-white" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Annuler</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-[#003366] rounded-xl">Valider</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
