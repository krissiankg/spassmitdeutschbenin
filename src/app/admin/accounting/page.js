"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Tags, Bell, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Loader2, Save, Download
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { generateInvoicePDF } from "@/lib/pdf-invoice";
import Pagination from "@/components/Pagination";

// ==========================================
// 1. CAISSE & PAIEMENTS
// ==========================================
const CashierTab = () => {
  const { data: session } = useSession();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "CASH", reference: "" });
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustingAmount, setAdjustingAmount] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

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
    if (page !== 1) setPage(1);
    else loadCandidates();
  }, [search, limit, page, loadCandidates]);

  useEffect(() => {
    loadCandidates();
  }, [page, loadCandidates]);

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
        toast.success("Paiement enregistré avec succès !");
        loadCandidates();
        setSelectedCandidate(null);
      } else {
        const d = await res.json();
        toast.error(d.error || "Erreur lors du paiement");
      }
    } catch (e) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 relative">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Caisse & Encaissements</h3>
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un candidat par nom, N° matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] transition-all text-sm"
          />
        </div>
      </div>
      
      {candidates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Wallet className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={56} />
          <p className="text-gray-500 dark:text-gray-500 font-medium">Recherchez un candidat par nom ou matricule.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-[#121212]">
            <thead className="bg-gray-50 dark:bg-[#1E1E1E]">
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-500">
                <th className="p-4 rounded-tl-xl text-left">Apprenant</th>
                <th className="p-4">Session</th>
                <th className="p-4 text-right">À Payer</th>
                <th className="p-4 text-right">Déjà Payé</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {candidates.map(c => {
                 const total = c.totalAmount || 0;
                 const paid = c.amountPaid || 0;
                 const reste = total - paid;
                 return (
                   <tr key={c.id} className="hover:bg-blue-50/30 dark:bg-blue-900/30 transition-colors">
                     <td className="p-4">
                        <p className="text-sm font-bold text-[#003366] dark:text-gray-100 ">{c.firstName} {c.lastName}</p>
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">{c.candidateNumber}</p>
                     </td>
                     <td className="p-4 text-xs font-medium text-gray-600 dark:text-gray-300 dark:text-gray-600">
                        {c.session ? `${c.session.level} - ${c.session.title}` : '-'}
                     </td>
                     <td className="p-4 flex gap-2 justify-end items-center right">
                        {adjustingId === c.id ? (
                           <div className="flex bg-white dark:bg-[#121212] border border-blue-200 rounded-lg overflow-hidden w-28">
                              <input 
                                type="number" 
                                min="0" 
                                value={adjustingAmount} 
                                onChange={e => setAdjustingAmount(e.target.value)} 
                                className="w-full px-2 py-1 text-sm outline-none font-bold text-[#003366] dark:text-gray-100 "
                              />
                              <button disabled={loading} onClick={() => handleUpdateTotal(c.id)} className="bg-blue-100 dark:bg-blue-900/30 px-2 text-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/50"><CheckCircle size={14}/></button>
                           </div>
                        ) : (
                           <div className="group flex items-center justify-end gap-2 font-medium text-gray-800 dark:text-gray-200">
                             {total.toLocaleString()} F
                             <button onClick={() => { setAdjustingId(c.id); setAdjustingAmount(total); }} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Edit2 size={12}/>
                             </button>
                           </div>
                        )}
                     </td>
                     <td className="p-4 text-right font-medium text-green-600">{paid.toLocaleString()} F</td>
                     <td className="p-4 text-center">
                        {c.paymentStatus === 'PAID' && <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">SOLDÉ</span>}
                        {c.paymentStatus === 'PARTIAL' && <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">PARTIEL</span>}
                        {c.paymentStatus === 'UNPAID' && <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">IMPAYÉ</span>}
                     </td>
                     <td className="p-4 flex gap-2 justify-end items-center">
                        {reste > 0 ? (
                          <button 
                            onClick={() => {
                              setSelectedCandidate(c);
                              setPaymentForm({ amount: reste, method: "CASH", reference: "" });
                            }} 
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold shadow-md shadow-green-500/20"
                          >
                            Encaisser
                          </button>
                        ) : null}
                        
                        {(c.paymentStatus === "PAID" || paid > 0) && (
                          <button 
                            onClick={() => generateInvoicePDF(c, session?.user)}
                            title="Télécharger Facture PDF"
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-100"
                          >
                            <Download size={14} /> Reçu
                          </button>
                        )}
                        {reste <= 0 && paid === 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Terminé</span>
                        )}
                     </td>
                   </tr>
                 );
              })}
            </tbody>
          </table>

          <Pagination 
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
            loading={loading}
          />
        </div>
      )}

      {/* MODAL ENCAISSEMENT */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-1">Enregistrer un Paiement</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Pour {selectedCandidate.firstName} {selectedCandidate.lastName}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Reste à payer</p>
                 <p className="text-2xl font-black text-orange-500">{(selectedCandidate.totalAmount - selectedCandidate.amountPaid).toLocaleString()} F</p>
               </div>
             </div>

             <form onSubmit={handlePayment} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Montant perçu (FCFA)</label>
                  <input required min="100" type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-4 py-3 bg-green-50 border border-green-200 text-green-800 font-bold text-lg rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Moyen de paiement</label>
                    <select required value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none">
                      <option value="CASH">Espèces</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="BANK_TRANSFER">Virement Bancaire</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Référence (Optionnel)</label>
                     <input type="text" placeholder="N° Transaction" value={paymentForm.reference} onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                  <button type="button" onClick={() => setSelectedCandidate(null)} className="px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl dark:hover:bg-gray-800 transition-colors">Annuler</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20">{loading ? "Validation..." : "Valider Enregistrement"}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. CATÉGORIES & TARIFS
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
    } catch (e) { toast.error("Erreur chargement catégories"); }
  }, []);

  const loadPricings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricings(await res.json());
    } catch (e) { toast.error("Erreur chargement tarifs"); }
  }, []);

  useEffect(() => {
    loadCategories();
    loadPricings();
  }, [loadCategories, loadPricings]);

  // Gestion Catégories
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatForm({ name: cat.name, description: cat.description || "" });
    } else {
      setEditingCatId(null);
      setCatForm({ name: "", description: "" });
    }
    setIsCatModalOpen(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingCatId ? "PUT" : "POST";
    const body = editingCatId ? { id: editingCatId, ...catForm } : catForm;
    
    try {
      const res = await fetch("/api/admin/accounting/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success("Catégorie enregistrée !");
        loadCategories();
        setIsCatModalOpen(false);
      } else {
         const data = await res.json();
         toast.error(data.error || "Erreur d'enregistrement");
      }
    } catch(err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Voulez-vous supprimer cette catégorie ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Catégorie supprimée");
        loadCategories();
      } else { toast.error("Erreur suppression"); }
    } catch(err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  // Gestion Grille Tarifaire
  const handleUpdatePrice = async (e, id) => {
    e.preventDefault();
    const p = pricings.find(x => x.id === id);
    if (!p) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, price: p.price, label: p.label, category: p.category, code: p.code, level: p.level })
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

  const deletePricing = async (id) => {
    if(!confirm("Voulez-vous supprimer cet article tarifaire ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Article supprimé");
        loadPricings();
      } else { toast.error("Erreur suppression"); }
    } catch(err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const openPricingModal = () => {
    setPricingForm({ code: "", category: "MODULE", label: "", price: 0, level: "" });
    setIsPricingModalOpen(true);
  };

  const saveNewPricing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...pricingForm, code: pricingForm.code.toUpperCase()})
      });
      if (res.ok) {
        toast.success("Article créé avec succès");
        loadPricings();
        setIsPricingModalOpen(false);
      } else { toast.error("Erreur de création"); }
    } catch(err) { toast.error("Erreur réseau"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      {/* SECT 1: Catégories Personnalisées */}
      <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Catégories de Facturation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500">Créez et gérez vos nouvelles catégories (ex: Frais de dossiers, Matériel...)</p>
          </div>
          <button onClick={() => openCatModal()} className="flex items-center gap-2 px-5 py-2.5 bg-[#003366] text-white rounded-xl hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold">
            <Plus size={18} /> Nouvelle Catégorie
          </button>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <Tags className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={40} />
            <p className="text-gray-500 dark:text-gray-500 text-sm">Aucune catégorie personnalisée, cliquez sur ajouter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md transition-shadow bg-gray-50/30 dark:bg-[#1A1A1A] group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#003366] dark:text-gray-100 ">{cat.name}</h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => openCatModal(cat)} className="text-blue-500 hover:text-blue-700"><Edit2 size={14}/></button>
                    <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{cat.description || "Aucune description"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECT 2: Grille Tarifaire (E-commerce) */}
      <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Grille Tarifaire (E-commerce & Standard)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500">Gérez les prix affichés sur le portail et modifiez leur catégorie d&apos;appartenance.</p>
          </div>
          <button onClick={openPricingModal} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 text-sm font-bold">
            <Plus size={18} /> Ajouter Tarif
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-[#121212]">
            <thead className="bg-gray-50 dark:bg-[#1E1E1E]">
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-500">
                <th className="p-4">Identifiant Technique</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Libellé d&apos;affichage</th>
                <th className="p-4 text-right">Prix (FCFA)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {pricings.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 dark:bg-blue-900/30 transition-colors group">
                  <td className="p-4">
                    {editingPricing === p.id ? (
                      <input 
                        type="text" 
                        value={p.code}
                        onChange={e => setPricings(pricings.map(x => x.id === p.id ? {...x, code: e.target.value} : x))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono focus:ring-1 outline-none"
                      />
                    ) : (
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{p.code}</span>
                    )}
                  </td>
                  
                  {/* UPDATE CATEGORY */}
                  <td className="p-4">
                    {editingPricing === p.id ? (
                      <select 
                        value={p.category}
                        onChange={e => setPricings(pricings.map(x => x.id === p.id ? {...x, category: e.target.value} : x))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-[#003366] dark:text-gray-100 focus:ring-1 outline-none mb-1"
                      >
                        <option value="MODULE">Modules d&apos;examen</option>
                        <option value="PREP_COURSE">Cours Préparatoires</option>
                        <option value="LEVEL">Niveau (Frais Généraux)</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px] tracking-wide inline-block">
                        {p.category}
                      </span>
                    )}
                  </td>
                  
                  {/* UPDATE LABEL */}
                  <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {editingPricing === p.id ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Niveau (ex: B1)"
                            value={p.level || ""}
                            onChange={e => setPricings(pricings.map(x => x.id === p.id ? {...x, level: e.target.value} : x))}
                            className="w-16 px-2 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:ring-1 outline-none"
                          />
                          <input 
                            type="text" 
                            value={p.label}
                            onChange={e => setPricings(pricings.map(x => x.id === p.id ? {...x, label: e.target.value} : x))}
                            className="w-full px-2 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 outline-none"
                          />
                        </div>
                    ) : (
                      <div className="flex items-center gap-2">
                         {p.level && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded text-[9px]">{p.level}</span>}
                         {p.label}
                      </div>
                    )}
                  </td>
                  
                  {/* UPDATE PRICE */}
                  <td className="p-4 text-right">
                    {editingPricing === p.id ? (
                      <div className="flex justify-end">
                        <input 
                          type="number" 
                          value={p.price}
                          onChange={e => setPricings(pricings.map(x => x.id === p.id ? {...x, price: parseInt(e.target.value) || 0} : x))}
                          className="w-28 px-2 py-1.5 text-right bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-[#003366] dark:text-gray-100 focus:ring-1 outline-none"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-[#003366] dark:text-gray-100 text-sm">{p.price.toLocaleString()} F</span>
                    )}
                  </td>
                  
                  <td className="p-4 flex gap-1 justify-end">
                    {editingPricing === p.id ? (
                      <button onClick={(e) => handleUpdatePrice(e, p.id)} disabled={loading} className="px-4 py-1.5 bg-[#003366] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#002244]">
                        {loading ? "..." : "Sauver"}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setEditingPricing(p.id)} className="p-2 text-gray-300 dark:text-gray-600 group-hover:text-blue-600 bg-transparent rounded-lg hover:bg-blue-50 dark:bg-blue-900/20 transition-colors">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => deletePricing(p.id)} className="p-2 text-gray-300 dark:text-gray-600 group-hover:text-red-600 bg-transparent rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création de Catégorie */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">{editingCatId ? "Modifier Catégorie" : "Nouvelle Catégorie"}</h3>
             <form onSubmit={saveCategory} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Nom de la catégorie</label>
                  <input required type="text" placeholder="Ex: Frais d'hébergement" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Description (Optionnel)</label>
                  <textarea rows={3} placeholder="Ex: Frais pour logement étudiant" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl dark:hover:bg-gray-800 transition-colors">Annuler</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-[#003366] rounded-xl hover:bg-[#002244] shadow-lg shadow-blue-900/20">{loading ? "Enregistrement..." : "Créer"}</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal Création de Tarif */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsPricingModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 w-full flex items-center gap-3"><Plus className="text-amber-500" /> Ajouter un Nouvel Article</h3>
             <form onSubmit={saveNewPricing} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Identifiant Technique</label>
                  <input required type="text" placeholder="Ex: FRAIS_DIVERS" value={pricingForm.code} onChange={e => setPricingForm({...pricingForm, code: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none uppercase font-mono text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Catégorie</label>
                  <select required value={pricingForm.category} onChange={e => setPricingForm({...pricingForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="MODULE">Modules d&apos;examen</option>
                    <option value="PREP_COURSE">Cours Préparatoires</option>
                    <option value="LEVEL">Niveau (Frais Généraux)</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Libellé d&apos;affichage</label>
                  <input required type="text" placeholder="Ex: Frais de Bibliothèque" value={pricingForm.label} onChange={e => setPricingForm({...pricingForm, label: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Prix (FCFA)</label>
                    <input required type="number" min="0" value={pricingForm.price} onChange={e => setPricingForm({...pricingForm, price: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-amber-600 font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Niveau (Optionnel)</label>
                    <input type="text" placeholder="Ex: B1" value={pricingForm.level} onChange={e => setPricingForm({...pricingForm, level: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPricingModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl dark:hover:bg-gray-800 transition-colors">Annuler</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20">{loading ? "Enregistrement..." : "Créer l&apos;article"}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. RELANCES
// ==========================================
const RemindersTab = () => {
  return (
    <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Candidats avec Impayés</h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">Liste des apprenants dont le compte affiche &quot;Non Payé&quot; ou &quot;Partiel&quot;.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-sm font-bold">
          <Bell size={18} /> Relance Collective Email
        </button>
      </div>
      
      <div className="text-center py-16 bg-orange-50/50 rounded-2xl border border-dashed border-orange-100">
        <AlertCircle className="mx-auto mb-4 text-orange-300" size={56} />
        <p className="text-orange-800 font-medium">Branchement en cours avec le module Caisse...</p>
      </div>
    </div>
  );
};


export default function AccountingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("categories"); // On met Categories par défaut pour afficher la grille
  
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ACCOUNTANT") {
    return (
      <div className="p-10 text-center bg-red-50 rounded-3xl text-red-600 mt-8 border border-red-100 max-w-2xl mx-auto">
        <XCircle size={64} className="mx-auto mb-6 opacity-30 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Accès Comptabilité Refusé</h2>
        <p className="text-red-500/80">Vous devez être connecté avec un compte Administrateur ou Comptable pour accéder à ces données sensibles.</p>
      </div>
    );
  }

  const tabs = [
    { id: "cashier", label: "Caisse & Paiements", icon: Wallet },
    { id: "categories", label: "Catégories & Tarifs", icon: Tags },
    { id: "reminders", label: "Relances Impayés", icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">Comptabilité Globale</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Plateforme de saisie centralisée des frais et encaissements.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-x-auto shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm transition-all ${
              activeTab === tab.id
                ? "bg-[#003366] text-white font-bold shadow-md shadow-blue-900/10"
                : "text-gray-500 dark:text-gray-500 font-medium hover:text-[#003366] dark:hover:text-blue-400 hover:bg-blue-50/50 dark:bg-blue-900/20"
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "cashier" && <CashierTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "reminders" && <RemindersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
