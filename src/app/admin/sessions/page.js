"use client";
import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Calendar, 
  LayoutGrid, 
  List, 
  Send,
  X,
  Loader2,
  Check
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";

const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status === 'DRAFT' ? 'Brouillon' : status === 'PUBLISHED' ? 'Publié' : 'Archivé'}
    </span>
  );
};

export default function SessionsPage() {
  const [viewMode, setViewMode] = useState("list");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSession, setNewSession] = useState({
    title: "",
    date: "",
    level: "B2"
  });

  // Charger les sessions depuis l'API
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(s => ({
          id: s.id,
          title: s.title,
          date: s.date,
          level: s.level,
          status: s.status,
          candidates: s._count?.candidates || 0
        }));
        setSessions(formatted);
      }
    } catch (error) {
      toast.error("Erreur de chargement des sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    if (!newSession.title || !newSession.date) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsCreating(true);
    try {
      const url = editingId ? `/api/admin/sessions/${editingId}` : "/api/admin/sessions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession)
      });

      if (res.ok) {
        toast.success(editingId ? "Session modifiée avec succès !" : "Session créée avec succès !");
        setIsModalOpen(false);
        setEditingId(null);
        setNewSession({ title: "", date: "", level: "B2" });
        loadSessions(); // Recharger la liste
      } else {
        toast.error("Erreur lors de l'enregistrement de la session");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setIsCreating(false);
    }
  };

  const openAppModal = (session = null) => {
    if (session) {
      setEditingId(session.id);
      setNewSession({
        title: session.title,
        date: new Date(session.date).toISOString().split('T')[0],
        level: session.level
      });
    } else {
      setEditingId(null);
      setNewSession({ title: "", date: "", level: "B2" });
    }
    setIsModalOpen(true);
  };

  const handlePublish = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir publier les résultats ? Cela enverra un email à tous les candidats de cette session.")) {
      return;
    }

    const toastId = toast.loading("Publication et envoi des emails en cours...");
    try {
      const res = await fetch(`/api/admin/sessions/${id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Résultats publiés ! ${data.emailsSent} emails envoyés.`, { id: toastId });
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "PUBLISHED" } : s));
      } else {
        toast.error(data.error || "Erreur lors de la publication", { id: toastId });
      }
    } catch (error) {
      toast.error("Erreur réseau", { id: toastId });
    }
  };

  if (loading && sessions.length === 0) return <div className="p-8 text-center text-gray-500 dark:text-gray-500">Chargement des sessions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">Sessions d'Examen</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">Gérez les périodes d'examens et la publication des résultats.</p>
        </div>
        <button 
          onClick={() => openAppModal()}
          className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} /> Créer une Session
        </button>
      </div>

      <div className="card-premium p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une session..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] transition-all outline-none dark:text-gray-100 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex bg-gray-50 dark:bg-[#1E1E1E] p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-[#121212] shadow-sm text-[#003366] dark:text-gray-100 " : "text-gray-400 dark:text-gray-500"}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-[#121212] shadow-sm text-[#003366] dark:text-gray-100 " : "text-gray-400 dark:text-gray-500"}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl border border-gray-100 dark:border-gray-800 text-sm dark:hover:bg-gray-800">
            <Filter size={18} /> Filtres
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                <th className="px-6 py-4">Titre de la Session</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Niveau</th>
                <th className="px-6 py-4">Candidats</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/50 dark:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-gray-100 rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                      <span className="font-bold text-[#003366] dark:text-gray-100 text-sm">{session.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500 font-medium">
                    {formatDate(session.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#003366] bg-opacity-5 text-[#003366] dark:text-gray-100 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {session.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-600">
                    {session.candidates} inscrits
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={session.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {session.status === 'DRAFT' && (
                        <button 
                         onClick={() => handlePublish(session.id)}
                         title="Publier les résultats (Email aux candidats)"
                         className="p-2 text-[#003366] dark:text-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors">
                          <Send size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => openAppModal(session)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-500">Aucune session trouvée en base de données.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="card-premium p-6 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-gray-100 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <StatusBadge status={session.status} />
              </div>
              <h3 className="text-lg font-bold text-[#003366] dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                {session.title}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-xs mb-4 font-medium tracking-wide">
                PRÉVU LE {formatDate(session.date).toUpperCase()}
              </p>
              
              <div className="flex items-center justify-between py-4 border-t border-gray-50 dark:border-gray-800/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Niveau</span>
                  <span className="text-sm font-bold text-[#003366] dark:text-gray-100 ">{session.level}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Candidats</span>
                  <span className="text-sm font-bold text-[#003366] dark:text-gray-100 ">{session.candidates}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                {session.status === "DRAFT" && (
                  <button 
                    onClick={() => handlePublish(session.id)}
                    className="w-full py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Send size={14} /> Publier et Notifier
                  </button>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openAppModal(session)}
                    className="flex-1 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl text-xs font-bold dark:hover:bg-gray-800 transition-colors">
                    Modifier
                  </button>
                  <button className="flex-1 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-colors shadow-lg shadow-blue-900/10">
                    Gérer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Création de Session */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/20 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#003366] dark:text-gray-100 ">{editingId ? "Modifier la Session" : "Nouvelle Session"}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 dark:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSession} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Titre de la Session
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Session Mars 2026"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Niveau
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all appearance-none"
                    value={newSession.level}
                    onChange={(e) => setNewSession({...newSession, level: e.target.value})}
                  >
                    <option value="A1">Niveau A1</option>
                    <option value="A2">Niveau A2</option>
                    <option value="B1">Niveau B1</option>
                    <option value="B2">Niveau B2</option>
                    <option value="Multi-niveaux">Multi-niveaux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Date de l'examen
                  </label>
                  <input 
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all"
                    value={newSession.date}
                    onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl font-bold text-sm dark:hover:bg-gray-800 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isCreating ? "Sauvegarde..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
