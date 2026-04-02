"use client";
import React, { useState, useRef, useEffect } from "react";
import { Save, ChevronDown, CheckCircle2, AlertCircle, Download, Upload, Search, Copy, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const OSD_RULES = {
  "A1": {
    "Lesen": { max: 30, min: 6 },
    "Hören": { max: 30, min: 6 },
    "Schreiben 1": { max: 5, min: 0 },
    "Schreiben 2": { max: 10, min: 4 },
    "Sprechen": { max: 25, min: 12 }
  },
  "A2": {
    "Lesen": { max: 30, min: 6 },
    "Hören": { max: 30, min: 6 },
    "Schreiben 1": { max: 5, min: 0 },
    "Schreiben 2": { max: 10, min: 4 },
    "Sprechen": { max: 25, min: 12 }
  },
  "B1": {
    "Lesen": { max: 100, min: 60 },
    "Hören": { max: 100, min: 60 },
    "Schreiben": { max: 100, min: 60 },
    "Sprechen": { max: 100, min: 60 }
  },
  "B2": {
    "Lesen": { max: 20, min: 10 },
    "Hören": { max: 20, min: 10 },
    "Schreiben": { max: 30, min: 15 },
    "Sprechen": { max: 30, min: 18 }
  }
};

export default function ResultsGridPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [modules, setModules] = useState([
    { id: "M1", name: "Lesen", maxScore: 25 },
    { id: "M2", name: "Hören", maxScore: 25 },
    { id: "M3", name: "Schreiben", maxScore: 25 },
    { id: "M4", name: "Sprechen", maxScore: 25 },
  ]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fileInputRef = useRef(null);

  // 1. Charger les sessions au montage
  const loadSessions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      }
    } catch (error) {
      toast.error("Erreur de chargement des sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 2. Charger les candidats et résultats quand la session change
  const loadResults = React.useCallback(async () => {
    if (!selectedSessionId) return;
    setLoadingResults(true);
    try {
      const res = await fetch(`/api/admin/results?sessionId=${selectedSessionId}`);
      if (res.ok) {
        const data = await res.json();
        // Définir les noms de modules selon le niveau de la session
        let standardNames = [];
        if (data.session.level === "A1" || data.session.level === "A2") {
             standardNames = ["Lesen", "Hören", "Schreiben 1", "Schreiben 2", "Sprechen"];
        } else if (data.session.level === "B1" || data.session.level === "B2") {
             standardNames = ["Lesen", "Hören", "Schreiben", "Sprechen"];
        } else {
             standardNames = ["Lesen", "Hören", "Schreiben", "Schreiben 1", "Schreiben 2", "Sprechen"];
        }
        setModules(standardNames.map(name => ({ id: name, name })));
        
        // Transformer les données de la BD pour le state local
        const formattedCandidates = data.candidates.map(c => {
          const result = c.results[0] || {};
          const scores = {};
          const registeredModuleConfigs = {}; // Pour stocker les maxScore et IDs réels

          // Chercher pour chaque module standard s'il existe une config pour ce candidat
          standardNames.forEach(name => {
              // Trouver le module correspondant au niveau du candidat
              const moduleDef = data.modules.find(m => m.name === name && m.level === c.level);
              
              if (moduleDef) {
                  // Vérifier si le candidat est inscrit à ce module
                  const moduleScore = result.moduleScores?.find(ms => ms.moduleId === moduleDef.id);
                  
                  const ruleMax = OSD_RULES[c.level]?.[name]?.max || moduleDef.maxScore;
                  const ruleMin = OSD_RULES[c.level]?.[name]?.min || 0;
                  
                  registeredModuleConfigs[name] = {
                      id: moduleDef.id,
                      max: ruleMax,
                      min: ruleMin,
                      isRegistered: !!moduleScore // On ne permet la saisie que si inscrit
                  };
                  scores[moduleDef.id] = moduleScore ? String(moduleScore.score) : "";
              }
          });

          return {
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            number: c.candidateNumber,
            level: c.level,
            scores,
            moduleConfigs: registeredModuleConfigs,
            total: result.total || 0,
            status: result.decision || "EN_ATTENTE",
            resultId: result.id
          };
        });
        
        setCandidates(formattedCandidates);
      }
    } catch (error) {
      toast.error("Erreur de chargement des résultats");
    } finally {
      setLoadingResults(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const calculateResultsForCandidate = (candidate, newScores) => {
    let total = 0;
    const scoresByName = {};
    const registeredModuleIds = Object.values(candidate.moduleConfigs)
        .filter(m => m.isRegistered)
        .map(m => m.id);
        
    // Extract scores numerically
    Object.entries(candidate.moduleConfigs).forEach(([name, config]) => {
      if (config.isRegistered) {
         const val = parseFloat(newScores[config.id]);
         scoresByName[name] = isNaN(val) ? 0 : val;
         total += (isNaN(val) ? 0 : val);
      }
    });

    const allFilled = registeredModuleIds.every(id => newScores[id] !== "" && !isNaN(newScores[id]));
    
    let status = "EN_ATTENTE";
    if (allFilled) {
      const level = candidate.level;
      const isReg = (name) => candidate.moduleConfigs[name]?.isRegistered;
      
      let isAdmis = false;
      
      if (level === 'B1') {
        isAdmis = Object.entries(scoresByName).every(([name, val]) => val >= OSD_RULES['B1'][name].min);
      } else if (level === 'B2') {
        const hasSchriftlich = isReg('Lesen') || isReg('Hören') || isReg('Schreiben');
        let schriftlichPass = true;
        if (hasSchriftlich) {
            const sSum = (scoresByName['Lesen']||0) + (scoresByName['Hören']||0) + (scoresByName['Schreiben']||0);
            schriftlichPass = sSum >= 42;
        }
        const hasSprechen = isReg('Sprechen');
        let sprechenPass = true;
        if (hasSprechen) {
            sprechenPass = scoresByName['Sprechen'] >= 18;
        }
        isAdmis = schriftlichPass && sprechenPass;
      } else if (level === 'A1' || level === 'A2') {
        const hasSchriftlich = isReg('Lesen') || isReg('Hören') || isReg('Schreiben 1') || isReg('Schreiben 2');
        let schriftlichPass = true;
        if (hasSchriftlich) {
            const sSum = (scoresByName['Lesen']||0) + (scoresByName['Hören']||0) + (scoresByName['Schreiben 1']||0) + (scoresByName['Schreiben 2']||0);
            const schPass = ((scoresByName['Schreiben 1']||0) + (scoresByName['Schreiben 2']||0)) >= 4;
            schriftlichPass = sSum >= 38 && schPass;
        }
        const hasSprechen = isReg('Sprechen');
        let sprechenPass = true;
        if (hasSprechen) {
            sprechenPass = scoresByName['Sprechen'] >= 12;
        }
        isAdmis = schriftlichPass && sprechenPass && total >= 50;
      } else {
        const maxPossible = Object.values(candidate.moduleConfigs)
          .filter(m => m.isRegistered)
          .reduce((acc, m) => acc + m.max, 0);
        isAdmis = (total / maxPossible) >= 0.6;
      }
      
      status = isAdmis ? "ADMIS" : "AJOURNÉ";
    } else if (Object.values(newScores).filter(val => val !== "").length > 0) {
      status = "PARTIEL";
    }
    
    return { total: total.toFixed(2), status };
  };

  const handleScoreChange = (candidateId, moduleName, value) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        const config = c.moduleConfigs[moduleName];
        if (!config || !config.isRegistered) return c;

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && (numValue > config.max || numValue < 0)) return c;

        const newScores = { ...c.scores, [config.id]: value };
        const { total, status } = calculateResultsForCandidate(c, newScores);
        return { ...c, scores: newScores, total, status };
      }
      return c;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          results: candidates.map(c => ({
            candidateId: c.id,
            resultId: c.resultId,
            scores: c.scores,
            total: c.total,
            decision: c.status
          }))
        })
      });

      if (res.ok) {
        toast.success("Toutes les notes ont été enregistrées avec succès !");
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const generateTemplate = () => {
    const data = candidates.map(c => ({
      "Numéro": c.number,
      "Nom": c.name,
      "Niveau": c.level,
      ...modules.reduce((acc, m) => {
          const config = c.moduleConfigs[m.name];
          return { ...acc, [m.name]: config?.isRegistered ? (c.scores[config.id] || "") : "N/A" };
      }, {})
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Notes");
    XLSX.writeFile(wb, `Modele_Saisie_${selectedSessionId}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newCandidates = [...candidates];
        data.forEach(row => {
          const candidateIndex = newCandidates.findIndex(c => String(c.number) === String(row["Numéro"]));
          if (candidateIndex !== -1) {
            const c = newCandidates[candidateIndex];
            const newScores = { ...c.scores };
            
            modules.forEach(m => {
              const val = row[m.name];
              const config = c.moduleConfigs[m.name];
              if (val !== undefined && config?.isRegistered && val !== "N/A") {
                newScores[config.id] = String(val);
              }
            });
            const { total, status } = calculateResultsForCandidate(c, newScores);
            newCandidates[candidateIndex] = { ...c, scores: newScores, total, status };
          }
        });
        setCandidates(newCandidates);
        toast.success("Notes importées avec succès ! Cliquez sur Enregistrer pour confirmer.");
      } catch (error) {
        toast.error("Erreur lors de la lecture du fichier Excel.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handlePublish = async () => {
    if (!confirm("Êtes-vous sûr de vouloir valider et publier cette session ? Les candidats recevront leurs codes par email.")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sessions/${selectedSessionId}/publish`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Session validée et publiée ! Emails envoyés.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.number.includes(searchTerm)
  );

  const stats = {
      completed: candidates.filter(c => c.status === "ADMIS" || c.status === "AJOURNÉ").length,
      pending: candidates.filter(c => c.status === "EN_ATTENTE" || c.status === "PARTIEL").length
  };

  if (loading) return <div className="p-12 text-center text-gray-500 dark:text-gray-500">Initialisation...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">Saisie des Résultats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">Mode grille haute-performance pour l&apos;entrée rapide des notes.</p>
        </div>
        <div className="flex flex-wrap gap-3 relative">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center gap-2 text-sm bg-white dark:bg-[#121212]"
          >
            <Upload size={18} /> Importer Notes
          </button>
          <button onClick={generateTemplate} className="btn-secondary flex items-center gap-2 text-sm bg-white dark:bg-[#121212]">
            <Download size={18} /> Télécharger Modèle
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedSessionId}
            className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10 disabled:opacity-50 min-w-[160px] justify-center"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
            {saving ? "Sauvegarde..." : "Tout Enregistrer"}
          </button>
        </div>
      </div>

      <div className="card-premium p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#003366]/5 border-blue-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#003366] dark:text-gray-100 font-bold">Session Active</span>
            <select 
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="font-bold text-[#003366] dark:text-gray-100 bg-transparent border-none focus:ring-0 cursor-pointer text-sm outline-none"
            >
                {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({s.level})</option>
                ))}
            </select>
          </div>
          <div className="h-10 w-px bg-blue-200 hidden md:block"></div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
            <input 
              type="text" 
              placeholder="Filtrer candidat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none text-sm placeholder-blue-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-[#003366] dark:text-gray-100 ">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" /> {stats.completed} Terminés
          </span>
          <span className="flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500" /> {stats.pending} En attente
          </span>
        </div>
      </div>

      <div className="card-premium overflow-x-auto border-none shadow-none bg-transparent">
        {loadingResults ? (
            <div className="p-20 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-[#003366] dark:text-gray-100 " />
                <p>Chargement des candidats et des notes...</p>
            </div>
        ) : (
            <table className="w-full border-collapse">
            <thead>
                <tr className="bg-[#003366] text-white">
                <th className="sticky left-0 z-20 bg-[#003366] px-6 py-4 text-left font-bold text-xs uppercase tracking-wider rounded-tl-2xl border-r border-blue-800 w-64">Candidat</th>
                <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider border-r border-blue-800">Numéro</th>
                <th className="px-4 py-4 text-center font-bold text-xs uppercase tracking-wider border-r border-blue-800">Niveau</th>
                {modules.map((m) => (
                    <th key={m.id} className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider border-r border-blue-800">
                    {m.name}
                    </th>
                ))}
                <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider border-r border-blue-800">Total</th>
                <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider rounded-tr-2xl">Statut</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#121212]">
                {filteredCandidates.map((c, idx) => (
                <tr key={c.id} className={cn("hover:bg-blue-50/30 dark:bg-blue-900/30 transition-colors border-b border-gray-100 dark:border-gray-800", idx % 2 === 1 && "bg-gray-50/30 dark:bg-[#1A1A1A]")}>
                    <td className="sticky left-0 z-10 bg-inherit px-6 py-4 font-bold text-[#003366] dark:text-gray-100 text-sm border-r border-gray-100 dark:border-gray-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    {c.name}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-mono text-gray-500 dark:text-gray-500 border-r border-gray-50 dark:border-gray-800/50">
                    {c.number}
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-blue-800 border-r border-gray-50 dark:border-gray-800/50">
                    {c.level}
                    </td>
                    {modules.map((m) => {
                      const config = c.moduleConfigs[m.name];
                      const isEnrolled = config?.isRegistered;
                      
                      return (
                        <td key={m.id} className={cn("px-2 py-2 border-r border-gray-50 dark:border-gray-800/50 text-center", !isEnrolled && "bg-gray-50/50 dark:bg-[#1A1A1A]")}>
                          {isEnrolled ? (
                            <div className="relative group">
                              <input 
                                type="text" 
                                value={c.scores[config.id] || ""} 
                                onChange={(e) => handleScoreChange(c.id, m.name, e.target.value)}
                                className="w-full py-2 text-center text-sm font-bold text-[#003366] dark:text-gray-100 bg-transparent border-2 border-transparent focus:border-[#D4AF37] focus:bg-white dark:bg-[#121212] rounded-lg outline-none transition-all placeholder-gray-200 dark:placeholder-gray-700"
                                placeholder="..."
                              />
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold block">
                                Min {config.min} / Max {config.max}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600 italic text-xs">Exempt</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center text-sm font-extrabold text-[#003366] dark:text-gray-100 border-r border-gray-50 dark:border-gray-800/50 bg-gray-50/20">
                    {c.total}
                    </td>
                    <td className="px-6 py-4 text-center">
                    <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border",
                        c.status === "ADMIS" ? "bg-green-50 text-green-700 border-green-100" :
                        c.status === "PARTIEL" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-100" :
                        c.status === "AJOURNÉ" ? "bg-red-50 text-red-700 border-red-100" : "bg-gray-50 dark:bg-[#1E1E1E] text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800"
                    )}>
                        {c.status.replace("_", " ")}
                    </span>
                    </td>
                </tr>
                ))}
                {filteredCandidates.length === 0 && (
                    <tr>
                        <td colSpan={6 + modules.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic">
                            Aucun candidat trouvé pour cette session.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        )}
      </div>

      <div className="card-premium p-6 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-[#003366] to-[#004d99] text-white">
        <div className="flex gap-8">
          <div>
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Candidats</p>
            <p className="text-2xl font-black">{candidates.length}</p>
          </div>
          <div>
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Taux Réussite</p>
            <p className="text-2xl font-black text-[#D4AF37]">
                {candidates.length > 0 
                  ? Math.round((candidates.filter(c => c.status === "ADMIS").length / candidates.length) * 100) 
                  : 0}%
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-white/10">
            <Copy size={18} /> Copier Ligne Précédente
          </button>
          <button 
            onClick={handlePublish}
            disabled={candidates.length === 0 || saving}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c4a132] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Valider la Session
          </button>
        </div>
      </div>
    </div>
  );
}
