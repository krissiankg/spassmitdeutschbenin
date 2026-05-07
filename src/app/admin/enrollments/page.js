"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  Filter,
  Loader2,
  Mail,
  Phone,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200"
  };
  const labels = {
    PENDING: "En attente",
    APPROVED: "Validé",
    REJECTED: "Refusé",
    COMPLETED: "Terminé"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enrollments");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (error) {
      toast.error("Erreur de chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleUpdateStatus = async (id, status) => {
    const actionLabel = status === 'APPROVED' ? 'valider' : 'refuser';
    if (!confirm(`Souhaitez-vous ${actionLabel} cette inscription ?`)) return;

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        toast.success(`Inscription ${status === 'APPROVED' ? 'validée' : 'refusée'} avec succès`);
        loadEnrollments();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const handleDeleteEnrollment = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette inscription ? Cela ajustera également le solde de l'étudiant.")) return;

    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Inscription supprimée avec succès");
        loadEnrollments();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const filtered = enrollments.filter(en => {
    const nameMatch = `${en.candidate.firstName} ${en.candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const courseMatch = en.course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "ALL" || en.status === filterStatus;
    return (nameMatch || courseMatch) && statusMatch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#003366] dark:text-gray-100 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={32} />
          Inscriptions aux Cours
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Validez les demandes d&apos;inscription des étudiants.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1E1E1E] p-6 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un étudiant ou un cours..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#121212] border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterStatus === s ? 'bg-[#003366] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {s === 'ALL' ? 'Toutes' : s === 'PENDING' ? 'En attente' : s === 'APPROVED' ? 'Validées' : 'Refusées'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#003366]" size={40} />
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map(en => (
            <div key={en.id} className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-6 lg:p-8 border border-gray-50 dark:border-gray-800 shadow-xl shadow-blue-900/5 flex flex-col lg:flex-row items-center gap-8 group hover:shadow-2xl transition-all">
              {/* Etudiant */}
              <div className="flex items-center gap-4 w-full lg:w-1/3">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-[#003366] font-black text-xl group-hover:scale-110 transition-transform">
                  {en.candidate.firstName.charAt(0)}{en.candidate.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-[#003366] dark:text-gray-100 text-lg truncate">
                    {en.candidate.firstName} {en.candidate.lastName}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Mail size={12} /> {en.candidate.email}</span>
                    <span className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Phone size={12} /> {en.candidate.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Cours */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="text-[#D4AF37]" size={20} />
                  <span className="font-black text-[#003366] dark:text-gray-100">{en.course.name}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={14} /> Demandé le {new Date(en.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-black text-[#D4AF37] tracking-wider uppercase">{en.course.level}</span>
                </div>
              </div>

              {/* Statut & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                <StatusBadge status={en.status} />

                <div className="flex gap-2">
                  {en.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(en.id, 'APPROVED')}
                        className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                        title="Valider l'inscription"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(en.id, 'REJECTED')}
                        className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        title="Refuser l'inscription"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  
                  {en.status !== 'PENDING' && (
                    <div className="text-gray-300 italic text-[10px] font-medium self-center mr-2">
                      Traité le {new Date(en.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteEnrollment(en.id)}
                    className="p-3 bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                    title="Supprimer l'inscription"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-bold">
              Aucune inscription trouvée.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
