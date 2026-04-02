"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, Check, X, AlertTriangle, Settings2, ExternalLink, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export default function FormBuilderPage() {
  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState({ isOpen: true, closingMessage: "", activeSessions: [] });
  const [loading, setLoading] = useState(true);
  
  const [dbSessions, setDbSessions] = useState([]);
  const [dbPricings, setDbPricings] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortalModal, setIsPortalModal] = useState(false);
  const [isConfigModal, setIsConfigModal] = useState(false);
  const [configType, setConfigType] = useState(null); // 'SESSIONS' ou 'PRICINGS'
  
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({ label: "", type: "TEXT", required: false, options: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/form-builder");
      if (res.ok) {
        const data = await res.json();
        setSettings({
            isOpen: data.settings.isOpen,
            closingMessage: data.settings.closingMessage,
            activeSessions: data.settings.activeSessions || []
        });
        setFields(data.fields);
        setDbSessions(data.sessionsData || []);
        setDbPricings(data.pricingsData || []);
      }
    } catch(e) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const savePortalSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/form-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_PORTAL", payload: { isOpen: settings.isOpen, closingMessage: settings.closingMessage, activeSessions: settings.activeSessions } })
      });
      if (res.ok) {
        toast.success("Paramètres d'accès sauvegardés !");
        setIsPortalModal(false);
      }
    } catch(e) { toast.error("Erreur réseau"); }
  };

  const toggleSessionActive = async (sessionId) => {
    const list = settings.activeSessions || [];
    const newList = list.includes(sessionId) ? list.filter(id => id !== sessionId) : [...list, sessionId];
    setSettings({...settings, activeSessions: newList});
    
    // Auto-save
    await fetch("/api/admin/form-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_PORTAL", payload: { isOpen: settings.isOpen, closingMessage: settings.closingMessage, activeSessions: newList } })
    });
  };

  const togglePricingActive = async (pricing) => {
    const newStatus = !pricing.isActive;
    try {
        const res = await fetch("/api/admin/form-builder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "TOGGLE_PRICING", payload: { pricingId: pricing.id, isActive: newStatus } })
        });
        if(res.ok) {
            setDbPricings(dbPricings.map(p => p.id === pricing.id ? {...p, isActive: newStatus} : p));
        }
    } catch(e) {}
  };

  const openModal = (f = null) => {
    if (f) {
      setEditingField(f.id);
      setFieldForm({ label: f.label, type: f.type, required: f.required, options: f.options.join(", ") });
    } else {
      setEditingField(null);
      setFieldForm({ label: "", type: "TEXT", required: false, options: "" });
    }
    setIsModalOpen(true);
  };

  const saveField = async (e) => {
    e.preventDefault();
    const action = editingField ? "UPDATE_FIELD" : "ADD_FIELD";
    const payload = {
      id: editingField,
      label: fieldForm.label,
      type: fieldForm.type,
      required: fieldForm.required,
      options: fieldForm.type === 'SELECT' ? fieldForm.options.split(',').map(s => s.trim()).filter(Boolean) : [],
      order: fields.length
    };

    try {
      const res = await fetch("/api/admin/form-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload })
      });
      if (res.ok) {
        toast.success("Champ sauvegardé");
        setIsModalOpen(false);
        loadData();
      }
    } catch(e) { toast.error("Erreur réseau"); }
  };

  const deleteField = async (id) => {
    if(!confirm("Supprimer ce champ ?")) return;
    try {
      const res = await fetch("/api/admin/form-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_FIELD", payload: { id } })
      });
      if (res.ok) {
        toast.success("Champ supprimé");
        loadData();
      }
    } catch(e) { toast.error("Erreur réseau"); }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/register`;
    navigator.clipboard.writeText(url);
    toast.success("Lien d'inscription copié !");
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">Formulaire d'Inscription</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Gérez l'ouverture du portail et personnalisez les questions supplémentaires.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all border border-transparent shadow-sm"
              title="Copier le lien public"
            >
              <Copy size={18}/>
            </button>
            <a 
              href="/register" 
              target="_blank"
              onClick={(e) => {
                 if(!settings.isOpen) {
                    e.preventDefault();
                    if(confirm("Le portail est fermé au public. Vous seul pourrez consulter un aperçu simulé. Continuer ?")) {
                       window.open("/register", "_blank");
                    }
                 }
              }}
              className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all shadow-sm border border-transparent"
            >
              <ExternalLink size={18}/> Aperçu
            </a>
            
            <button 
            onClick={() => setIsPortalModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 text-[#003366] dark:text-gray-100 hover:bg-gray-50 dark:bg-[#1E1E1E] transition-all"
            >
            <Settings2 size={18}/> {settings.isOpen ? 'Portail : Actif' : 'Portail : Fermé'}
            </button>
            <button 
            onClick={() => setSettings({...settings, isOpen: !settings.isOpen})}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${settings.isOpen ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'}`}
            >
            {settings.isOpen ? <><X size={18}/> Éteindre</> : <><Check size={18}/> Allumer</>}
            </button>
        </div>
      </div>

      {!settings.isOpen && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-amber-800">Le portail est fermé</h4>
            <p className="text-sm text-amber-700">Les étudiants ne peuvent plus s'inscrire. Le message affiché est : <span className="italic">"{settings.closingMessage}"</span></p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#003366] dark:text-gray-100 flex items-center gap-2">
            <Settings2 size={20}/> Questions Personnalisées Obligatoires
          </h3>
          <button onClick={() => openModal()} className="px-4 py-2 bg-[#003366] text-white rounded-xl text-sm font-bold flex gap-2 hover:bg-[#002244]">
            <Plus size={16}/> Ajouter Champ
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl">
          💡 Ci-dessous vous pouvez visualiser la structure globale de votre formulaire d'inscription. Les champs dotés du badge <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 dark:text-gray-600 px-2 py-0.5 rounded font-bold uppercase mx-1">Système</span> sont inamovibles car nécessaires au bon déroulement des examens.
        </p>

        <div className="space-y-3 mb-8">
           <h4 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Champs Systèmes (Inamovibles)</h4>
           {[
             { label: "1. Identité Officielle (Nom, Prénom, Naissance, Contact)", type: "BLOC SYSTÈME", configurable: false },
             { label: "2. Document d'Identité (N° Pièce, Validité, Pièce jointe)", type: "BLOC SYSTÈME", configurable: false },
             { label: "3. Choix de(s) Session(s) et Niveaux", type: "BLOC SYSTÈME", configurable: true, cType: 'SESSIONS' },
             { label: "4. Sélection des Modules d'Examens et Calcul de Prix", type: "BLOC SYSTÈME", configurable: true, cType: 'PRICINGS' },
           ].map((sys, idx) => (
             <div key={`sys_${idx}`} className={`flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#1A1A1A] rounded-xl border border-gray-100 dark:border-gray-800 ${!sys.configurable ? 'opacity-80 cursor-not-allowed' : ''}`}>
               <div className="flex items-center gap-4">
                 <GripVertical className="text-gray-300 dark:text-gray-600" size={18} />
                 <div>
                   <h4 className="font-bold text-gray-600 dark:text-gray-300 dark:text-gray-600 text-sm">
                     {sys.label} 
                     <span className="ml-2 text-[10px] text-gray-500 dark:text-gray-500 font-bold bg-gray-200 px-2 py-0.5 rounded">SYSTÈME</span>
                   </h4>
                   <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-mono mt-1">Type: {sys.type}</p>
                 </div>
               </div>
               {sys.configurable && (
                   <button onClick={() => { setConfigType(sys.cType); setIsConfigModal(true); }} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-[#003366] dark:text-gray-100 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800/50 flex items-center gap-2">
                       <Settings2 size={14}/> Configurer
                   </button>
               )}
             </div>
           ))}
        </div>

        <h4 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Questions Supplémentaires Personnalisées</h4>

        {fields.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 italic">Aucun champ personnalisé ajouté.</div>
        ) : (
          <div className="space-y-3">
            {fields.map(f => (
              <div key={f.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-gray-800 group">
                <div className="flex items-center gap-4">
                  <GripVertical className="text-gray-300 dark:text-gray-600" size={18} />
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {f.label} 
                      {f.required && <span className="ml-2 text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">* OBLIGATOIRE</span>}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase font-mono mt-1">Type: {f.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(f)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#003366] dark:hover:text-blue-400 "><Edit2 size={16}/></button>
                  <button onClick={() => deleteField(f.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">{editingField ? "Modifier Champ" : "Nouveau Champ"}</h3>
            <form onSubmit={saveField} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Titre de la question</label>
                <input required type="text" value={fieldForm.label} onChange={e => setFieldForm({...fieldForm, label: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1E1E1E] border rounded-xl" placeholder="Ex: Profession" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Type de réponse</label>
                <select value={fieldForm.type} onChange={e => setFieldForm({...fieldForm, type: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1E1E1E] border rounded-xl">
                  <option value="TEXT">Texte libre (Court/Long)</option>
                  <option value="NUMBER">Chiffre uniquement</option>
                  <option value="DATE">Date</option>
                  <option value="SELECT">Menu Déroulant (Choix multiples)</option>
                  <option value="FILE">Téléchargement Fichier (Image/PDF)</option>
                </select>
              </div>
              {fieldForm.type === 'SELECT' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Options (séparées par une virgule)</label>
                  <input required type="text" value={fieldForm.options} onChange={e => setFieldForm({...fieldForm, options: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1E1E1E] border rounded-xl" placeholder="Ex: Étudiant, Cadre, Sans-Emploi" />
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="req" checked={fieldForm.required} onChange={e => setFieldForm({...fieldForm, required: e.target.checked})} className="w-4 h-4 text-[#003366] dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border-gray-300 rounded" />
                <label htmlFor="req" className="text-sm font-bold text-gray-700">Rendre ce champ obligatoire</label>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl text-sm font-bold">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#003366] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PORTAL SETTINGS MODAL */}
      {isPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsPortalModal(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-6">Contrôle du Portail</h3>
            <form onSubmit={savePortalSettings} className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl mb-4 border focus-within:border-[#003366]">
                 <input type="checkbox" id="portalOpen" checked={settings.isOpen} onChange={e => setSettings({...settings, isOpen: e.target.checked})} className="w-5 h-5" />
                 <label htmlFor="portalOpen" className="font-bold text-gray-700 cursor-pointer">Portail d'Inscription Ouvert</label>
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Message de Fermeture / Maintenance</label>
                <textarea rows="3" required value={settings.closingMessage} onChange={e => setSettings({...settings, closingMessage: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1E1E1E] border rounded-xl" placeholder="Message affiché aux étudiants...">
                </textarea>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPortalModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl text-sm font-bold">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTÈMES CONFIG MODAL */}
      {isConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsConfigModal(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-[#003366] dark:text-gray-100 mb-1">
                {configType === 'SESSIONS' ? 'Sessions d\'Examens Proposées' : 'Modules & Tarifs Proposés'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Sélectionnez ce qui doit être disponible sur le formulaire d'inscription public actuellement.</p>
            
            <div className="overflow-y-auto pr-2 space-y-3 flex-1 mb-6">
                {configType === 'SESSIONS' && dbSessions.length === 0 && <p className="text-center text-gray-400 dark:text-gray-500 py-10">Aucune session créée dans le système.</p>}
                {configType === 'SESSIONS' && dbSessions.map(s => {
                    const isSelected = (settings.activeSessions || []).includes(s.id);
                    return (
                        <div key={s.id} onClick={() => toggleSessionActive(s.id)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-[#003366] bg-blue-50/30 dark:bg-blue-900/30' : 'border-transparent bg-gray-50 dark:bg-[#1E1E1E] dark:hover:bg-gray-800'}`}>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{s.title} <span className="text-xs ml-2 text-gray-500 dark:text-gray-500">[{s.level}]</span></h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-[#003366] border-[#003366] text-white' : 'border-gray-300'}`}>
                                {isSelected && <Check size={14}/>}
                            </div>
                        </div>
                    );
                })}

                {configType === 'PRICINGS' && dbPricings.map(p => (
                    <div key={p.id} onClick={() => togglePricingActive(p)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${p.isActive ? 'border-amber-500 bg-amber-50/30' : 'border-transparent bg-gray-50 dark:bg-[#1E1E1E] dark:hover:bg-gray-800'}`}>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{p.label} <span className="text-xs ml-2 text-gray-500 dark:text-gray-500">[{p.category}]</span></h4>
                            <p className="text-xs text-amber-600 font-bold">{p.price.toLocaleString()} FCFA</p>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${p.isActive ? 'bg-amber-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#121212] rounded-full transition-all ${p.isActive ? 'left-[22px]' : 'left-1'}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button onClick={() => setIsConfigModal(false)} className="px-6 py-3 bg-[#003366] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">Terminer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
