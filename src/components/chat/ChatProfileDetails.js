"use client";
import React from 'react';
import { Phone, Mail, MapPin, Star, Ban, AlertCircle, Trash2 } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

const ChatProfileDetails = ({ user }) => {
   const { t, loaded } = useTranslations();
   if (!user || !loaded) return null;

   const mediaItems = [
      { id: 1, color: 'bg-amber-100' },
      { id: 2, color: 'bg-rose-100' },
      { id: 3, color: 'bg-blue-100' },
      { id: 4, color: 'bg-emerald-100' },
      { id: 5, color: 'bg-gray-100' },
   ];

   return (
      <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
         {/* Profile Header */}
         <div className="p-8 text-center border-b border-gray-50 bg-white rounded-b-[3rem] shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[#003366]/5 mx-auto flex items-center justify-center text-[#003366] text-3xl font-black mb-4 border-4 border-white shadow-lg">
               {user.name?.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-[#003366] mb-1">{user.name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               {t("messaging.activeAgo", { time: "35m" })}
            </p>
         </div>

         {/* Info Sections */}
         <div className="p-8 space-y-8">
            {/* Contact Information */}
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{t("messaging.instructorInfo")}</p>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#003366]">
                        <Phone size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t("messaging.phone")}</p>
                        <p className="text-xs font-bold text-gray-700">+229 01 96 64 19 61</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#003366]">
                        <Mail size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t("messaging.email")}</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{user.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#003366]">
                        <MapPin size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t("messaging.address")}</p>
                        <p className="text-xs font-bold text-gray-700">Cotonou, Bénin</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Media */}
            <div>
               <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("messaging.media")}</p>
                  <button className="text-[10px] font-bold text-[#003366] hover:underline uppercase tracking-widest">{t("messaging.seeAll")}</button>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map(item => (
                     <div key={item.id} className={`aspect-square rounded-2xl ${item.color} border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer`}></div>
                  ))}
                  <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                     <span className="text-xs">+12</span>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-1">
               {[
                  { label: t("messaging.addToFavorite"), icon: Star, color: 'text-gray-600' },
                  { label: t("messaging.block"), icon: Ban, color: 'text-red-500' },
                  { label: t("messaging.report"), icon: AlertCircle, color: 'text-red-500' },
                  { label: t("messaging.deleteChat"), icon: Trash2, color: 'text-red-500' },
               ].map((action, idx) => (
                  <button key={idx} className={`w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-all group`}>
                     <action.icon size={18} className={`${action.color} group-hover:scale-110 transition-transform`} />
                     <span className={`text-xs font-bold ${action.color === 'text-gray-600' ? 'text-gray-700' : action.color}`}>{action.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
};

export default ChatProfileDetails;
