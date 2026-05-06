"use client";
import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, BookOpen, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PlanningPage() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanning = async () => {
      try {
        const [enRes, examRes] = await Promise.all([
          fetch("/api/lms/student/enrollments"),
          fetch("/api/lms/student/exam-schedule")
        ]);

        if (enRes.ok) {
          const data = await enRes.json();
          setEnrollments(data.filter(e => e.status === 'APPROVED'));
        }

        if (examRes.ok) {
          const data = await examRes.json();
          setExamSchedules(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchPlanning();
  }, [session]);

  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#003366]" size={40} />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight mb-2">Mon Planning Complet</h1>
          <p className="text-gray-500 font-medium">Horaires de vos cours et de vos examens à venir.</p>
        </div>
      </div>

      {/* Section Cours */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
            <BookOpen size={20} />
          </div>
          <h2 className="text-xl font-black text-[#003366]">Cours Hebdomadaires</h2>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jour</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cours</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horaire</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DAYS.map((day) => {
                  const dayCourses = enrollments.filter(e => e.course.days.includes(day));

                  if (dayCourses.length === 0) {
                    return (
                      <tr key={day}>
                        <td className="px-8 py-6 font-black text-gray-400">{day}</td>
                        <td colSpan="3" className="px-8 py-6 text-xs text-gray-300 italic font-medium">Aucun cours programmé</td>
                      </tr>
                    );
                  }

                  return dayCourses.map((e, idx) => (
                    <tr key={`${day}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                      {idx === 0 && (
                        <td className="px-8 py-6 font-black text-[#003366]" rowSpan={dayCourses.length}>{day}</td>
                      )}
                      <td className="px-8 py-6 font-bold text-[#003366] flex items-center gap-2">
                        <BookOpen size={16} className="text-[#D4AF37]" />
                        {e.course.name}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600 font-black">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          {e.course.timeStart} - {e.course.timeEnd}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#003366]/5 text-[#003366] rounded-lg text-[10px] font-black uppercase tracking-wider">{e.course.level}</span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section Examens */}
      {examSchedules.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-black text-[#003366]">Calendrier des Examens</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {examSchedules.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:border-amber-200 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{item.sessionTitle}</span>
                    <h3 className="font-black text-[#003366] text-lg">{item.moduleName}</h3>
                  </div>
                  <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">
                    {item.moduleCode}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Calendar size={16} className="text-blue-500" />
                    {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Clock size={16} className="text-blue-500" />
                    {item.timeStart} - {item.timeEnd}
                  </div>
                  {item.room && (
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <MapPin size={16} className="text-blue-500" />
                      Salle : {item.room}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 && examSchedules.length === 0 && (
        <div className="p-10 bg-blue-50/50 rounded-[2rem] border border-dashed border-blue-100 text-center">
          <p className="text-blue-900/60 font-bold">Vous n&apos;avez pas encore d&apos;inscriptions validées ni d&apos;examens programmés.</p>
        </div>
      )}
    </div>
  );
}
