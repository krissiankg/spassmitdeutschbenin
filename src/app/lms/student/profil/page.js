"use client";
import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Target, 
  Briefcase, 
  Globe,
  Camera,
  X,
  Check,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

const InfoItem = ({ label, value, icon: Icon, delay, t }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
      <Icon size={22} className="text-[#003366]" />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-[#003366]">{value || t("profile.notSpecified")}</p>
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/lms/student/profile");
        const json = await res.json();
        setStudent(json);
        setFormData({
          firstName: json.firstName,
          lastName: json.lastName,
          phone: json.phone,
          dateOfBirth: json.dateOfBirth ? json.dateOfBirth.split('T')[0] : "",
          birthPlace: json.birthPlace,
          country: json.country
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/lms/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await fetch("/api/lms/student/profile").then(r => r.json());
        setStudent(updated);
        setIsEditing(false);
        router.push("/lms/student/profil");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-64 bg-white rounded-[3rem]"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-3xl"></div>)}
    </div>
  </div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight mb-2">
            {isEditing ? t("profile.editProfile") : t("profile.profileDetails")}
          </h1>
          <p className="text-gray-500 font-medium">{t("profile.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-white border border-gray-200 text-gray-500 font-bold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <X size={18} /> {t("profile.cancel")}
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#003366] text-white font-black py-3 px-8 rounded-2xl hover:bg-[#002244] transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {saving ? t("profile.saving") : <><Check size={18} /> {t("profile.saveChanges")}</>}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-[#003366] text-white font-black py-4 px-10 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-xl shadow-blue-900/20 group"
            >
              <div className="p-3 bg-white/10 rounded-xl group-hover:bg-[#D4AF37] transition-colors">
                 <img src="/icons/Gear.png" alt="Edit" className="w-6 h-6 brightness-0 invert" />
              </div>
              {t("profile.modifyInfo")}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <img src="/logo.png" alt="Logo" className="w-48 h-48 object-contain" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-12">
           
           {/* Left Sidebar: Photo & Stats */}
           <div className="lg:w-80 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                 <div className="w-48 h-48 bg-gray-100 rounded-[3rem] border-8 border-gray-50 overflow-hidden shadow-inner flex items-center justify-center">
                    <User size={80} className="text-gray-300" />
                    {/* Simulation d'image si existante */}
                 </div>
                 {isEditing && (
                    <button className="absolute bottom-4 right-4 p-4 bg-[#D4AF37] text-[#003366] rounded-2xl shadow-xl hover:scale-110 transition-transform">
                       <Camera size={20} />
                    </button>
                 )}
              </div>
              <div>
                 <h2 className="text-2xl font-black text-[#003366] mb-1">{student?.firstName} {student?.lastName}</h2>
                 <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">{student?.candidateNumber}</p>
              </div>
              <div className="w-full h-px bg-gray-50"></div>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-4 bg-gray-50 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("profile.level")}</p>
                    <p className="text-xl font-black text-[#003366]">{student?.level}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("profile.status")}</p>
                    <p className="text-xs font-black text-green-600 uppercase">{t("profile.active")}</p>
                 </div>
              </div>
           </div>

           {/* Right Section: Form/Details */}
           <div className="flex-1">
              <h3 className="text-xl font-black text-[#003366] mb-8 flex items-center gap-3">
                 {t("profile.personalInfo")}
                 <div className="h-px bg-gray-100 flex-1"></div>
              </h3>

              {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.firstName")}</label>
                       <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.lastName")}</label>
                       <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.email")}</label>
                       <input 
                        type="email" 
                        value={student?.email}
                        disabled
                        className="w-full p-5 bg-gray-100 rounded-2xl border-none text-gray-400 font-bold opacity-70 cursor-not-allowed" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.phone")}</label>
                       <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.birthDate")}</label>
                       <input 
                        type="date" 
                        value={formData.dateOfBirth}
                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.birthPlace")}</label>
                       <input 
                        type="text" 
                        value={formData.birthPlace}
                        onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">{t("profile.nationality")}</label>
                       <input 
                        type="text" 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#003366] transition-all font-bold text-[#003366]" 
                       />
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label={t("profile.fullName")} value={`${student?.firstName} ${student?.lastName}`} icon={User} delay={0.1} t={t} />
                    <InfoItem label={t("profile.email")} value={student?.email} icon={Mail} delay={0.2} t={t} />
                    <InfoItem label={t("profile.phone")} value={student?.phone} icon={Phone} delay={0.3} t={t} />
                    <InfoItem label={t("profile.birthDate")} value={student?.dateOfBirth ? new Date(student?.dateOfBirth).toLocaleDateString(typeof window !== 'undefined' ? window.localStorage.getItem('NEXT_LOCALE') === 'de' ? 'de-DE' : window.localStorage.getItem('NEXT_LOCALE') === 'en' ? 'en-US' : 'fr-FR' : 'fr-FR') : null} icon={Calendar} delay={0.4} t={t} />
                    <InfoItem label={t("profile.birthPlace")} value={student?.birthPlace} icon={MapPin} delay={0.5} t={t} />
                    <InfoItem label={t("profile.nationality")} value={student?.country} icon={Globe} delay={0.6} t={t} />
                    <InfoItem label={t("profile.currentLevel")} value={t("profile.germanLevel", { level: student?.level })} icon={Target} delay={0.7} t={t} />
                    <InfoItem label={t("profile.occupation")} value={t("profile.learner")} icon={Briefcase} delay={0.8} t={t} />
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Security Tip */}
      <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
         <div className="bg-white p-4 rounded-2xl shadow-sm text-amber-500">
            <Target size={24} />
         </div>
         <div>
            <h4 className="font-black text-amber-900 mb-1">{t("profile.securityTipTitle")}</h4>
            <p className="text-sm text-amber-700/70">
              {t("profile.securityTipDesc")}
            </p>
         </div>
      </div>

    </div>
  );
}
