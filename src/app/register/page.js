"use client";
import React, { useState, useEffect } from "react";
import { Upload, CheckCircle, Loader2, User, Phone, Calendar, Check, ShieldCheck, Mail, CreditCard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pricings, setPricings] = useState([]);
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formSettings, setFormSettings] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [customFiles, setCustomFiles] = useState({});

  // Form States
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", gender: "", dateOfBirth: "", birthPlace: "", country: "",
    idType: "", idNumber: "", idIssueDate: "", idExpiryDate: "",
    phone: "", email: "", sessionId: "",
  });
  
  const [file, setFile] = useState(null);
  
  // E-commerce states
  const [selectedLevels, setSelectedLevels] = useState([]); 
  const [selectedModules, setSelectedModules] = useState([]); 
  const [selectedPrepCourses, setSelectedPrepCourses] = useState([]);

  useEffect(() => {
    async function fetchFormConfig() {
      try {
        const res = await fetch("/api/form-settings");
        if (res.ok) {
          const config = await res.json();
          setFormSettings(config.settings);
          setCustomFields(config.fields);
          setSessions(config.activeSessions || []);
          setPricings(config.activePricings || []);
          
          // Init custom data
          const initData = {};
          config.fields.forEach(f => { initData[f.id] = ""; });
          setCustomData(initData);
        }
      } catch(e) { console.error(e); }
    }
    fetchFormConfig();
  }, []);

  // Compute Total Price on the fly
  useEffect(() => {
    let total = 0;
    selectedModules.forEach(mCode => {
      const p = pricings.find(x => x.code === mCode);
      if (p) total += p.price;
    });
    selectedPrepCourses.forEach(cCode => {
      const p = pricings.find(x => x.code === cCode);
      if (p) total += p.price;
    });
    setTotalPrice(total);
  }, [selectedModules, selectedPrepCourses, pricings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomChange = (id, value) => {
    setCustomData({ ...customData, [id]: value });
  };

  const handleCustomFileChange = (id, file) => {
    if (file && file.size > 5 * 1024 * 1024) return toast.error("La taille maximale est de 5Mo");
    setCustomFiles({ ...customFiles, [id]: file });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 5 * 1024 * 1024) return toast.error("La taille maximale est de 5Mo");
      setFile(f);
    }
  };

  // Toggle helpers
  const toggleLevel = (levelStr) => {
    const isEditing = selectedLevels.includes(levelStr);
    if (isEditing) {
       setSelectedLevels(selectedLevels.filter(x => x !== levelStr));
       const toRemove = pricings.filter(p => p.level === levelStr && p.category === 'MODULE').map(p => p.code);
       setSelectedModules(selectedModules.filter(m => !toRemove.includes(m)));
    } else {
       setSelectedLevels([...selectedLevels, levelStr]);
       // Auto-check ses modules
       const toAdd = pricings.filter(p => p.level === levelStr && p.category === 'MODULE').map(p => p.code);
       setSelectedModules(prev => Array.from(new Set([...prev, ...toAdd])));
    }
  };

  const toggleModule = (code) => setSelectedModules(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
  const togglePrepCourse = (code) => setSelectedPrepCourses(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.sessionId) {
       return toast.error("Veuillez remplir les champs obligatoires (*)");
    }
    if (selectedLevels.length === 0) {
       return toast.error("Veuillez choisir au moins un niveau d'examen");
    }
    if (selectedModules.length === 0) {
       return toast.error("Veuillez choisir au moins un module à passer");
    }
    if (!file) {
       return toast.error("Veuillez importer votre pièce d'identité");
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key] || ""));
    data.append("document", file);
    data.append("selectedLevels", JSON.stringify(selectedLevels));
    data.append("selectedModules", JSON.stringify(selectedModules));
    data.append("selectedPrepCourses", JSON.stringify(selectedPrepCourses));
    data.append("customData", JSON.stringify(customData));

    // Append custom files
    Object.keys(customFiles).forEach(id => {
       if (customFiles[id]) data.append(`customFile_${id}`, customFiles[id]);
    });

    try {
      const res = await fetch("/api/register", { method: "POST", body: data });
      if (res.ok) {
         setSuccess(true);
      } else {
         const err = await res.json();
         toast.error(err.error || "Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#003366] mb-4">Pré-inscription Réussie !</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Votre dossier a été soumis avec succès.
          </p>
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8">
             <h3 className="font-bold text-amber-800 text-lg mb-2">Montant à régler : {totalPrice.toLocaleString()} FCFA</h3>
             <p className="text-sm text-amber-700">
               Veuillez passer au secrétariat dans le plus bref délai pour payer et solder votre inscription. 
               Votre dossier ne sera officiellement validé qu&apos;après paiement.
             </p>
          </div>
          <button onClick={() => window.location.href="/"} className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors text-lg">Retour à l&apos;accueil</button>
        </motion.div>
      </div>
    );
  }

  // Extract categorised pricings
  const levelPricings = pricings.filter(p => p.category === 'LEVEL');
  const prepPricings = pricings.filter(p => p.category === 'PREP_COURSE');

  if (formSettings && !formSettings.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#003366] mb-4">Inscriptions Fermées</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {formSettings.closingMessage}
          </p>
          <Link href="/" className="inline-block bg-[#003366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#002244] transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <Link href="/">
            <img src="/logo.png" alt="Spass mit Deutsch Benin" className="h-20 mx-auto object-contain mb-8 hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-4xl font-extrabold text-[#003366] tracking-tight mb-3">Formulaire de préinscription ÖSD</h1>
          <p className="text-gray-500 text-lg">Renseignez votre dossier et construisez votre panier d&apos;examen.</p>
        </div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 space-y-10"
          onSubmit={handleSubmit}
        >
          {/* SECTION 1: Identité */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2 border-b border-gray-100 pb-4"><User className="text-[#D4AF37]" /> 1. Identité Officielle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Prénom(s) *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none transition-all placeholder:text-gray-300" placeholder="Jean Luc" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nom de famille *</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none transition-all placeholder:text-gray-300" placeholder="Dupont" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Sexe *</label>
                <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none">
                  <option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Date de naissance *</label>
                <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Lieu de naissance *</label>
                <input required type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none placeholder:text-gray-300" placeholder="Cotonou" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Pays de résidence/naissance *</label>
                <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none placeholder:text-gray-300" placeholder="Bénin" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Téléphone / WhatsApp *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none placeholder:text-gray-300" placeholder="+229 00000000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none placeholder:text-gray-300" placeholder="exemple@mail.com" />
              </div>
            </div>
          </div>

          {/* SECTION 2: Pièce d'Identité */}
          <div className="space-y-6 pt-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2 mb-4"><ShieldCheck className="text-[#D4AF37]" size={20}/> 2. Document d&apos;Identité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nature de la pièce *</label>
                <select required name="idType" value={formData.idType} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none">
                  <option value="">Sélectionner</option><option value="CIP">CIP</option><option value="CNI">CNI</option><option value="PASSPORT">Passeport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Numéro de pièce (Exact) *</label>
                <input required type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Date de création *</label>
                <input type="date" required name="idIssueDate" value={formData.idIssueDate} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Date d&apos;expiration *</label>
                <input type="date" required name="idExpiryDate" value={formData.idExpiryDate} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-3">Scanner la Pièce d&apos;Identité (Max 5Mo) *</label>
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'}`}>
                  <input required type="file" accept="image/jpeg, image/png, application/pdf" id="id-upload" className="hidden" onChange={handleFileChange} />
                  <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    {file ? (
                      <><CheckCircle className="text-green-500 mb-2" size={32} /><p className="font-bold text-green-700">{file.name}</p></>
                    ) : (
                      <><Upload className="text-[#003366] mb-3" size={32} /><p className="font-bold text-lg text-[#003366]">Cliquer pour uploader un fichier</p></>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2.5: Questions Dynamiques */}
          {customFields.length > 0 && (
            <div className="space-y-6 pt-6 bg-blue-50/20 p-6 rounded-2xl border border-blue-50">
              <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2 mb-4"><ShieldCheck className="text-[#D4AF37]" size={20}/> Informations Complémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFields.map(f => (
                  <div key={f.id} className={f.type === 'TEXT' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{f.label} {f.required ? '*' : ''}</label>
                    {f.type === 'TEXT' && (
                      <input type="text" required={f.required} value={customData[f.id] || ''} onChange={(e) => handleCustomChange(f.id, e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
                    )}
                    {f.type === 'NUMBER' && (
                      <input type="number" required={f.required} value={customData[f.id] || ''} onChange={(e) => handleCustomChange(f.id, e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
                    )}
                    {f.type === 'DATE' && (
                      <input type="date" required={f.required} value={customData[f.id] || ''} onChange={(e) => handleCustomChange(f.id, e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
                    )}
                    {f.type === 'SELECT' && (
                      <select required={f.required} value={customData[f.id] || ''} onChange={(e) => handleCustomChange(f.id, e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none">
                        <option value="">Sélectionner</option>
                        {f.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {f.type === 'FILE' && (
                      <input type="file" accept=".pdf,image/*" required={f.required} onChange={(e) => handleCustomFileChange(f.id, e.target.files[0])} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: E-Commerce / Choix */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2 border-b border-gray-100 pb-4"><Calendar className="text-[#D4AF37]" /> 3. Choix de l&apos;Examen et Modules</h3>
            
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-6">
              <label className="block text-sm font-bold text-[#003366] mb-3">Session Visée *</label>
              <select required name="sessionId" value={formData.sessionId} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none shadow-sm">
                <option value="">Sélectionnez une session d&apos;examen disponible</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({s.level === 'MULTI' ? 'Multi-niveaux' : s.level})</option>)}
              </select>
            </div>

            <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-bold text-gray-600 mb-4">* Choisissez votre(vos) niveau(x)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {levelPricings.map(lvl => (
                      <label key={lvl.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLevels.includes(lvl.level) ? 'border-[#003366] bg-blue-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                        <input type="checkbox" className="w-5 h-5 accent-[#003366]" checked={selectedLevels.includes(lvl.level)} onChange={() => toggleLevel(lvl.level)} />
                        <span className="font-bold text-gray-800">{lvl.label} <span className="text-xs text-gray-500 font-normal ml-1">- {lvl.price.toLocaleString()} FCFA</span></span>
                      </label>
                    ))}
                 </div>
               </div>

               {/* MODULES DYNAMIQUES */}
               <AnimatePresence>
                 {selectedLevels.map(lvlCode => {
                   const mods = pricings.filter(p => p.category === 'MODULE' && p.level === lvlCode);
                   if (mods.length === 0) return null;
                   return (
                     <motion.div key={`mod_${lvlCode}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h5 className="font-bold text-[#003366] flex items-center gap-2 mb-4"><PlusCircle size={16} className="text-[#D4AF37]"/> Modules Détachés pour le Niveau {lvlCode}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mods.map(m => (
                             <label key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                               <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={selectedModules.includes(m.code)} onChange={() => toggleModule(m.code)} />
                               <span className="text-sm font-medium text-gray-700">{m.label} <span className="text-xs text-amber-600 font-bold block">{m.price.toLocaleString()} FCFA</span></span>
                             </label>
                          ))}
                        </div>
                     </motion.div>
                   )
                 })}
               </AnimatePresence>

               {/* COURS PREPA */}
               <div>
                 <h4 className="text-sm font-bold text-gray-600 mb-4">Cours préparatoires (Optionnel)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prepPricings.map(p => (
                      <label key={p.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPrepCourses.includes(p.code) ? 'border-amber-500 bg-amber-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                        <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={selectedPrepCourses.includes(p.code)} onChange={() => togglePrepCourse(p.code)} />
                        <span className="font-bold text-gray-800">{p.label} <span className="text-xs text-amber-600 font-bold block mt-1">{p.price.toLocaleString()} FCFA</span></span>
                      </label>
                    ))}
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-8">
             <button disabled={loading} type="submit" className="w-full py-5 bg-[#D4AF37] text-white rounded-2xl font-black text-xl shadow-xl shadow-yellow-600/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                {loading ? "Génération du dossier..." : "Soumettre ma Préinscription"}
             </button>
          </div>
        </motion.form>
        
        <div className="text-center pb-8">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
            SMD v1 produit par <a href="https://offre.guelichweb.online/" target="_blank" rel="noopener noreferrer" className="text-[#003366] hover:underline">Guelichweb</a>
          </p>
        </div>
      </div>

      {/* STICKY CAISSE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#003366] text-white p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 border-t-4 border-[#D4AF37]">
         <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <CreditCard size={32} className="text-[#D4AF37]" />
              <div>
                <p className="text-sm text-blue-200 font-medium">Panier d&apos;examen (Facture Totale)</p>
                <p className="text-2xl font-black">{totalPrice.toLocaleString()} <span className="text-lg font-medium text-[#D4AF37]">FCFA</span></p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 max-w-sm text-center sm:text-right opacity-80 leading-snug">
              Cochez les niveaux, modules et cours pour voir le total s&apos;ajuster en direct.
            </p>
         </div>
      </div>
    </div>
  );
}
