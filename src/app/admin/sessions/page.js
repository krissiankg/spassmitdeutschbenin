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
  Check,
  Clock,
  MapPin
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useTranslations } from "@/hooks/useTranslations";

const StatusBadge = ({ status, t }) => {
  const styles = {
    DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:text-gray-600",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status === 'DRAFT' ? t("admin.sessions.statusDraft") : status === 'PUBLISHED' ? t("admin.sessions.statusPublished") : t("admin.sessions.statusArchived")}
    </span>
  );
};

export default function SessionsPage() {
  const { t, loaded } = useTranslations();
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

  // Gestion du calendrier des examens
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentSessionForSchedule, setCurrentSessionForSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  // Charger les sessions depuis l'API
  const loadSessions = React.useCallback(async () => {
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
      toast.error(t("admin.sessions.errorLoadingSessions"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    if (!newSession.title || !newSession.date) {
      toast.error(t("admin.sessions.errorFillFields"));
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
        toast.success(editingId ? t("admin.sessions.successSessionUpdated") : t("admin.sessions.successSessionCreated"));
        setIsModalOpen(false);
        setEditingId(null);
        setNewSession({ title: "", date: "", level: "B2" });
        loadSessions(); // Recharger la liste
      } else {
        toast.error(t("admin.sessions.errorSessionSave"));
      }
    } catch (error) {
      toast.error(t("admin.dashboard.errorNetwork"));
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
    if (!confirm(t("admin.sessions.publishConfirm"))) {
      return;
    }

    const toastId = toast.loading(t("admin.sessions.publishingInProgress"));
    try {
      const res = await fetch(`/api/admin/sessions/${id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(t("admin.sessions.publishSuccess", { count: data.emailsSent }), { id: toastId });
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "PUBLISHED" } : s));
      } else {
        toast.error(data.error || t("admin.sessions.errorPublish"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("admin.dashboard.errorNetwork"), { id: toastId });
    }
  };

  const handleOpenScheduleModal = async (session) => {
    setCurrentSessionForSchedule(session);
    setIsScheduleModalOpen(true);
    setIsLoadingModules(true);
    
    try {
      // 1. Charger les modules pour ce niveau
      const modulesRes = await fetch(`/api/admin/modules?level=${session.level}`);
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setAvailableModules(modulesData);
      } else {
        const errorData = await modulesRes.json().catch(() => ({}));
        console.error("Failed to load modules:", errorData);
        toast.error("Impossible de charger la liste des modules");
      }

      // 2. Charger les horaires existants
      const scheduleRes = await fetch(`/api/admin/sessions/${session.id}/schedule`);
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setSchedules(scheduleData);
      } else {
        toast.error("Impossible de charger le calendrier existant");
      }
    } catch (error) {
      console.error("Error loading schedule data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoadingModules(false);
    }
  };

  const handleAddScheduleRow = () => {
    setSchedules([
      ...schedules,
      {
        moduleId: "",
        date: currentSessionForSchedule?.date ? new Date(currentSessionForSchedule.date).toISOString().split('T')[0] : "",
        timeStart: "08:00",
        timeEnd: "12:00",
        room: ""
      }
    ]);
  };

  const handleRemoveScheduleRow = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const handleSaveSchedule = async () => {
    if (schedules.some(s => !s.moduleId || !s.date || !s.timeStart || !s.timeEnd)) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSavingSchedule(true);
    try {
      const res = await fetch(`/api/admin/sessions/${currentSessionForSchedule.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules })
      });

      if (res.ok) {
        toast.success("Calendrier mis à jour avec succès");
        setIsScheduleModalOpen(false);
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error(t("admin.dashboard.errorNetwork"));
    } finally {
      setIsSavingSchedule(false);
    }
  };

  if (!loaded || (loading && sessions.length === 0)) return <div className="p-8 text-center text-gray-500 dark:text-gray-500">{t("admin.sessions.loadingSessions")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100 ">{t("admin.sessions.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">{t("admin.sessions.subtitle")}</p>
        </div>
        <button 
          onClick={() => openAppModal()}
          className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} /> {t("admin.sessions.createSession")}
        </button>
      </div>

      <div className="card-premium p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder={t("admin.sessions.searchPlaceholder")} 
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
            <Filter size={18} /> {t("admin.sessions.filters")}
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                <th className="px-6 py-4">{t("admin.sessions.tableHeaderTitle")}</th>
                <th className="px-6 py-4">{t("admin.sessions.tableHeaderDate")}</th>
                <th className="px-6 py-4">{t("admin.sessions.tableHeaderLevel")}</th>
                <th className="px-6 py-4">{t("admin.sessions.tableHeaderCandidates")}</th>
                <th className="px-6 py-4">{t("admin.sessions.tableHeaderStatus")}</th>
                <th className="px-6 py-4 text-right">{t("admin.sessions.tableHeaderActions")}</th>
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
                    {t("admin.sessions.enrolledCount", { count: session.candidates })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={session.status} t={t} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {session.status === 'DRAFT' && (
                        <button 
                         onClick={() => handlePublish(session.id)}
                         title={t("admin.sessions.publishResults")}
                         className="p-2 text-[#003366] dark:text-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors">
                          <Send size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => openAppModal(session)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenScheduleModal(session)}
                        title="Gérer le calendrier"
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:bg-amber-900/20 rounded-lg transition-colors">
                        <Calendar size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-500">{t("admin.sessions.noSessionsFound")}</td>
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
                <StatusBadge status={session.status} t={t} />
              </div>
              <h3 className="text-lg font-bold text-[#003366] dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                {session.title}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-xs mb-4 font-medium tracking-wide">
                {t("admin.dashboard.report").toUpperCase()} {formatDate(session.date).toUpperCase()}
              </p>
              
              <div className="flex items-center justify-between py-4 border-t border-gray-50 dark:border-gray-800/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">{t("admin.sessions.levelLabel")}</span>
                  <span className="text-sm font-bold text-[#003366] dark:text-gray-100 ">{session.level}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">{t("admin.sessions.tableHeaderCandidates")}</span>
                  <span className="text-sm font-bold text-[#003366] dark:text-gray-100 ">{session.candidates}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                {session.status === "DRAFT" && (
                  <button 
                    onClick={() => handlePublish(session.id)}
                    className="w-full py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Send size={14} /> {t("admin.sessions.publishResults")}
                  </button>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openAppModal(session)}
                    className="flex-1 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 dark:text-gray-600 rounded-xl text-xs font-bold dark:hover:bg-gray-800 transition-colors">
                    {t("admin.sessions.edit")}
                  </button>
                  <button 
                    onClick={() => handleOpenScheduleModal(session)}
                    className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-900/10 flex items-center justify-center gap-1">
                    <Calendar size={14} /> Calendrier
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
              <h2 className="text-xl font-bold text-[#003366] dark:text-gray-100 ">{editingId ? t("admin.sessions.editSessionModalTitle") : t("admin.sessions.newSessionModalTitle")}</h2>
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
                  {t("admin.sessions.sessionTitleLabel")}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={t("admin.sessions.sessionTitlePlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    {t("admin.sessions.levelLabel")}
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none dark:text-gray-100 transition-all appearance-none"
                    value={newSession.level}
                    onChange={(e) => setNewSession({...newSession, level: e.target.value})}
                  >
                    <option value="A1">Niveau A1</option>
                    <option value="A2">Niveau A2</option>
                    <option value="B1">Niveau B1</option>
                    <option value="B2">{t("admin.dashboard.levelB2")}</option>
                    <option value="Multi-niveaux">Multi-niveaux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    {t("admin.sessions.dateLabel")}
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
                  {t("admin.sessions.cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isCreating ? t("admin.sessions.saving") : t("admin.sessions.confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Calendrier des Examens */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/20 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#003366] dark:text-gray-100 ">Calendrier des Examens</h2>
                <p className="text-sm text-gray-500">{currentSessionForSchedule?.title} - {currentSessionForSchedule?.level}</p>
              </div>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-2 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 dark:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              {isLoadingModules ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-[#003366]" size={40} />
                  <p className="text-gray-500">Chargement des modules...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-gray-500">Aucun calendrier défini pour cette session.</p>
                      <button 
                        onClick={handleAddScheduleRow}
                        className="mt-4 text-[#003366] font-bold text-sm hover:underline flex items-center gap-2 mx-auto"
                      >
                        <Plus size={18} /> Ajouter une épreuve
                      </button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                          <th className="pb-4 text-left pl-2">Module / Épreuve</th>
                          <th className="pb-4 text-left">Date</th>
                          <th className="pb-4 text-left">Horaire</th>
                          <th className="pb-4 text-left">Salle / Lieu</th>
                          <th className="pb-4 text-right pr-2"></th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {schedules.map((item, idx) => (
                          <tr key={idx} className="group">
                            <td className="pb-3 pl-2">
                              <select 
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-lg outline-none text-sm"
                                value={item.moduleId}
                                onChange={(e) => handleScheduleChange(idx, "moduleId", e.target.value)}
                              >
                                <option value="">Choisir un module</option>
                                {availableModules.map(m => (
                                  <option key={m.id} value={m.id}>
                                    [{m.level}] {m.code} - {m.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="pb-3">
                              <input 
                                type="date"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-lg outline-none text-sm"
                                value={item.date ? new Date(item.date).toISOString().split('T')[0] : ""}
                                onChange={(e) => handleScheduleChange(idx, "date", e.target.value)}
                              />
                            </td>
                            <td className="pb-3">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="time"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-lg outline-none text-sm"
                                  value={item.timeStart}
                                  onChange={(e) => handleScheduleChange(idx, "timeStart", e.target.value)}
                                />
                                <span className="text-gray-400">à</span>
                                <input 
                                  type="time"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-lg outline-none text-sm"
                                  value={item.timeEnd}
                                  onChange={(e) => handleScheduleChange(idx, "timeEnd", e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="pb-3">
                              <input 
                                type="text"
                                placeholder="Ex: Salle A1"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-lg outline-none text-sm"
                                value={item.room || ""}
                                onChange={(e) => handleScheduleChange(idx, "room", e.target.value)}
                              />
                            </td>
                            <td className="pb-3 text-right pr-2">
                              <button 
                                onClick={() => handleRemoveScheduleRow(idx)}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {!isLoadingModules && schedules.length > 0 && (
                    <button 
                      onClick={handleAddScheduleRow}
                      className="w-full py-3 bg-gray-50 dark:bg-[#1A1A1A] border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 hover:text-[#003366] hover:border-[#003366] transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Plus size={18} /> Ajouter une autre épreuve
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm dark:hover:bg-gray-800 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule || isLoadingModules}
                className="flex-[2] py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
              >
                {isSavingSchedule ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Enregistrer le calendrier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
