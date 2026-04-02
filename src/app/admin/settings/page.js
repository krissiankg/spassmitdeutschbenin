"use client";
import React, { useState, useEffect } from "react";
import { User, Shield, Send, Lock, Eye, EyeOff, Loader2, Save, Users, Plus, Trash2, Mail, CreditCard, Edit2, History, ShieldAlert, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Pagination from "@/components/Pagination";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

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
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(25);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditActionFilter, setAuditActionFilter] = useState("All");
  
  const [loading, setLoading] = useState(false);

  const loadUsers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadSessions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadPricings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricings(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadAuditLogs = React.useCallback(async () => {
    if (!isAdmin) return;
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
  }, [isAdmin, auditPage, auditLimit, auditActionFilter]);

  // Load Initial Data
  useEffect(() => {
    if (session?.user) {
      setProfileForm(f => ({ ...f, name: session.user.name, email: session.user.email }));
    }
    if (isAdmin) {
       loadUsers();
       loadPricings();
       loadAuditLogs();
    }
    loadSessions();
  }, [session, isAdmin, auditPage, auditLimit, auditActionFilter, loadUsers, loadPricings, loadAuditLogs, loadSessions]);

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

  const handleUpdatePrice = async (e, id) => {
    e.preventDefault();
    const p = pricings.find(x => x.id === id);
    if (!p) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, price: p.price, label: p.label })
      });
      if (res.ok) {
        toast.success("Tarif mis à jour");
        setEditingPricing(null);
      } else {
        toast.error("Erreur de modification");
      }
    } catch (err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
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
      } else {
        toast.error(data.error || "Erreur de configuration", { id: t, duration: 6000 });
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur", { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">Paramètres du Système</h1>
        <p className="text-sm text-gray-500 dark:text-gray-500">Gérez votre compte, les accès utilisateurs et les outils de communication.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "profile" ? "bg-[#003366] text-white shadow-lg shadow-blue-900/10" : "bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:bg-[#1E1E1E]"}`}
          >
            <User size={18} /> Mon Profil
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "users" ? "bg-[#003366] text-white shadow-lg shadow-blue-900/10" : "bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:bg-[#1E1E1E]"}`}
            >
              <Users size={18} /> Gérer les Rôles
            </button>
          )}



          <button 
            onClick={() => setActiveTab("communications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "communications" ? "bg-[#003366] text-white shadow-lg shadow-blue-900/10" : "bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:bg-[#1E1E1E]"}`}
          >
            <Send size={18} /> Outils d&apos;Envoi Mail
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "audit" ? "bg-[#003366] text-white shadow-lg shadow-blue-900/10" : "bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:bg-[#1E1E1E]"}`}
            >
              <History size={18} /> Journal d&apos;Audit
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sécurité du Compte</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Pour modifier votre mot de passe, l&apos;ancien est requis.</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nom Complet</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Adresse Email</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
                </div>
                
                <div className="md:col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Lock size={16}/> Changer de mot de passe (Optionnel)</h3>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Mot de Passe Actuel</label>
                  <input type={showPassword1 ? "text" : "password"} value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-10 text-gray-400 dark:text-gray-500"><Eye size={18}/></button>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nouveau Mot de Passe</label>
                  <input type={showPassword2 ? "text" : "password"} value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
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

          {activeTab === "users" && isAdmin && (
             <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
               <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestion des Rôles</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Ajoutez des secrétaires, comptables ou autres admins.</p>
                </div>
                <button onClick={() => handleUserModalTrigger()} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-gray-100 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-100 dark:bg-blue-900/30">
                  <Plus size={16}/> Ajouter
                </button>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
                       <th className="pb-3 text-left">Utilisateur</th>
                       <th className="pb-3">Email</th>
                       <th className="pb-3">Rôle</th>
                       <th className="pb-3 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                     {users.map(u => (
                       <tr key={u.id} className="hover:bg-gray-50/50 dark:bg-[#1A1A1A]">
                         <td className="py-4 font-bold text-gray-800 dark:text-gray-200">{u.name}</td>
                         <td className="py-4 text-sm text-gray-500 dark:text-gray-500">{u.email}</td>
                         <td className="py-4">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded font-bold text-[10px] tracking-wide">
                              {u.role}
                            </span>
                         </td>
                         <td className="py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleUserModalTrigger(u)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30"><User size={16}/></button>
                            {u.id !== session?.user?.id && (
                              <button onClick={() => deleteUser(u.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                            )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}



          {activeTab === "communications" && (
             <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Codes de Consultation (Envoi Massif)</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Saisissez rapidement un email aux candidats avec leurs codes uniques.</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
                  <p className="text-sm font-bold text-amber-800 mb-4">Envoyer par Session</p>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Sélectionner la Session</label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <select 
                      className="flex-1 px-4 py-3 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all"
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
                      Déclencher l&apos;Envoi
                    </button>
                  </div>
                  <p className="text-xs text-amber-600/70 mt-4 leading-relaxed">
                    <strong>Attention :</strong> L&apos;envoi va distribuer le code secret à TOUS les candidats enregistrés sur la session ayant fourni une adresse email valide ! Assurez-vous d&apos;être prêt à distribuer les accès au portail web.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    Configuration Technique
                  </h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Vérifiez si votre serveur email (SMTP) est prêt à envoyer des messages vers l&apos;extérieur.
                  </p>
                  <button 
                    onClick={handleTestEmail}
                    disabled={loading}
                    className="px-6 py-3 bg-white dark:bg-[#1A1A1A] text-[#003366] dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Mail size={18} />
                    Tester ma configuration SMTP
                  </button>
                </div>
             </div>
          )}

          {activeTab === "audit" && isAdmin && (
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
                  <Trash2 size={16} /> Nettoyer les logs ({">"} 2 mois)
                </button>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  Les journaux d&apos;audit sont conservés indéfiniment. 
                  Il est recommandé de purger les logs de plus de 2 mois si la base de données devient volumineuse.
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <select 
                    value={auditActionFilter}
                    onChange={(e) => {setAuditActionFilter(e.target.value); setAuditPage(1);}}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-[#003366] dark:text-gray-200 outline-none"
                  >
                    <option value="All">Toutes les Actions</option>
                    <option value="DELETE_CANDIDATE">Suppression Candidat</option>
                    <option value="UPDATE_CANDIDATE">Modification Candidat</option>
                    <option value="RECORD_PAYMENT">Encaissement</option>
                    <option value="PUBLISH_RESULTS">Publication Résultats</option>
                    <option value="CLEANUP_LOGS">Nettoyage Logs</option>
                  </select>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#121212]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
                      <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="px-6 py-4">Date & Heure</th>
                        <th className="px-6 py-4">Admin</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Cible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                              <History size={12} className="opacity-40" />
                              {new Date(log.createdAt).toLocaleString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{log.adminName}</span>
                              <span className="text-[10px] text-gray-400">{log.adminEmail}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                              log.action.includes('DELETE') ? 'bg-red-50 text-red-600 border border-red-100' :
                              log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                            {log.targetName || '-'}
                            {log.targetType && <span className="ml-2 text-[9px] font-normal text-gray-400 italic">({log.targetType})</span>}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">Aucun résultat trouvé.</td>
                        </tr>
                      )}
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

      {/* Creation User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">{editingUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}</h3>
             <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nom Complet</label>
                  <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Email de Connexion</label>
                  <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Rôle</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl outline-none">
                    <option value="SUPER_ADMIN">Super Administrateur</option>
                    <option value="SECRETARY">Secrétaire (Saisie Notes)</option>
                    <option value="ACCOUNTANT">Comptable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Mot de Passe {editingUser && "(Optionnel si statique)"}</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl dark:hover:bg-gray-800">Annuler</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-[#003366] rounded-xl hover:bg-[#002244]">{loading ? "En cours..." : "Valider"}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
