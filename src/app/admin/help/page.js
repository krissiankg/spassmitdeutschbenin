"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  BookOpen, 
  UserCheck, 
  CreditCard, 
  ClipboardList, 
  Shield, 
  HelpCircle,
  Info,
  Calendar,
  Users,
  MessageSquare,
  Lock,
  PieChart,
  Mail,
  Zap,
  ArrowRight,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Eye,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const HelpSection = ({ title, icon: Icon, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800/50 mb-10 transition-all hover:shadow-2xl hover:shadow-blue-900/10"
  >
    <div className="flex items-center gap-5 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-[#003366]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#003366] dark:text-[#D4AF37] border border-[#003366]/10 dark:border-[#D4AF37]/20">
        <Icon size={28} />
      </div>
      <h2 className="text-3xl font-black text-[#003366] dark:text-gray-100 tracking-tight">{title}</h2>
    </div>
    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
      {children}
    </div>
  </motion.div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-5 group">
    <div className="w-10 h-10 rounded-full bg-[#003366] dark:bg-[#D4AF37] text-white dark:text-[#003366] flex items-center justify-center font-black shrink-0 text-lg shadow-lg shadow-blue-900/10">
      {number}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 transition-colors group-hover:text-[#003366] dark:group-hover:text-[#D4AF37]">{title}</h4>
      <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-[#003366] dark:text-blue-300",
    amber: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-400"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden group ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Icon size={80}/></div>
      <h3 className="font-black text-2xl mb-3 flex items-center gap-3">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 font-medium">{desc}</p>
    </div>
  );
};

const TutorialEditor = ({ tutorial, onSave, onCancel }) => {
  const [formData, setFormData] = useState(tutorial || {
    title: "",
    description: "",
    category: "GENERAL",
    content: [],
    isPublished: false
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleAddStep = () => {
    setFormData({
      ...formData,
      content: [...formData.content, { title: "", description: "", imageUrl: "" }]
    });
  };

  const handleRemoveStep = (index) => {
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent });
  };

  const handleStepChange = (index, field, value) => {
    const newContent = [...formData.content];
    newContent[index][field] = value;
    setFormData({ ...formData, content: newContent });
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (result.url) {
        handleStepChange(index, "imageUrl", result.url);
        toast.success("Image téléchargée");
      }
    } catch (error) {
      toast.error("Erreur d'upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1A1A1A] rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 mb-12"
    >
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black text-[#003366] dark:text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] text-[#003366] flex items-center justify-center">
             {tutorial ? <Edit2 size={24} /> : <Plus size={24} />}
          </div>
          {tutorial ? "Modifier le Tutoriel" : "Nouveau Tutoriel"}
        </h2>
        <button onClick={onCancel} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-gray-500 tracking-widest ml-2">Titre du tutoriel</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold"
              placeholder="Ex: Comment enregistrer une note"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-gray-500 tracking-widest ml-2">Catégorie</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold appearance-none"
            >
              <option value="GENERAL">Général</option>
              <option value="SECRETARY">Secrétariat</option>
              <option value="ACCOUNTING">Comptabilité</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="SECURITY">Sécurité</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase text-gray-500 tracking-widest ml-2">Description courte</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#003366] transition-all font-medium h-24"
            placeholder="Une brève description pour présenter le guide..."
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <h3 className="text-xl font-black text-[#003366] dark:text-[#D4AF37]">Étapes du tutoriel</h3>
            <button 
              onClick={handleAddStep}
              className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
            >
              <Plus size={20} /> Ajouter une étape
            </button>
          </div>

          <div className="space-y-8">
            {formData.content.map((step, index) => (
              <div key={index} className="p-8 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800 relative group">
                <button 
                  onClick={() => handleRemoveStep(index)}
                  className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-black text-sm">{index + 1}</span>
                       <input 
                         type="text" 
                         value={step.title}
                         onChange={(e) => handleStepChange(index, "title", e.target.value)}
                         className="flex-1 px-4 py-2 bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-[#003366] outline-none font-bold text-lg"
                         placeholder="Titre de l'étape"
                       />
                    </div>
                    <textarea 
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#003366] h-32"
                      placeholder="Instructions détaillées..."
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-video bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center overflow-hidden relative">
                      {step.imageUrl ? (
                        <>
                          <Image src={step.imageUrl} alt="Etape" fill className="object-cover" unoptimized />
                          <button 
                            onClick={() => handleStepChange(index, "imageUrl", "")}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                          <p className="text-xs font-black text-gray-400 uppercase">Capture d&apos;écran</p>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {formData.content.length === 0 && (
               <div className="text-center py-10 text-gray-400 italic">Aucune étape ajoutée pour le moment.</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
           <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-6 h-6 rounded-lg text-[#003366] focus:ring-[#003366] border-gray-300 transition-all"
              />
              <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-[#003366] transition-colors">Rendre ce tutoriel public</span>
           </label>
           <div className="flex gap-4">
              <button onClick={onCancel} className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-[1.5rem] font-black text-lg hover:bg-gray-200 transition-all">
                Annuler
              </button>
              <button 
                onClick={() => onSave(formData)}
                className="flex items-center gap-3 px-10 py-5 bg-[#003366] text-white rounded-[1.5rem] font-black text-lg hover:scale-105 transition-all shadow-xl shadow-blue-900/20"
              >
                <Save size={24} /> {tutorial ? "Mettre à jour" : "Créer le Tutoriel"}
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const TutorialView = ({ tutorial, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-white dark:bg-[#121212] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative"
    >
      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-all z-10">
        <X size={24} />
      </button>
      
      <div className="p-12">
        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#003366] dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
          {tutorial.category}
        </span>
        <h2 className="text-4xl font-black text-[#003366] dark:text-white mb-4 tracking-tight uppercase">{tutorial.title}</h2>
        <p className="text-xl text-gray-500 font-medium mb-12">{tutorial.description}</p>
        
        <div className="space-y-20">
          {tutorial.content.map((step, index) => (
            <div key={index} className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#003366] text-white flex items-center justify-center font-black text-xl shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white">{step.title}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{step.description}</p>
                </div>
              </div>
              {step.imageUrl && (
                <div className="rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-800">
                  <Image 
                    src={step.imageUrl} 
                    alt={step.title} 
                    width={1000} 
                    height={600} 
                    className="w-full h-auto object-cover" 
                    unoptimized 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-20 p-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800 text-center">
           <h4 className="text-xl font-black text-[#003366] dark:text-blue-200 mb-2">Besoin d&apos;assistance ?</h4>
           <p className="text-gray-600 dark:text-gray-400 font-medium">Contactez le support technique via le chat administratif si des zones d&apos;ombre subsistent.</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const TutorialCard = ({ tutorial, isAdmin, onEdit, onDelete, onTogglePublish, onView }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800/50 shadow-lg hover:shadow-2xl transition-all relative group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#003366] dark:text-blue-300">
              <BookOpen size={28} />
           </div>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                    {tutorial.category}
                 </span>
                 {isAdmin && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tutorial.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                       {tutorial.isPublished ? 'Public' : 'Brouillon'}
                    </span>
                 )}
              </div>
              <h3 className="text-xl font-black text-[#003366] dark:text-white leading-tight">{tutorial.title}</h3>
           </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
             <button onClick={() => onEdit(tutorial)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#003366] transition-all rounded-xl">
                <Edit2 size={18} />
             </button>
             <button onClick={() => onTogglePublish(tutorial)} className={`p-2.5 transition-all rounded-xl ${tutorial.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                {tutorial.isPublished ? <Eye size={18} /> : <Lock size={18} />}
             </button>
             <button onClick={() => onDelete(tutorial.id)} className="p-2.5 bg-red-50 text-red-400 hover:text-red-600 transition-all rounded-xl">
                <Trash2 size={18} />
             </button>
          </div>
        )}
      </div>

      <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 line-clamp-2">{tutorial.description}</p>
      
      <button 
        onClick={() => onView(tutorial)}
        className="w-full py-4 bg-gray-50 dark:bg-gray-800 hover:bg-[#003366] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#003366] transition-all rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
      >
        Consulter le Guide <ArrowRight size={18} />
      </button>
    </motion.div>
  );
};

export default function HelpPage() {
  const { t, loaded } = useTranslations();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const fetchTutorials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tutorials?category=${activeTab.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setTutorials(data);
      }
    } catch (error) {
      console.error("Fetch tutorials error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const handleDeleteTutorial = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce tutoriel ?")) return;
    try {
      const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tutoriel supprimé");
        fetchTutorials();
      }
    } catch (error) {
      toast.error("Erreur de suppression");
    }
  };

  const handleTogglePublish = async (tutorial) => {
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tutorial, isPublished: !tutorial.isPublished })
      });
      if (res.ok) {
        toast.success(tutorial.isPublished ? "Brouillon enregistré" : "Tutoriel publié");
        fetchTutorials();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSaveTutorial = async (formData) => {
    try {
      const method = editingTutorial ? "PUT" : "POST";
      const url = editingTutorial ? `/api/admin/tutorials/${editingTutorial.id}` : "/api/admin/tutorials";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingTutorial ? "Tutoriel mis à jour" : "Nouveau tutoriel créé");
        setShowEditor(false);
        setEditingTutorial(null);
        fetchTutorials();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const [viewingTutorial, setViewingTutorial] = useState(null);

  if (!loaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: t("admin.help.tabs.general"), icon: BookOpen },
    { id: "secretary", label: t("admin.help.tabs.secretary"), icon: UserCheck },
    { id: "accounting", label: t("admin.help.tabs.accounting"), icon: CreditCard },
    { id: "communication", label: t("admin.help.tabs.communication"), icon: MessageSquare },
    { id: "security", label: t("admin.help.tabs.security"), icon: Shield },
    { id: "tutorials", label: t("admin.help.tabs.tutorials"), icon: Zap },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-black uppercase tracking-widest rounded-full border border-[#D4AF37]/20">
              {t("admin.help.sections.adminGuideTag")}
            </span>
          </div>
          <h1 className="text-6xl font-black text-[#003366] dark:text-white tracking-tighter mb-4">
            {t("admin.help.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
            {t("admin.help.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 sticky top-24 z-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-lg shadow-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id 
                ? "bg-[#003366] text-white shadow-xl shadow-blue-900/40 scale-105" 
                : "bg-white dark:bg-[#1E1E1E] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? "text-[#D4AF37]" : ""} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {activeTab === "general" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.presentation.title")} icon={BookOpen}>
              <p className="text-xl font-medium">
                {t("admin.help.sections.presentation.desc")}
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <FeatureCard 
                  title={t("admin.help.sections.presentation.objective")} 
                  desc={t("admin.help.sections.presentation.objectiveDesc")} 
                  icon={Zap} 
                  color="blue" 
                />
                <FeatureCard 
                  title={t("admin.help.sections.presentation.security")} 
                  desc={t("admin.help.sections.presentation.securityDesc")} 
                  icon={Shield} 
                  color="amber" 
                />
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "secretary" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.secretary.title")} icon={UserCheck}>
              <div className="space-y-12">
                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4 flex items-center gap-3">
                    <Calendar size={24} /> {t("admin.help.sections.secretary.sessions")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">{t("admin.help.sections.secretary.sessionsDesc")}</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <Info className="text-[#003366] dark:text-[#D4AF37]" />
                    <p className="text-sm font-bold uppercase tracking-wide">{t("payments.draftVsPublished")}</p>
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    <Users size={24} /> {t("admin.help.sections.secretary.candidates")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Step number="1" title={t("admin.help.sections.secretary.modeIndividual")} description={t("admin.help.sections.secretary.modeIndividualDesc")} />
                    <Step number="2" title={t("admin.help.sections.secretary.modeImport")} description={t("admin.help.sections.secretary.modeImportDesc")} />
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-blue-100 dark:border-blue-900">
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4 flex items-center gap-3">
                    <Mail size={24} /> {t("admin.help.sections.secretary.credentials")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">{t("admin.help.sections.secretary.credentialsDesc")}</p>
                </section>

                <div className="p-10 bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150"><ClipboardList size={200}/></div>
                  <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                    <Shield size={32} className="text-[#D4AF37]" /> {t("admin.help.sections.secretary.results")}
                  </h3>
                  <p className="text-lg text-blue-100/90 mb-8 max-w-2xl">
                    {t("admin.help.sections.secretary.resultsDesc")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400" /> {t("payments.autoEmail")}
                    </span>
                    <span className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400" /> {t("payments.portalAccess")}
                    </span>
                  </div>
                </div>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "accounting" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.accounting.title")} icon={CreditCard}>
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-6 flex items-center gap-3">
                    {t("admin.help.sections.accounting.flows")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <FeatureCard 
                      title={t("admin.help.sections.accounting.status")} 
                      desc={t("admin.help.sections.accounting.statusDesc")} 
                      icon={PieChart} 
                      color="emerald" 
                    />
                    <FeatureCard 
                      title={t("admin.help.sections.accounting.receipts")} 
                      desc={t("admin.help.sections.accounting.receiptsDesc")} 
                      icon={FileText} 
                      color="blue" 
                    />
                  </div>
                </section>

                <section className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                  <h4 className="font-black text-2xl text-[#003366] dark:text-[#D4AF37] mb-4 flex items-center gap-3">
                    <Zap size={24} /> {t("admin.help.sections.accounting.pricing")}
                  </h4>
                  <p className="mb-6 font-medium">{t("admin.help.sections.accounting.pricingDesc")}</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <ArrowRight size={16} /> {t("payments.pricingNotice")}
                  </div>
                </section>

                <section className="relative pl-8 border-l-4 border-emerald-100 dark:border-emerald-900">
                  <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mb-4">
                    {t("admin.help.sections.accounting.dashboard")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{t("admin.help.sections.accounting.dashboardDesc")}</p>
                </section>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.communication.title")} icon={MessageSquare}>
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <Step number="1" title={t("admin.help.sections.communication.chat")} description={t("admin.help.sections.communication.chatDesc")} />
                  <Step number="2" title={t("admin.help.sections.communication.attachments")} description={t("admin.help.sections.communication.attachmentsDesc")} />
                </div>
                
                <section className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-2xl font-black text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-3">
                    <Mail size={24} /> {t("admin.help.sections.communication.notifications")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {t("admin.help.sections.communication.notificationsDesc")}
                  </p>
                </section>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-10">
            <HelpSection title={t("admin.help.sections.security.title")} icon={Shield}>
              <div className="space-y-12">
                <section>
                   <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-4">{t("admin.help.sections.security.audit")}</h3>
                   <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-8">{t("admin.help.sections.security.auditDesc")}</p>
                   <div className="grid md:grid-cols-2 gap-8">
                     <div className="flex gap-4 items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm font-medium">{t("payments.auditDetail1")}</p>
                     </div>
                     <div className="flex gap-4 items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                       <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                       <p className="text-sm font-medium">{t("payments.auditDetail2")}</p>
                     </div>
                   </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  <FeatureCard 
                    title={t("admin.help.sections.security.rbac")} 
                    desc={t("admin.help.sections.security.rbacDesc")} 
                    icon={Lock} 
                    color="amber" 
                  />
                  <FeatureCard 
                    title={t("admin.help.sections.security.twoFactor")} 
                    desc={t("admin.help.sections.security.twoFactorDesc")} 
                    icon={Shield} 
                    color="indigo" 
                  />
                </div>
              </div>
            </HelpSection>
          </div>
        )}

        {activeTab === "tutorials" && (
          <div className="space-y-12">
            <AnimatePresence>
               {viewingTutorial && (
                  <TutorialView 
                    tutorial={viewingTutorial} 
                    onClose={() => setViewingTutorial(null)} 
                  />
               )}
            </AnimatePresence>

            {isSuperAdmin && (
               <div className="flex items-center justify-between mb-12">
                  <div>
                     <h3 className="text-2xl font-black text-[#003366] dark:text-[#D4AF37]">Gestion des Tutoriels</h3>
                     <p className="text-gray-500 font-medium">Créez et modifiez la documentation pour votre équipe.</p>
                  </div>
                  {!showEditor && (
                     <button 
                        onClick={() => { setEditingTutorial(null); setShowEditor(true); }}
                        className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-blue-900/20"
                     >
                        <Plus size={20} /> Créer une Documentation
                     </button>
                  )}
               </div>
            )}

            {showEditor && isSuperAdmin && (
               <TutorialEditor 
                  tutorial={editingTutorial} 
                  onSave={handleSaveTutorial} 
                  onCancel={() => { setShowEditor(false); setEditingTutorial(null); }} 
               />
            )}

            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
                  ))}
               </div>
            ) : tutorials.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {tutorials.map((tutorial) => (
                     <TutorialCard 
                        key={tutorial.id}
                        tutorial={tutorial}
                        isAdmin={isSuperAdmin}
                        onEdit={(t) => { setEditingTutorial(t); setShowEditor(true); }}
                        onDelete={handleDeleteTutorial}
                        onTogglePublish={handleTogglePublish}
                        onView={setViewingTutorial}
                     />
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Zap className="text-[#003366] dark:text-blue-300" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-[#003366] dark:text-white mb-2">Aucun tutoriel dynamique</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Commencez à rédiger la documentation en tant que Super Admin pour qu&apos;elle apparaisse ici.</p>
               </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Quick Link */}
      <div className="p-12 bg-white dark:bg-[#1A1A1A] rounded-[3rem] border border-gray-100 dark:border-gray-800 text-center shadow-xl shadow-black/5">
        <HelpCircle size={48} className="mx-auto text-[#D4AF37] mb-6" />
        <h2 className="text-3xl font-black text-[#003366] dark:text-white mb-4">{t("admin.help.sections.footer.title")}</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {t("admin.help.sections.footer.desc")}
        </p>
        <a 
          href="https://wa.me/22966368705" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          {t("admin.help.sections.footer.button")}
        </a>
      </div>
    </div>
  );
}
