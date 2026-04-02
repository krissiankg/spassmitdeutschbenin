"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Search, Upload, Download, Filter, MoreVertical, Mail, Phone, Calendar, UserPlus, X, Loader2, Check, AlertCircle, Edit2, Wand2, ArrowDownUp, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterSession, setFilterSession] = useState("All");
  const [dbSessions, setDbSessions] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    firstName: "", lastName: "", email: "", candidateNumber: "", consultationCode: "", level: "A1", sessionId: "", customData: {}
  });

  // Table Management State
  const [sortConfig, setSortConfig] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const fileInputRef = useRef(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        level: filterLevel,
        sessionId: filterSession === "All" ? "All" : dbSessions.find(s => s.title === filterSession)?.id || "All"
      });
      
      const res = await fetch(`/api/admin/candidates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const ObjectRes = Object.assign({}, await (await fetch("/api/admin/sessions")).json());
      // we only care about the response ok
      const res = await fetch("/api/admin/sessions");
      if (res.ok) {
        const data = await res.json();
        setDbSessions(data);
        if (data.length > 0) setSelectedSessionId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const loadFormFields = async () => {
    try {
      const res = await fetch("/api/form-settings");
      if (res.ok) {
        const data = await res.json();
        setCustomFields(data.fields);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadCandidates();
  }, [page, limit, filterLevel, filterSession]);

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadCandidates();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadSessions();
    loadFormFields();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const openEditModal = (candidate = null) => {
    if (candidate) {
      setEditingCandidateId(candidate.id);
      setCandidateForm({
        firstName: candidate.firstName || "",
        lastName: candidate.lastName || "",
        email: candidate.email || "",
        candidateNumber: candidate.candidateNumber || "",
        consultationCode: candidate.consultationCode || "",
        level: candidate.level || "A1",
        sessionId: candidate.sessionId || "",
        customData: candidate.customData || {}
      });
    } else {
      setEditingCandidateId(null);
      setCandidateForm({
        firstName: "", lastName: "", email: "", candidateNumber: "", consultationCode: "", level: "A1", sessionId: "", customData: {}
      });
    }
    setIsEditModalOpen(true);
  };

  const generateRandomSMD = () => {
    const chars = '0123456789';
    let result = 'SMD-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAutoGenerate = () => {
    setCandidateForm({
      ...candidateForm,
      candidateNumber: candidateForm.candidateNumber || generateRandomSMD(),
      consultationCode: candidateForm.consultationCode || generateRandomCode()
    });
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingCandidateId ? `/api/admin/candidates/${editingCandidateId}` : "/api/admin/candidates";
      const method = editingCandidateId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateForm)
      });

      if (res.ok) {
        toast.success(editingCandidateId ? "Candidat modifié avec succès" : "Candidat ajouté avec succès");
        setIsEditModalOpen(false);
        loadCandidates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Lecture du fichier...");
    try {
      const { read, utils } = await import("xlsx");
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = utils.sheet_to_json(worksheet);

          if (json.length === 0) {
            toast.error("Le fichier est vide", { id: toastId });
            return;
          }

          // Map the columns (Try to find matches for lastName, firstName, candidateNumber, email, etc.)
          const mapped = json.map(row => ({
            lastName: row.Nom || row.lastName || row.LASTNAME || "",
            firstName: row.Prénom || row.firstName || row.FIRSTNAME || row.Prenom || "",
            email: row.Email || row.email || row.EMAIL || "",
            candidateNumber: row.Numéro || row.number || row.candidateNumber || row.ID || "",
            level: row.Niveau || row.level || row.LEVEL || "B2",
            center: row.Centre || row.center || "Cotonou",
          }));

          setImportData(mapped);
          setIsImportModalOpen(true);
          toast.success(`${mapped.length} candidats chargés. Choisissez une session.`, { id: toastId });
        } catch (err) {
          toast.error("Format de fichier invalide", { id: toastId });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.error("Erreur lors de l'import", { id: toastId });
    }
    // Reset file input
    e.target.value = "";
  };

  const processImport = async () => {
    if (!selectedSessionId) {
      toast.error("Veuillez sélectionner une session");
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/candidates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: importData,
          sessionId: selectedSessionId
        })
      });

      if (res.ok) {
        toast.success("Importation terminée avec succès !");
        setIsImportModalOpen(false);
        setImportData([]);
        loadCandidates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsImporting(false);
    }
  };

  const processedCandidates = useMemo(() => {
    // In server-side pagination, 'candidates' is already filtered by the API.
    // We only apply client-side sorting if needed or just use the API order.
    let result = [...candidates];

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // ... (sorting logic remains same if we want to sort the current page only, 
        // or we could add sorting to the API later)
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [candidates, sortConfig]);

  const toggleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedCandidates.length && processedCandidates.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedCandidates.map(c => c.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const exportToExcel = async () => {
    const toastId = toast.loading("Génération du fichier Excel...");
    try {
      const { utils, writeFile } = await import("xlsx");
      const selected = candidates.filter(c => selectedIds.has(c.id));
      const dataToExport = selected.map(c => ({
         Prenom: c.firstName,
         Nom: c.lastName,
         Email: c.email || "",
         Numero_Candidat: c.candidateNumber || "",
         Code_Consultation: c.consultationCode || "",
         Niveau: c.level,
         Session: c.session?.title || "Sans Session",
         Sexe: c.gender || "",
         Date_Naissance: c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : "",
         Statut_Paiement: c.paymentStatus || "",
         Montant_Total: c.totalAmount || 0,
         Montant_Paye: c.amountPaid || 0,
         ...c.customData
      }));
      const ws = utils.json_to_sheet(dataToExport);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Candidats");
      writeFile(wb, "Candidats_SpassMitDeutsch.xlsx");
      toast.success("Fichier exporté avec succès", { id: toastId });
      setSelectedIds(new Set());
    } catch (e) {
      toast.error("Erreur lors de l'exportation", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100">Gestion des Candidats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span className="text-[#003366] dark:text-blue-400 font-bold">{total}</span> candidats au total dans la base.
          </p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".csv,.xlsx" 
          />
          <button 
            onClick={handleImportClick}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Upload size={18} /> Import Excel/CSV
          </button>
          <button 
            onClick={() => openEditModal()}
            className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10"
          >
            <UserPlus size={18} /> Nouveau Candidat
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-premium p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un candidat..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] dark:focus:ring-gray-600 transition-all outline-none text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Niveau:</span>
            <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#003366] outline-none"
            >
                {["All", "A1", "A2", "B1", "B2"].map(l => <option key={l} value={l}>{l === 'All' ? 'Tous' : l}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Session:</span>
            <select 
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#003366] outline-none max-w-[150px]"
            >
                <option value="All">Toutes</option>
                {[...new Set(candidates.map(c => c.session?.title).filter(Boolean))].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showIncompleteOnly ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50" : "bg-white dark:bg-[#1E1E1E] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
            title="Afficher les dossiers incomplets"
          >
            <AlertTriangle size={14} /> Incomplets
          </button>

          {(filterLevel !== "All" || filterSession !== "All" || searchTerm !== "" || showIncompleteOnly) && (
              <button 
                onClick={() => {setSearchTerm(""); setFilterLevel("All"); setFilterSession("All"); setShowIncompleteOnly(false);}}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Réinitialiser les filtres"
              >
                <X size={16} />
              </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex justify-between items-center animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-bold text-[#003366] ml-2">
            {selectedIds.size} candidat(s) sélectionné(s)
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              <FileSpreadsheet size={16} /> Exporter la Sélection
            </button>
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
             <Loader2 className="animate-spin text-[#003366]" size={32} />
             Chargement des candidats...
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                  <th className="px-4 py-4 w-10">
                    <input 
                      type="checkbox" 
                      onChange={toggleSelectAll}
                      checked={processedCandidates.length > 0 && selectedIds.size === processedCandidates.length}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-[#003366] dark:text-[#D4AF37] focus:ring-[#003366] dark:focus:ring-[#D4AF37] dark:bg-[#1E1E1E] cursor-pointer"
                    />
                  </th>
                  <th onClick={() => toggleSort('name')} className="px-6 py-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 group">
                    <div className="flex items-center gap-1">Nom du Candidat <ArrowDownUp size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'name' ? 'opacity-100 text-[#003366] dark:text-gray-200' : ''}`} /></div>
                  </th>
                  <th onClick={() => toggleSort('email')} className="px-6 py-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 group">
                    <div className="flex items-center gap-1">Adresse Email <ArrowDownUp size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'email' ? 'opacity-100 text-[#003366] dark:text-gray-200' : ''}`} /></div>
                  </th>
                  <th className="px-6 py-4 text-center">N° Candidat</th>
                  <th className="px-6 py-4 text-center">Code Consultation</th>
                  <th onClick={() => toggleSort('level')} className="px-6 py-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 group">
                    <div className="flex items-center gap-1">Niveau <ArrowDownUp size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'level' ? 'opacity-100 text-[#003366] dark:text-gray-200' : ''}`} /></div>
                  </th>
                  <th className="px-6 py-4">Session</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {processedCandidates.map((candidate) => (
                  <tr key={candidate.id} className={`hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A] transition-colors group ${selectedIds.has(candidate.id) ? 'bg-blue-50/30 dark:bg-[#1A2234]' : ''}`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(candidate.id)}
                        onChange={() => toggleSelect(candidate.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-[#003366] dark:text-[#D4AF37] focus:ring-[#003366] dark:focus:ring-[#D4AF37] dark:bg-[#1E1E1E] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-[#D4AF37] font-bold text-[10px]">
                          {candidate.firstName ? candidate.firstName[0] : '?'}{candidate.lastName ? candidate.lastName[0] : '?'}
                        </div>
                        <span className="font-bold text-[#003366] dark:text-gray-100 text-sm">{candidate.firstName} {candidate.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {candidate.email ? (
                          <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg w-fit">
                            <Mail size={12} className="opacity-70 dark:opacity-90" /> {candidate.email}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600 italic">Non renseigné</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-mono text-gray-800 dark:text-gray-300 font-bold tracking-wider">
                      {candidate.candidateNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {candidate.consultationCode ? (
                        <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                          {candidate.consultationCode.substring(0, 2)}••••
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#D4AF37] bg-opacity-10 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/20 uppercase">
                        {candidate.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{candidate.session?.title || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(candidate)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#003366] dark:hover:text-white transition-colors"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {processedCandidates.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic">Aucun candidat trouvé.</td>
                  </tr>
                )}
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
          </>
        )}
      </div>

      {/* Import Confirmation Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/20 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#003366]">Confirmer l'importation</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-sm text-blue-700 leading-relaxed">
                  Vous vous apprêtez à importer <strong>{importData.length} records</strong>. Veuillez sélectionner la session cible pour ces candidats.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Session de destination
                </label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none transition-all appearance-none"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  {dbSessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({s.level})</option>
                  ))}
                  {dbSessions.length === 0 && <option disabled>Aucune session disponible</option>}
                </select>
              </div>

              {/* Data Preview (first 3 candidates) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Aperçu des données
                </label>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {importData.slice(0, 3).map((c, i) => (
                    <div key={i} className="text-xs text-gray-600 py-1 flex justify-between border-b border-gray-100 last:border-0">
                      <span>{c.lastName} {c.firstName}</span>
                      <span className="text-gray-400">#{c.candidateNumber || 'Auto'}</span>
                    </div>
                  ))}
                  {importData.length > 3 && <div className="text-[10px] text-gray-400 text-center mt-2">... et {importData.length - 3} autres</div>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={processImport}
                  disabled={isImporting || dbSessions.length === 0}
                  className="flex-1 py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                >
                  {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isImporting ? "Importation..." : "Importer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Validation Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/20 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#003366]">{editingCandidateId ? "Modifier Candidat" : "Nouveau Candidat"}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prénom</label>
                    <input required type="text" value={candidateForm.firstName} onChange={e => setCandidateForm({...candidateForm, firstName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nom</label>
                    <input required type="text" value={candidateForm.lastName} onChange={e => setCandidateForm({...candidateForm, lastName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                    <input type="email" value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" placeholder="email@exemple.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Numéro Candidat</label>
                    <input type="text" value={candidateForm.candidateNumber} onChange={e => setCandidateForm({...candidateForm, candidateNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" placeholder="Ex: SMD-123456" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Code Consultation</label>
                     <input type="text" value={candidateForm.consultationCode} onChange={e => setCandidateForm({...candidateForm, consultationCode: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" placeholder="Ex: X8B2P9" />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button type="button" onClick={handleAutoGenerate} className="flex items-center gap-2 text-sm text-[#003366] bg-blue-50 px-3 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                      <Wand2 size={16}/> Auto-Générer ID et Code vides
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Niveau</label>
                    <select required value={candidateForm.level} onChange={e => setCandidateForm({...candidateForm, level: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]">
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Session</label>
                    <select value={candidateForm.sessionId} onChange={e => setCandidateForm({...candidateForm, sessionId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]">
                      <option value="">-- Sans Session --</option>
                      {dbSessions.map(s => <option key={s.id} value={s.id}>{s.title} ({s.level})</option>)}
                    </select>
                  </div>
                  
                  {/* Custom Fields render in Modal */}
                  {customFields.length > 0 && (
                     <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                           <h3 className="text-sm font-bold text-[#003366]">Informations Additionnelles (Formulaire dynamique)</h3>
                        </div>
                        {customFields.map(f => (
                           <div key={f.id} className={f.type === 'TEXT' ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{f.label} {f.required?'*':''}</label>
                              {f.type === 'TEXT' && <input type="text" value={candidateForm.customData?.[f.id] || ''} onChange={e => setCandidateForm({...candidateForm, customData: {...candidateForm.customData, [f.id]: e.target.value}})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />}
                              {f.type === 'NUMBER' && <input type="number" value={candidateForm.customData?.[f.id] || ''} onChange={e => setCandidateForm({...candidateForm, customData: {...candidateForm.customData, [f.id]: e.target.value}})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />}
                              {f.type === 'DATE' && <input type="date" value={candidateForm.customData?.[f.id] || ''} onChange={e => setCandidateForm({...candidateForm, customData: {...candidateForm.customData, [f.id]: e.target.value}})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />}
                              {f.type === 'SELECT' && (
                                <select value={candidateForm.customData?.[f.id] || ''} onChange={e => setCandidateForm({...candidateForm, customData: {...candidateForm.customData, [f.id]: e.target.value}})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl">
                                  <option value="">Sélectionner</option>
                                  {f.options.map((o,i) => <option key={i} value={o}>{o}</option>)}
                                </select>
                              )}
                              {f.type === 'FILE' && (
                                <div className="mt-2 text-sm text-[#003366] font-medium p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                                   {candidateForm.customData?.[f.id] ? (
                                      <a href={candidateForm.customData[f.id]} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-800">
                                         Voir le Document 📄
                                      </a>
                                   ) : (
                                      <span className="text-gray-400 italic">Aucun fichier transmis</span>
                                   )}
                                </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">Annuler</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                     {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
