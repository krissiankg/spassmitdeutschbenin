"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tags, Plus, Edit2, Trash2, Save, Tags as PricingIcon,
  Search, Filter, ChevronRight, GraduationCap, Banknote
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function PricingPage() {
  const { data: session } = useSession();
  const [pricings, setPricings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [editingPricing, setEditingPricing] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({ code: "", category: "MODULE", label: "", price: 0, level: "" });

  const loadPricings = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricings(await res.json());
    } catch (e) { 
      toast.error("Erreur lors du chargement des tarifs"); 
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/accounting/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadPricings();
    loadCategories();
  }, [loadPricings, loadCategories]);

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
      if (res.ok) { 
        toast.success("Tarif mis à jour avec succès"); 
        setEditingPricing(null); 
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (e) { 
      toast.error("Erreur réseau"); 
    } finally {
      setLoading(false);
    }
  };

  const deletePricing = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce tarif ? Cette action peut impacter les formulaires d'inscription.")) return;
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) { 
        toast.success("Tarif supprimé"); 
        loadPricings(); 
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (e) {
      toast.error("Erreur réseau");
    }
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
      if (res.ok) { 
        toast.success("Nouvel article tarifaire créé"); 
        loadPricings(); 
        setIsPricingModalOpen(false); 
        setPricingForm({ code: "", category: "MODULE", label: "", price: 0, level: "" });
      } else {
        toast.error("Erreur lors de la création");
      }
    } catch (e) { 
      toast.error("Erreur réseau"); 
    } finally {
      setLoading(false);
    }
  };

  const filteredPricings = pricings.filter(p => 
    p.label.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.level && p.level.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#003366] dark:text-white leading-tight tracking-tighter">Tarifs des Examens</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-3 h-[2px] bg-[#D4AF37]" />
            Configuration des coûts ÖSD & Services
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un tarif..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-4 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl w-full sm:w-64 shadow-xl shadow-blue-900/5 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-sm"
            />
          </div>
          <button 
            onClick={() => setIsPricingModalOpen(true)} 
            className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Plus size={20} /> Nouvel Article
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 lg:p-10 shadow-xl shadow-blue-900/5"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="pb-6 px-4">Code / Identifiant</th>
                <th className="pb-6 px-4">Catégorie</th>
                <th className="pb-6 px-4">Désignation</th>
                <th className="pb-6 px-4 text-right">Tarif (FCFA)</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
              {filteredPricings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    {loading ? "Chargement des données..." : "Aucun tarif trouvé"}
                  </td>
                </tr>
              ) : (
                filteredPricings.map(p => (
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
                        <span className="text-xs font-mono text-gray-400 font-bold bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">{p.code}</span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Info Card */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white dark:bg-[#1E1E1E] rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shrink-0">
          <Banknote size={32} />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-lg font-black text-[#003366] dark:text-blue-400 uppercase tracking-tight">Impact sur le Formulaire d&apos;Inscription</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Toute modification effectuée sur cette page est répercutée en temps réel sur les formulaires d&apos;inscription **ÖSD** et **Simple**. 
            Assurez-vous de vérifier les codes d&apos;identifiants avant de les modifier.
          </p>
        </div>
      </div>

      {/* Creation Modal */}
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
                      <option value="MODULE">Examens (Modules)</option>
                      <option value="LEVEL">Niveaux d&apos;Examen (Complet)</option>
                      <option value="PREP_COURSE">Cours / Formations</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Libellé d&apos;affichage</label>
                  <input required type="text" placeholder="Ex: Frais de Bibliothèque" value={pricingForm.label} onChange={e => setPricingForm({ ...pricingForm, label: e.target.value })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix (FCFA)</label>
                    <input required type="number" min="0" value={pricingForm.price} onChange={e => setPricingForm({ ...pricingForm, price: parseInt(e.target.value) || 0 })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none text-amber-600 font-black text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Niveau Cible</label>
                    <input type="text" placeholder="Ex: B1" value={pricingForm.level} onChange={e => setPricingForm({ ...pricingForm, level: e.target.value.toUpperCase() })} className="w-full px-5 py-4 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-black text-sm uppercase" />
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsPricingModalOpen(false)} className="flex-1 px-8 py-5 bg-gray-100 dark:bg-[#121212] text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Annuler</button>
                  <button type="submit" disabled={loading} className="flex-[2] px-8 py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                    {loading ? "Création..." : "Enregistrer le tarif"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
