"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Loader2,
  Check,
  Clock,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    level: "A1",
    description: "",
    price: "",
    duration: "8 semaines",
    days: [],
    timeStart: "08:00",
    timeEnd: "10:00",
    isActive: true
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        let errorMessage = errData.details
          ? `${errData.error}: ${errData.details}`
          : (errData.error || "Erreur serveur lors du chargement des cours");
        if (errData.availableModels) {
          errorMessage += ` (Modèles dispos: ${errData.availableModels.join(", ")})`;
        }
        toast.error(errorMessage, { duration: 10000 });
      }
    } catch (error) {
      toast.error("Erreur de chargement des cours");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.days.length === 0) {
      toast.error("Veuillez remplir les champs obligatoires (Nom, Prix, Jours)");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId ? `/api/admin/courses/${editingId}` : "/api/admin/courses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingId ? "Cours mis à jour !" : "Cours créé avec succès !");
        setIsModalOpen(false);
        loadCourses();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingId(course.id);
      setFormData({
        name: course.name,
        level: course.level,
        description: course.description || "",
        price: course.price.toString(),
        duration: course.duration,
        days: course.days || [],
        timeStart: course.timeStart || "08:00",
        timeEnd: course.timeEnd || "10:00",
        isActive: course.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        level: "A1",
        description: "",
        price: "",
        duration: "8 semaines",
        days: [],
        timeStart: "08:00",
        timeEnd: "10:00",
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce cours ? Cette action est irréversible.")) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Cours supprimé");
        loadCourses();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#003366] dark:text-gray-100 flex items-center gap-3">
            <BookOpen className="text-[#D4AF37]" size={32} />
            Gestion des Cours
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Configurez les offres de cours réguliers et leurs plannings.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Plus size={20} /> Créer un Cours
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-gray-200">
          <Loader2 className="animate-spin text-[#003366] mb-4" size={40} />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement des cours...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-8 border border-gray-50 dark:border-gray-800 shadow-xl shadow-blue-900/5 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="german-accent-bar absolute top-0 left-0 w-full h-1"></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {course.isActive ? 'Actif' : 'Inactif'}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(course)} className="p-2 bg-blue-50 text-[#003366] rounded-xl hover:bg-[#003366] hover:text-white transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <h3 className="text-xl font-black text-[#003366] dark:text-gray-100 mb-2">{course.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded-md uppercase">{course.level}</span>
                <span className="text-gray-400 text-xs font-bold">• {course.duration}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <Calendar size={16} className="text-[#003366]" />
                  <span>{course.days.join(', ')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <Clock size={16} className="text-[#003366]" />
                  <span>{course.timeStart} - {course.timeEnd}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Inscriptions</p>
                  <p className="text-lg font-black text-[#003366] dark:text-gray-100">{course._count?.enrollments || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Tarif</p>
                  <p className="text-xl font-black text-[#D4AF37]">{course.price.toLocaleString()} F</p>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-gray-300" size={40} />
              </div>
              <p className="text-gray-400 font-bold">Aucun cours configuré pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Creation/Edition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#121212] rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="german-accent-bar h-2 w-full"></div>
            <div className="p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#003366] dark:text-gray-100">{editingId ? "Modifier le cours" : "Nouveau cours"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom du cours</label>
                    <input
                      type="text" required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Niveau</label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all appearance-none"
                      value={formData.level}
                      onChange={e => setFormData({ ...formData, level: e.target.value })}
                    >
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix (FCFA)</label>
                    <input
                      type="number" required
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Durée estimée</label>
                    <input
                      type="text" placeholder="ex: 8 semaines"
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl w-full">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 accent-[#003366]"
                      />
                      <span className="text-sm font-bold text-[#003366]">Cours Actif</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jours de cours</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day} type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.days.includes(day) ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-gray-500 border-gray-100 hover:border-[#003366]'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heure de début</label>
                    <input
                      type="time"
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
                      value={formData.timeStart}
                      onChange={e => setFormData({ ...formData, timeStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heure de fin</label>
                    <input
                      type="time"
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
                      value={formData.timeEnd}
                      onChange={e => setFormData({ ...formData, timeEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (optionnel)</label>
                  <textarea
                    className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm font-medium focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all h-32 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button
                  disabled={isSaving}
                  className="w-full bg-[#003366] text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
                  {isSaving ? "Enregistrement..." : "Confirmer la configuration"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
