"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Tags, Bell, Search, Plus, Edit2, Trash2,
  CheckCircle, XCircle, AlertCircle, Loader2, Save,
  Download, TrendingUp, Users, ArrowUpRight, History,
  Filter, Mail, FileText, ChevronRight, PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';

// ==========================================
// 1. STATS DASHBOARD
// ==========================================
const StatsDashboard = ({ stats }) => {
  if (!stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
      ))}
    </div>
  );

  const cards = [
    { label: "CA Global", value: `${stats.totalExpected.toLocaleString()} F`, sub: "Chiffre d'affaires attendu", icon: Wallet, color: "blue" },
    { label: "Encaissé", value: `${stats.totalReceived.toLocaleString()} F`, sub: `${((stats.totalReceived / stats.totalExpected) * 100 || 0).toFixed(1)}% de recouvrement`, icon: TrendingUp, color: "green" },
    { label: "Restant", value: `${stats.totalOutstanding.toLocaleString()} F`, sub: "Somme à recouvrer", icon: AlertCircle, color: "amber" },
    { label: "Apprenants", value: stats.totalCandidates, sub: "Total inscrits actifs", icon: Users, color: "purple" },
  ];

  const pieData = [
    { name: 'Soldé', value: stats.statusCounts.PAID, color: '#10B981' },
    { name: 'Partiel', value: stats.statusCounts.PARTIAL, color: '#F59E0B' },
    { name: 'Impayé', value: stats.statusCounts.UNPAID, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center
              ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                card.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                  card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    'bg-purple-50 text-purple-600'}`}
            >
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-gray-100">{card.value}</h4>
            <p className="text-[10px] font-medium text-gray-400 mt-2">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Recettes Mensuelles
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#003366" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value.toLocaleString()} F`, 'Recette']}
                />
                <Area type="monotone" dataKey="amount" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-2">
            <PieChartIcon size={18} className="text-amber-500" />
            Statuts de Paiement
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Candidats</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalCandidates}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-gray-500 uppercase tracking-widest">{d.name}</span>
                </div>
                <span className="text-gray-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CAISSE & PAIEMENTS
// ==========================================
const CashierTab = ({ onPaymentRecorded }) => {
  const { data: session } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "CASH", reference: "" });
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustingAmount, setAdjustingAmount] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [pricings, setPricings] = useState([]);

  useEffect(() => {
    fetch("/api/admin/pricing").then(res => res.json()).then(data => {
        if (Array.isArray(data)) setPricings(data);
    }).catch(e => console.error("Error fetching pricings", e));
  }, []);

  const loadCandidates = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/cashier?search=${search}&page=${page}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setTotal(data.total || 0);
      }
    } catch (e) { toast.error("Erreur chargement candidats"); }
    finally { setLoading(false); }
  }, [search, page, limit]);

  useEffect(() => {
    loadCandidates();
  }, [search, limit, page, loadCandidates]);

  const handleUpdateTotal = async (id) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounting/update-total", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id, totalAmount: Number(adjustingAmount) })
      });
      if (res.ok) {
        toast.success("Total modifié");
        setAdjustingId(null);
        loadCandidates();
        if (onPaymentRecorded) onPaymentRecorded();
      } else {
        const d = await res.json();
        toast.error(d.error || "Erreur modification");
      }
    } catch (e) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounting/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          amount: Number(paymentForm.amount),
          method: paymentForm.method,
          reference: paymentForm.reference
        })
      });
      if (res.ok) {
        toast.success("Paiement enregistré !");
        loadCandidates();
        setSelectedCandidate(null);
        if (onPaymentRecorded) onPaymentRecorded();
      } else {
        const d = await res.json();
        toast.error(d.error || "Erreur lors du paiement");
      }
    } catch (e) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-1 leading-tight">Caisse & Encaissements</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Enregistrement manuel des règlements</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher (Nom, Matricule...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
          />
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 dark:bg-[#121212] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Aucun apprenant correspondant</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 border-b border-gray-50 dark:border-gray-800">
                <th className="pb-4 px-4">Apprenant</th>
                <th className="pb-4 px-4">Session</th>
                <th className="pb-4 px-4 text-right">À Régler</th>
                <th className="pb-4 px-4 text-right">Paiements</th>
                <th className="pb-4 px-4 text-center">Statut</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {candidates.map(c => {
                const total = c.totalAmount || 0;
                const paid = c.amountPaid || 0;
                const reste = total - paid;
                return (
                  <tr key={c.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <td className="py-5 px-4">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-100">{c.firstName} {c.lastName}</p>
                      <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 mt-0.5 mb-2">{c.candidateNumber}</p>
                      {c.enrollments && c.enrollments.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.enrollments.map(en => (
                            <span key={en.id} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-blue-300 rounded text-[8px] font-bold border border-blue-100 dark:border-blue-800">
                              {en.course.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {(c.chosenModules?.length > 0 || c.prepCourses?.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.chosenModules.map(code => (
                            <span key={code} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded text-[8px] font-bold border border-amber-100 dark:border-amber-800">
                              OSD: {pricings.find(p => p.code === code)?.label || code}
                            </span>
                          ))}
                          {c.prepCourses.map(code => (
                            <span key={code} className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded text-[8px] font-bold border border-purple-100 dark:border-purple-800">
                              Prep: {pricings.find(p => p.code === code)?.label || code}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg uppercase tracking-tight">
                        {c.session?.title || c.level || '-'}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      {adjustingId === c.id ? (
                        <div className="flex bg-white dark:bg-[#121212] border border-blue-200 rounded-xl overflow-hidden ml-auto w-32 shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/10 transition-all">
                          <input
                            type="number"
                            value={adjustingAmount}
                            onChange={e => setAdjustingAmount(e.target.value)}
                            className="w-full px-3 py-1 text-xs outline-none font-black text-blue-900 dark:text-white"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateTotal(c.id)} className="bg-blue-600 px-3 text-white hover:bg-blue-700">
                            <CheckCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-sm font-black text-gray-700 dark:text-gray-200">
                          {total.toLocaleString()} F
                          <button onClick={() => { setAdjustingId(c.id); setAdjustingAmount(total); }} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-4 text-right font-black text-emerald-600 text-sm">
                      {paid.toLocaleString()} F
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase
                          ${c.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          c.paymentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {c.paymentStatus === 'PAID' ? 'SOLDÉ' : c.paymentStatus === 'PARTIAL' ? 'PARTIEL' : 'IMPAYÉ'}
                      </span>
                    </td>
                    <td className="py-5 px-4 flex gap-2 justify-end">
                      {reste > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCandidate(c);
                            setPaymentForm({ amount: reste, method: "CASH", reference: "" });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                          <Wallet size={14} /> Encaisser
                        </button>
                      )}
                      {(c.paymentStatus === "PAID" || paid > 0) && (
                        <button
                          onClick={() => generateInvoicePDF(c, session?.user)}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all border border-blue-100 dark:border-blue-900/30"
                          title="Télécharger Reçu"
                        >
                          <Download size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-10">
            <Pagination
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              loading={loading}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedCandidate(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative bg-white dark:bg-[#1E1E1E] rounded-[3rem] shadow-2xl p-10 w-full max-w-md border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 leading-tight">Enregistrement</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                  <TrendingUp size={32} />
                </div>
              </div>

               <form onSubmit={handlePayment} className="space-y-8">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={64} className="rotate-[-15deg]" />
                  </div>
                  <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 relative z-10">Montant Reçu (FCFA)</label>
                  <input required type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full bg-transparent text-5xl font-black text-emerald-900 dark:text-emerald-400 outline-none relative z-10" autoFocus />
                  
                  {(selectedCandidate.enrollments?.length > 0 || selectedCandidate.chosenModules?.length > 0 || selectedCandidate.prepCourses?.length > 0) && (
                    <div className="mt-6 pt-4 border-t border-emerald-100/50 dark:border-emerald-900/20 space-y-2 relative z-10">
                      <p className="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest mb-2">Détail des frais</p>
                      {selectedCandidate.enrollments?.map(en => (
                        <div key={en.id} className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-emerald-800/60 uppercase">{en.course.name}</span>
                          <span className="font-black text-emerald-900 dark:text-emerald-400">{en.course.price.toLocaleString()} F</span>
                        </div>
                      ))}
                      {selectedCandidate.chosenModules?.map(code => {
                        const p = pricings.find(pr => pr.code === code);
                        return (
                          <div key={code} className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-emerald-800/60 uppercase">OSD: {p?.label || code}</span>
                            <span className="font-black text-emerald-900 dark:text-emerald-400">{(p?.price || 0).toLocaleString()} F</span>
                          </div>
                        );
                      })}
                      {selectedCandidate.prepCourses?.map(code => {
                        const p = pricings.find(pr => pr.code === code);
                        return (
                          <div key={code} className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-emerald-800/60 uppercase">Prep: {p?.label || code}</span>
                            <span className="font-black text-emerald-900 dark:text-emerald-400">{(p?.price || 0).toLocaleString()} F</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-emerald-100/50 dark:border-emerald-900/20 flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Total dû / Reste</span>
                    <div className="text-right">
                      <span className="text-[9px] block opacity-40 font-black">{selectedCandidate.totalAmount.toLocaleString()} F</span>
                      <span className="text-base font-black text-emerald-900 dark:text-emerald-400">{(selectedCandidate.totalAmount - selectedCandidate.amountPaid).toLocaleString()} F</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mode de règlement</label>
                    <select required value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-xs uppercase tracking-widest appearance-none">
                      <option value="CASH">Espèces (Comptoir)</option>
                      <option value="MOBILE_MONEY">Mobile Money (Wave/Orange)</option>
                      <option value="BANK_TRANSFER">Virement / Chèque</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Référence Transaction</label>
                    <input type="text" placeholder="Ex: N° de transaction ou note" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-sm" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setSelectedCandidate(null)} className="flex-1 px-8 py-5 bg-gray-100 dark:bg-[#121212] text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-gray-200">Retour</button>
                  <button type="submit" disabled={loading} className="flex-[2] px-8 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all">
                    {loading ? "Traitement..." : "Confirmer l'encaissement"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 3. HISTORY TAB
// ==========================================
const HistoryTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/history?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setTotal(data.total);
      }
    } catch (e) { toast.error("Erreur historique"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-gray-800 dark:text-white mb-1">Journal des Flux</h3>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-black">Historique centralisé des transactions</p>
        </div>
        <button onClick={fetchHistory} className="w-12 h-12 bg-gray-50 dark:bg-[#121212] rounded-2xl flex items-center justify-center text-blue-600 hover:rotate-180 transition-all duration-700 border border-gray-100 dark:border-gray-800">
          <History size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aucune transaction enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-[#121212] rounded-[1.8rem] border border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:bg-white dark:hover:bg-blue-900/5 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                  ${p.method === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
                >
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100">{p.candidate.firstName} {p.candidate.lastName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
                    <span className="text-blue-500">{p.candidate.candidateNumber}</span>
                    <span className="opacity-30">|</span>
                    {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900 dark:text-white">+{p.amount.toLocaleString()} F</p>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full inline-block">
                  {p.method === 'CASH' ? 'Espèces' : p.method === 'MOBILE_MONEY' ? 'Mobile' : 'Virement'}
                </p>
              </div>
            </motion.div>
          ))}
          <div className="mt-10">
            <Pagination total={total} page={page} limit={20} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. REMINDERS TAB
// ==========================================
const RemindersTab = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchDebtors();
  }, [filter]);

  const fetchDebtors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/reminders?filter=${filter}`);
      if (res.ok) setDebtors(await res.json());
    } catch (e) { toast.error("Erreur relances"); }
    finally { setLoading(false); }
  };

  const handleSendBulkReminders = async () => {
    if (!confirm(`Envoyer un rappel par email aux ${debtors.length} apprenants sélectionnés ?`)) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/accounting/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtorIds: debtors.map(d => d.id) })
      });
      if (res.ok) {
        const d = await res.json();
        toast.success(d.message);
      } else {
        toast.error("Échec de l'envoi");
      }
    } catch (e) { toast.error("Erreur réseau"); }
    finally { setSending(false); }
  };

  const handleSendSingleReminder = async (id) => {
    setSending(true);
    try {
      const res = await fetch("/api/admin/accounting/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtorIds: [id] })
      });
      if (res.ok) toast.success("Rappel envoyé");
    } catch (e) { }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">Relances Débiteurs</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Apprenants avec soldes en attente de règlement</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
            {[
              { id: "ALL", label: "Tous", count: debtors.length },
              { id: "UNPAID", label: "Impayer", count: debtors.filter(d => d.paymentStatus === 'UNPAID').length },
              { id: "PARTIAL", label: "Partiel", count: debtors.filter(d => d.paymentStatus === 'PARTIAL').length }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                   ${filter === f.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f.label}
                {f.count > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${filter === f.id ? 'bg-white/20' : 'bg-gray-200'}`}>{f.count}</span>}
              </button>
            ))}
          </div>
          {debtors.length > 0 && (
            <button
              onClick={handleSendBulkReminders}
              disabled={sending}
              className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Relance Groupée
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      ) : debtors.length === 0 ? (
        <div className="text-center py-24 bg-emerald-50/20 dark:bg-emerald-900/5 rounded-[3rem] border-2 border-dashed border-emerald-100 dark:border-emerald-900/20">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
          <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-2 uppercase tracking-tight">Trésorerie à jour</h4>
          <p className="text-sm font-medium text-emerald-700/60 max-w-xs mx-auto">Aucun impayé n'a été détecté dans la base de données actuelle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {debtors.map((d, i) => {
            const reste = d.totalAmount - d.amountPaid;
            const progress = (d.amountPaid / d.totalAmount) * 100;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
              >
                {/* Status Badge Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-[0.05] pointer-events-none
                   ${d.paymentStatus === 'UNPAID' ? 'bg-red-500' : 'bg-orange-500'}`} />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                     ${d.paymentStatus === 'UNPAID' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}
                  >
                    <AlertCircle size={28} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border
                     ${d.paymentStatus === 'UNPAID' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {d.paymentStatus === 'UNPAID' ? 'Dette Totale' : 'Partiel'}
                  </span>
                </div>

                <div className="relative z-10">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors truncate">
                    {d.firstName} {d.lastName}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-[0.15em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {d.session?.title || d.level}
                  </p>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recouvrement</span>
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${d.paymentStatus === 'UNPAID' ? 'bg-red-500' : 'bg-orange-500'}`}
                    />
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 mb-8 relative z-10">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Reste à payer</p>
                  <p className="text-3xl font-black text-red-600 tracking-tighter">{reste.toLocaleString()} <span className="text-sm opacity-60">F</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button
                    onClick={() => handleSendSingleReminder(d.id)}
                    disabled={sending}
                    className="flex items-center justify-center gap-2 py-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                  >
                    <Mail size={16} /> Relance
                  </button>
                  <Link
                    href={`/admin/candidates?id=${d.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/20"
                  >
                    Dossier <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. CATÉGORIES & TARIFS
// ==========================================
const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const [editingPricing, setEditingPricing] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({ code: "", category: "MODULE", label: "", price: 0, level: "" });

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/accounting/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) { toast.error("Erreur catégories"); }
  }, []);

  const loadPricings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricings(await res.json());
    } catch (e) { toast.error("Erreur tarifs"); }
  }, []);

  useEffect(() => {
    loadCategories();
    loadPricings();
  }, [loadCategories, loadPricings]);

  const handleUpdatePrice = async (e, id) => {
    e.preventDefault();
    const p = pricings.find(x => x.id === id);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      if (res.ok) { toast.success("Tarif à jour"); setEditingPricing(null); }
    } catch (e) { toast.error("Erreur"); }
    finally { setLoading(false); }
  };

  const deletePricing = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Supprimé"); loadPricings(); }
    } catch (e) { }
  };

  const saveNewPricing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingForm)
      });
      if (res.ok) { toast.success("Créé"); loadPricings(); setIsPricingModalOpen(false); }
    } catch (e) { }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-10">
      {/* SECT 1: Grille Tarifaire */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">Architecture Tarifaire</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Configuration des coûts affichés sur le portail</p>
          </div>
          <button onClick={() => setIsPricingModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
            <Plus size={20} /> Nouvel Article
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="pb-6 px-4">Identifiant</th>
                <th className="pb-6 px-4">Catégorie</th>
                <th className="pb-6 px-4">Désignation</th>
                <th className="pb-6 px-4 text-right">Tarif (FCFA)</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
              {pricings.map(p => (
                <tr key={p.id} className="group hover:bg-amber-50/20 transition-all duration-300">
                  <td className="py-6 px-4">
                    {editingPricing === p.id ? (
                      <input
                        type="text"
                        value={p.code}
                        onChange={e => setPricings(pricings.map(x => x.id === p.id ? { ...x, code: e.target.value.toUpperCase() } : x))}
                        className="w-32 px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-xs font-mono font-black ring-4 ring-amber-50"
                      />
                    ) : (
                      <span className="text-xs font-mono text-gray-400 font-bold">{p.code}</span>
                    )}
                  </td>
                  <td className="py-6 px-4">
                    <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-xl text-[9px] font-black tracking-widest uppercase border border-amber-100 dark:border-amber-900/20">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-100">{p.label}</p>
                      {p.level && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">{p.level}</span>}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-right">
                    {editingPricing === p.id ? (
                      <input
                        type="number"
                        value={p.price}
                        onChange={e => setPricings(pricings.map(x => x.id === p.id ? { ...x, price: parseInt(e.target.value) || 0 } : x))}
                        className="w-36 px-4 py-2.5 text-right bg-white border border-amber-200 rounded-xl text-sm font-black ring-4 ring-amber-50"
                      />
                    ) : (
                      <span className="text-base font-black text-gray-900 dark:text-white">{p.price.toLocaleString()} <span className="text-xs opacity-40">F</span></span>
                    )}
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex justify-end gap-3">
                      {editingPricing === p.id ? (
                        <button onClick={(e) => handleUpdatePrice(e, p.id)} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-transform active:scale-90">
                          <Save size={18} />
                        </button>
                      ) : (
                        <button onClick={() => setEditingPricing(p.id)} className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all">
                          <Edit2 size={18} />
                        </button>
                      )}
                      <button onClick={() => deletePricing(p.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsPricingModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white dark:bg-[#1E1E1E] rounded-[3rem] shadow-2xl p-10 w-full max-w-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Plus size={28} />
                </div>
                Nouvel Article Tarifaire
              </h3>

              <form onSubmit={saveNewPricing} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant Code</label>
                    <input required type="text" placeholder="EX: MAT_ALLEMAND" value={pricingForm.code} onChange={e => setPricingForm({ ...pricingForm, code: e.target.value.toUpperCase() })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-mono text-xs font-black uppercase tracking-widest" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
                    <select required value={pricingForm.category} onChange={e => setPricingForm({ ...pricingForm, category: e.target.value })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-black text-xs uppercase tracking-tighter">
                      <option value="MODULE">Examens (A1-C2)</option>
                      <option value="PREP_COURSE">Cours de langue</option>
                      <option value="LEVEL">Frais fixes / Inscription</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Libellé complet d'affichage</label>
                  <input required type="text" placeholder="Ex: Frais de Bibliothèque & CD" value={pricingForm.label} onChange={e => setPricingForm({ ...pricingForm, label: e.target.value })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix unitaire (FCFA)</label>
                    <input required type="number" min="0" value={pricingForm.price} onChange={e => setPricingForm({ ...pricingForm, price: parseInt(e.target.value) || 0 })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none text-amber-600 font-black text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Niveau Cible</label>
                    <input type="text" placeholder="Ex: B1 (Optionnel)" value={pricingForm.level} onChange={e => setPricingForm({ ...pricingForm, level: e.target.value.toUpperCase() })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-black text-sm uppercase" />
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsPricingModalOpen(false)} className="flex-1 px-8 py-5 bg-gray-100 dark:bg-[#121212] text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Annuler</button>
                  <button type="submit" disabled={loading} className="flex-[2] px-8 py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                    {loading ? "Création..." : "Enregistrer l'article"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AccountingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/accounting/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) { }
    finally { setLoadingStats(false); }
  };

  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ACCOUNTANT") {
    return (
      <div className="p-10 text-center bg-red-50 dark:bg-red-900/10 rounded-[3rem] text-red-600 mt-8 border border-red-100 dark:border-red-900/20 max-w-2xl mx-auto shadow-2xl shadow-red-900/5">
        <XCircle size={64} className="mx-auto mb-6 opacity-30" />
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Accès Restreint</h2>
        <p className="font-medium text-red-500/80">Vous devez être identifié comme Comptable ou Administrateur pour accéder à l'interface financière.</p>
        <button onClick={() => window.location.href = '/admin/dashboard'} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/30">Retour au Tableau de Bord</button>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Vue d'ensemble", icon: TrendingUp },
    { id: "cashier", label: "Caisse & Vente", icon: Wallet },
    { id: "history", label: "Historique", icon: History },
    { id: "reminders", label: "Relances", icon: Bell },
    { id: "categories", label: "Grille Tarifaire", icon: Tags },
  ];

  return (
    <div className="space-y-10 pb-24">
      {/* Page Title & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#003366] dark:text-white leading-tight tracking-tighter">Comptabilité</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-3 h-[2px] bg-[#D4AF37]" />
            Gestion Financière SMD
          </p>
        </div>
        <div className="flex gap-2 p-2 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl shadow-blue-900/5 overflow-x-auto w-full lg:w-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${activeTab === tab.id
                  ? "bg-[#003366] text-white shadow-2xl shadow-blue-900/30"
                  : "text-gray-400 hover:text-[#003366] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.id ? 3 : 2.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "circOut" }}
        >
          {activeTab === "dashboard" && <StatsDashboard stats={stats} />}
          {activeTab === "cashier" && <CashierTab onPaymentRecorded={fetchStats} />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "reminders" && <RemindersTab />}
          {activeTab === "categories" && <CategoriesTab />}
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
