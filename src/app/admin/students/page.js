"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, MoreVertical, Mail, MessageSquare, ShieldCheck, ShieldOff, Edit2, Loader2, X, AlertTriangle, UserPlus, Trash2, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [studentForm, setStudentForm] = useState({
    firstName: "", lastName: "", email: "", level: "A1"
  });

  const loadStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        searchName: searchName,
        searchEmail: searchEmail,
        level: filterLevel
      });

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement des étudiants");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, searchName, searchEmail, filterLevel]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Debouncing search & filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchName, searchEmail, filterLevel]);

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'annuaire ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Étudiant supprimé avec succès");
        loadStudents();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }
  };

  const openEditModal = (student = null) => {
    if (student) {
      setEditingStudentId(student.id);
      setStudentForm({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        level: student.level || "A1"
      });
    } else {
      setEditingStudentId(null);
      setStudentForm({
        firstName: "", lastName: "", email: "", level: "A1"
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingStudentId ? `/api/admin/candidates/${editingStudentId}` : "/api/admin/candidates";
      const method = editingStudentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...studentForm,
            formType: editingStudentId ? undefined : 'SIMPLE'
        })
      });

      if (res.ok) {
        toast.success(editingStudentId ? "Étudiant modifié avec succès" : "Étudiant ajouté avec succès");
        setIsEditModalOpen(false);
        loadStudents();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] dark:text-gray-100">Annuaire des Étudiants (LMS)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Liste exclusive des apprenants inscrits aux cours de langue.
          </p>
        </div>
        <button
          onClick={() => openEditModal()}
          className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10"
        >
          <UserPlus size={18} /> Inscrire un Étudiant
        </button>
      </div>

      {/* Stats and General Search */}
      <div className="card-premium p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Recherche globale (Nom, Email...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#003366] dark:focus:ring-gray-600 transition-all outline-none text-sm"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Total : <span className="text-[#003366] font-bold">{total}</span> étudiants SIMPLE
        </div>
      </div>

      {/* Students Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#003366]" size={32} />
            Chargement de l&apos;annuaire...
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-gray-800">
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span>Nom de l&apos;Étudiant</span>
                      <input 
                        type="text" 
                        placeholder="Filtrer..." 
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="font-normal normal-case px-2 py-1 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-[10px]"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span>Adresse Email</span>
                      <input 
                        type="text" 
                        placeholder="Filtrer..." 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="font-normal normal-case px-2 py-1 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-[10px]"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span>Niveau</span>
                      <select 
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="font-normal normal-case px-2 py-1 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-[10px]"
                      >
                        <option value="">Tous</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Accès LMS</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[10px] bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-[#D4AF37]">
                          {student.firstName ? student.firstName[0] : '?'}{student.lastName ? student.lastName[0] : '?'}
                        </div>
                        <span className="font-bold text-[#003366] dark:text-gray-100 text-sm">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg w-fit">
                        <Mail size={12} className="opacity-70 dark:opacity-90" /> {student.email || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#D4AF37] bg-opacity-10 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/20 uppercase">
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {student.lmsPassword ? (
                          <ShieldCheck size={18} className="text-emerald-500" />
                        ) : (
                          <ShieldOff size={18} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => window.location.href = `/admin/messages?targetId=${student.id}&targetType=STUDENT`}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Envoyer un message"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => openEditModal(student)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#003366] dark:hover:text-white transition-colors" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">Aucun étudiant trouvé dans l&apos;annuaire.</td>
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

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/20 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#003366]">{editingStudentId ? "Modifier Étudiant" : "Inscrire nouvel Étudiant"}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prénom</label>
                  <input required type="text" value={studentForm.firstName} onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nom</label>
                  <input required type="text" value={studentForm.lastName} onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                  <input required type="email" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Niveau</label>
                  <select
                    value={studentForm.level}
                    onChange={e => setStudentForm({ ...studentForm, level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    {["A1", "A2", "B1", "B2"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-[#003366] text-white rounded-xl font-bold text-sm hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  {isSaving ? "Enregistrement..." : "Valider l'accès LMS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
