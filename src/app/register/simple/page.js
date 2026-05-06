"use client";
import React, { useState, useEffect } from "react";
import { Upload, CheckCircle, Loader2, User, Calendar, ShieldCheck, CreditCard, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Composant partagé entre Simple et ÖSD — différencié par le prop `formType`
export default function RegisterSimplePage() {
  const formType = "SIMPLE";
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pricings, setPricings] = useState([]);
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formSettings, setFormSettings] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [customFiles, setCustomFiles] = useState({});
  const [file, setFile] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedPrepCourses, setSelectedPrepCourses] = useState([]);
  const [formData, setFormData] = useState({ firstName:"", lastName:"", gender:"", dateOfBirth:"", birthPlace:"", country:"", idType:"", idNumber:"", idIssueDate:"", idExpiryDate:"", phone:"", email:"", sessionId:"" });

  useEffect(() => {
    fetch("/api/form-settings").then(r => r.json()).then(cfg => {
      setFormSettings(cfg.settings);
      setCustomFields(cfg.fields);
      setSessions(cfg.activeSessions || []);
      setPricings(cfg.activePricings || []);
      const init = {}; cfg.fields.forEach(f => { init[f.id] = ""; }); setCustomData(init);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let t = 0;
    selectedModules.forEach(c => { const p = pricings.find(x => x.code === c); if (p) t += p.price; });
    selectedPrepCourses.forEach(c => { const p = pricings.find(x => x.code === c); if (p) t += p.price; });
    setTotalPrice(t);
  }, [selectedModules, selectedPrepCourses, pricings]);

  const hc = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const toggleLevel = lvl => {
    if (selectedLevels.includes(lvl)) {
      setSelectedLevels(selectedLevels.filter(x => x !== lvl));
      const rm = pricings.filter(p => p.level === lvl && p.category === 'MODULE').map(p => p.code);
      setSelectedModules(selectedModules.filter(m => !rm.includes(m)));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
      const add = pricings.filter(p => p.level === lvl && p.category === 'MODULE').map(p => p.code);
      setSelectedModules(prev => Array.from(new Set([...prev, ...add])));
    }
  };
  const toggleMod = code => setSelectedModules(p => p.includes(code) ? p.filter(x => x !== code) : [...p, code]);
  const togglePrep = code => setSelectedPrepCourses(p => p.includes(code) ? p.filter(x => x !== code) : [...p, code]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.sessionId) return toast.error("Champs obligatoires manquants");
    if (!selectedLevels.length) return toast.error("Choisissez au moins un niveau");
    if (!selectedModules.length) return toast.error("Choisissez au moins un module");
    if (!file) return toast.error("Importez votre pièce d'identité");
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(k => data.append(k, formData[k] || ""));
    data.append("document", file);
    data.append("selectedLevels", JSON.stringify(selectedLevels));
    data.append("selectedModules", JSON.stringify(selectedModules));
    data.append("selectedPrepCourses", JSON.stringify(selectedPrepCourses));
    data.append("customData", JSON.stringify(customData));
    data.append("formType", formType);
    Object.keys(customFiles).forEach(id => { if (customFiles[id]) data.append(`customFile_${id}`, customFiles[id]); });
    try {
      const res = await fetch("/api/register", { method: "POST", body: data });
      if (res.ok) setSuccess(true);
      else { const err = await res.json(); toast.error(err.error || "Erreur"); }
    } catch { toast.error("Erreur réseau"); } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40}/></div>
        <h2 className="text-3xl font-bold text-[#003366] mb-4">Inscription Enregistrée !</h2>
        <p className="text-gray-500 mb-3">Votre dossier a été soumis avec succès.</p>
        <p className="text-sm text-blue-700 bg-blue-50 rounded-xl p-3 mb-6">📧 Vos identifiants de connexion à l&apos;Espace Étudiant ont été envoyés par email.</p>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Montant à régler : {totalPrice.toLocaleString()} FCFA</h3>
          <p className="text-sm text-amber-700">Passez au secrétariat pour valider votre inscription.</p>
        </div>
        <button onClick={() => window.location.href="/"} className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold">Retour à l&apos;accueil</button>
      </motion.div>
    </div>
  );

  if (formSettings && !formSettings.isOpen) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
        <ShieldCheck size={40} className="text-amber-500 mx-auto mb-4"/>
        <h2 className="text-2xl font-bold text-[#003366] mb-3">Inscriptions Fermées</h2>
        <p className="text-gray-500 mb-6">{formSettings.closingMessage}</p>
        <Link href="/" className="inline-block bg-[#003366] text-white px-8 py-3 rounded-xl font-bold">Retour</Link>
      </div>
    </div>
  );

  const levelPricings = pricings.filter(p => p.category === 'LEVEL');
  const prepPricings = pricings.filter(p => p.category === 'PREP_COURSE');
  const input = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003366] mb-4"><ArrowLeft size={16}/> Retour au choix</Link><br/>
          <Link href="/"><img src="/logo.png" alt="SMD" className="h-20 mx-auto object-contain mb-4 hover:scale-105 transition-transform"/></Link>
          <span className="inline-flex items-center gap-2 bg-blue-50 text-[#003366] px-4 py-2 rounded-full text-sm font-bold mb-4">📚 Inscription Cours Réguliers</span>
          <h1 className="text-4xl font-extrabold text-[#003366] mb-2">Formulaire de Préinscription</h1>
          <p className="text-gray-500 text-lg">Rejoignez nos cours d&apos;allemand toute l&apos;année.</p>
        </div>

        <motion.form initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 space-y-10" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2 border-b pb-4"><User className="text-[#D4AF37]"/> 1. Identité Officielle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Prénom(s) *</label><input required type="text" name="firstName" value={formData.firstName} onChange={hc} className={input} placeholder="Jean Luc"/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Nom *</label><input required type="text" name="lastName" value={formData.lastName} onChange={hc} className={input} placeholder="Dupont"/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Sexe *</label><select required name="gender" value={formData.gender} onChange={hc} className={input}><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Date de naissance *</label><input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={hc} className={input}/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Lieu de naissance *</label><input required type="text" name="birthPlace" value={formData.birthPlace} onChange={hc} className={input} placeholder="Cotonou"/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Pays *</label><input required type="text" name="country" value={formData.country} onChange={hc} className={input} placeholder="Bénin"/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Téléphone *</label><input required type="tel" name="phone" value={formData.phone} onChange={hc} className={input} placeholder="+229 00000000"/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Email *</label><input required type="email" name="email" value={formData.email} onChange={hc} className={input} placeholder="exemple@mail.com"/></div>
            </div>
          </div>

          <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2"><ShieldCheck className="text-[#D4AF37]" size={20}/> 2. Document d&apos;Identité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Nature *</label><select required name="idType" value={formData.idType} onChange={hc} className={input}><option value="">Sélectionner</option><option value="CIP">CIP</option><option value="CNI">CNI</option><option value="PASSPORT">Passeport</option></select></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Numéro *</label><input required type="text" name="idNumber" value={formData.idNumber} onChange={hc} className={input}/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Date création *</label><input required type="date" name="idIssueDate" value={formData.idIssueDate} onChange={hc} className={input}/></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Expiration *</label><input required type="date" name="idExpiryDate" value={formData.idExpiryDate} onChange={hc} className={input}/></div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-3">Pièce jointe (Max 5Mo) *</label>
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                  <input required type="file" accept="image/jpeg,image/png,application/pdf" id="id-upload" className="hidden" onChange={e => { if(e.target.files?.[0]) { if(e.target.files[0].size > 5242880) return toast.error("Max 5Mo"); setFile(e.target.files[0]); }}}/>
                  <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                    {file ? (<><CheckCircle className="text-green-500 mb-2" size={32}/><p className="font-bold text-green-700">{file.name}</p></>) : (<><Upload className="text-[#003366] mb-3" size={32}/><p className="font-bold text-lg text-[#003366]">Cliquer pour uploader</p></>)}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-6 bg-blue-50/20 p-6 rounded-2xl border border-blue-50">
              <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2"><ShieldCheck className="text-[#D4AF37]" size={20}/> Informations Complémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFields.map(f => (
                  <div key={f.id} className={f.type==='TEXT'?'md:col-span-2':''}>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{f.label} {f.required?'*':''}</label>
                    {f.type==='TEXT' && <input type="text" required={f.required} value={customData[f.id]||''} onChange={e => setCustomData({...customData,[f.id]:e.target.value})} className={input}/>}
                    {f.type==='NUMBER' && <input type="number" required={f.required} value={customData[f.id]||''} onChange={e => setCustomData({...customData,[f.id]:e.target.value})} className={input}/>}
                    {f.type==='DATE' && <input type="date" required={f.required} value={customData[f.id]||''} onChange={e => setCustomData({...customData,[f.id]:e.target.value})} className={input}/>}
                    {f.type==='SELECT' && <select required={f.required} value={customData[f.id]||''} onChange={e => setCustomData({...customData,[f.id]:e.target.value})} className={input}><option value="">Sélectionner</option>{f.options.map((o,i)=><option key={i} value={o}>{o}</option>)}</select>}
                    {f.type==='FILE' && <input type="file" accept=".pdf,image/*" required={f.required} onChange={e => { if(e.target.files?.[0]) setCustomFiles({...customFiles,[f.id]:e.target.files[0]}); }} className={input}/>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#003366] flex items-center gap-2 border-b pb-4"><Calendar className="text-[#D4AF37]"/> 3. Niveau et Modules</h3>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <label className="block text-sm font-bold text-[#003366] mb-3">Session *</label>
              <select required name="sessionId" value={formData.sessionId} onChange={hc} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none shadow-sm">
                <option value="">Sélectionnez une session disponible</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({s.level==='MULTI'?'Multi-niveaux':s.level})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {levelPricings.map(lvl => (
                <label key={lvl.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLevels.includes(lvl.level)?'border-[#003366] bg-blue-50/30':'border-gray-100 hover:border-gray-200 bg-white'}`}>
                  <input type="checkbox" className="w-5 h-5 accent-[#003366]" checked={selectedLevels.includes(lvl.level)} onChange={() => toggleLevel(lvl.level)}/>
                  <span className="font-bold text-gray-800">{lvl.label} <span className="text-xs text-gray-500 font-normal ml-1">- {lvl.price.toLocaleString()} FCFA</span></span>
                </label>
              ))}
            </div>
            <AnimatePresence>
              {selectedLevels.map(lvlCode => {
                const mods = pricings.filter(p => p.category==='MODULE' && p.level===lvlCode);
                if (!mods.length) return null;
                return (
                  <motion.div key={`mod_${lvlCode}`} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h5 className="font-bold text-[#003366] flex items-center gap-2 mb-4"><PlusCircle size={16} className="text-[#D4AF37]"/> Modules — {lvlCode}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mods.map(m => (
                        <label key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" checked={selectedModules.includes(m.code)} onChange={() => toggleMod(m.code)}/>
                          <span className="text-sm font-medium text-gray-700">{m.label} <span className="text-xs text-amber-600 font-bold block">{m.price.toLocaleString()} FCFA</span></span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {prepPricings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prepPricings.map(p => (
                  <label key={p.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPrepCourses.includes(p.code)?'border-amber-500 bg-amber-50/50':'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={selectedPrepCourses.includes(p.code)} onChange={() => togglePrep(p.code)}/>
                    <span className="font-bold text-gray-800">{p.label} <span className="text-xs text-amber-600 font-bold block mt-1">{p.price.toLocaleString()} FCFA</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8">
            <button disabled={loading} type="submit" className="w-full py-5 bg-[#003366] text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle size={24}/>}
              {loading ? "Génération du dossier..." : "Soumettre ma Préinscription"}
            </button>
          </div>
        </motion.form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#003366] text-white p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 border-t-4 border-[#D4AF37]">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3"><CreditCard size={32} className="text-[#D4AF37]"/><div><p className="text-sm text-blue-200">Estimation des frais</p><p className="text-2xl font-black">{totalPrice.toLocaleString()} <span className="text-lg text-[#D4AF37]">FCFA</span></p></div></div>
          <p className="text-xs text-blue-100 max-w-xs text-right opacity-80">Cochez les niveaux et modules pour voir le total en direct.</p>
        </div>
      </div>
    </div>
  );
}
