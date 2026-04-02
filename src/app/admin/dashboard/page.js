"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  FileText,
  Plus,
  Loader2,
  Wand2,
  Check,
  HelpCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";

const COLORS = ['#003366', '#D4AF37', '#3b82f6', '#10b981', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => (
  <div className="card-premium p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
      </div>
      {trend && !loading && (
        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}%
        </span>
      )}
    </div>
    {loading ? (
      <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg mb-1"></div>
    ) : (
      <h3 className="text-3xl font-bold text-[#003366] dark:text-gray-100 mb-1">{value}</h3>
    )}
    <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">{label}</p>
  </div>
);


export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSecretary = session?.user?.role === "SECRETARY";

  // Quick Add Candidate Form
  const [quickForm, setQuickForm] = useState({ firstName: "", lastName: "", level: "A1" });
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if(!quickForm.firstName || !quickForm.lastName) return toast.error("Remplissez le nom et prénom");
    setIsAdding(true);
    try {
      // API call to create candidate with generic defaults
      const res = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // On génère un numéro auto SMD- et un code côté back s'ils sont manquants
        body: JSON.stringify({
          firstName: quickForm.firstName,
          lastName: quickForm.lastName,
          level: quickForm.level,
          email: "",
          sessionId: null, // Sans session par défaut
        })
      });

      if (res.ok) {
        toast.success("Candidat ajouté avec succès");
        setQuickForm({ firstName: "", lastName: "", level: "A1" });
        // Rafraîchir les stats
        fetchDashboardData();
      } else {
        toast.error("Erreur d'ajout");
      }
    } catch(err) {
      toast.error("Erreur réseau");
    } finally {
      setIsAdding(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003366] dark:text-gray-100 tracking-tight">
            Bonjour, {session?.user?.name || "Admin"}
          </h1>
          <p className="text-gray-500 dark:text-gray-500 mt-1">
            {isSecretary 
              ? "Prêt pour la saisie des notes d'aujourd'hui ?" 
              : "Voici ce qui se passe dans votre centre aujourd'hui."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Calendar size={18} /> Exporter Rapport
          </button>
          {!isSecretary && (
            <Link href="/admin/sessions" className="btn-primary flex items-center gap-2 py-2 text-sm shadow-lg shadow-blue-900/10">
              <Plus size={18} /> Nouvelle Session
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Candidats Totaux" 
          value={data?.stats?.totalCandidates?.toLocaleString() || "0"} 
          loading={loading}
          color="bg-blue-100 dark:bg-blue-900/30" 
        />
        <StatCard 
          icon={Calendar} 
          label="Sessions Actives" 
          value={data?.stats?.activeSessions || "0"} 
          loading={loading}
          color="bg-purple-100" 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Résultats Publiés" 
          value={data?.stats?.publishedResults || "0"} 
          loading={loading}
          color="bg-green-100" 
        />
        <StatCard 
          icon={Clock} 
          label="En attente de saisie" 
          value={data?.stats?.pendingResults || "0"} 
          loading={loading}
          color="bg-orange-100" 
        />
      </div>

      {/* Ligne 2 : Graphique d'Évolution */}
      <div className="card-premium p-8 h-[400px]">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 ">Évolution des Inscriptions</h3>
               <p className="text-sm text-gray-400 dark:text-gray-500">Croissance sur les 6 derniers mois</p>
            </div>
         </div>
         {loading ? (
            <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-[#003366] dark:text-gray-100 " size={32} /></div>
         ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRegistrations || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003366" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#003366" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#003366' }}
                  />
                  <Area type="monotone" dataKey="total" name="Nouveaux inscrits" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         )}
      </div>

      {/* Ligne 3 : 3 Colonnes */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Colonne 1 : Centre d'Aide */}
        <div className="card-premium p-8 bg-gradient-to-br from-[#00315f] to-[#01213f] text-white border-0 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
            <HelpCircle size={24} className="text-[#D4AF37]" />
          </div>
          
          <h3 className="text-xl font-bold mb-2 text-white">Besoin d'aide ?</h3>
          <p className="text-sm text-blue-100/80 mb-8 leading-relaxed">
            Consultez nos guides interactifs pour apprendre à gérer les sessions, les inscriptions et les paiements en toute sérénité.
          </p>
          
          <Link 
            href="/admin/help" 
            className="group/btn flex items-center justify-between w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#b8952d] text-[#003366] rounded-2xl transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <span className="font-bold text-sm">Ouvrir le Tutoriel</span>
            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </Link>
          
          <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            Supports Secrétaire & Comptable
          </div>
        </div>

        {/* Colonne 2 : Graphique Répartition des Niveaux */}
        <div className="card-premium p-8">
          <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-2">Répartition par Niveau</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Volume total d'étudiants par parcours</p>
          {loading ? (
             <div className="h-48 flex justify-center items-center"><Loader2 className="animate-spin text-[#003366] dark:text-gray-100 " size={32} /></div>
          ) : data?.levelDistribution?.length > 0 ? (
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.levelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                       itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="flex justify-center gap-4 mt-2">
                  {data.levelDistribution.map((entry, index) => (
                     <div key={index} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                        {entry.name}
                     </div>
                  ))}
               </div>
             </div>
          ) : (
            <div className="h-48 flex justify-center items-center text-sm text-gray-400 dark:text-gray-500 italic">Aucune donnée</div>
          )}
        </div>

        {/* Colonne 3 : Ajout Rapide Candidat */}
        <div className="card-premium p-8 border-t-4 border-[#003366]">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-gray-100 ">
                <Wand2 size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-[#003366] dark:text-gray-100 ">Ajout Rapide</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Créer un candidat "en attente"</p>
             </div>
          </div>
          
          <form onSubmit={handleQuickAdd} className="space-y-4">
             <div>
               <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
               <input 
                 value={quickForm.firstName}
                 onChange={e => setQuickForm({...quickForm, firstName: e.target.value})}
                 className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none" 
                 placeholder="Ex: John"
               />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nom</label>
               <input 
                 value={quickForm.lastName}
                 onChange={e => setQuickForm({...quickForm, lastName: e.target.value})}
                 className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none" 
                 placeholder="Ex: Doe"
               />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Niveau Visé</label>
               <select 
                 value={quickForm.level}
                 onChange={e => setQuickForm({...quickForm, level: e.target.value})}
                 className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-[#003366] outline-none"
               >
                  <option value="A1">Niveau A1</option>
                  <option value="A2">Niveau A2</option>
                  <option value="B1">Niveau B1</option>
                  <option value="B2">Niveau B2</option>
               </select>
             </div>
             <button disabled={isAdding} className="w-full mt-2 py-3 bg-[#003366] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#002244] transition-colors flex items-center justify-center gap-2">
               {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
               Générer son ID
             </button>
             <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 mt-2">Le matricule et le code seront auto-générés.</p>
          </form>
        </div>

      </div>
    </div>
  );
}
