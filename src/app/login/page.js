"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error || "Erreur d'authentification");
      } else {
        toast.success("Connexion réussie !");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative">
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#003366] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group"
      >
        <Home size={18} className="group-hover:scale-110 transition-transform" />
        <span>Retour à l&apos;accueil</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-900/5 mb-6 group hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-[#003366] tracking-tight mb-2">Bienvenue</h1>
          <p className="text-gray-500 font-medium">Espace Administration | Spass mit Deutsch</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Professionnel</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003366] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none text-gray-900 font-medium"
                  placeholder="admin@spassmitdeutsch.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mot de passe</label>
                <button type="button" className="text-[10px] font-bold text-[#003366] hover:underline uppercase tracking-tighter">Oublié ?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003366] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#003366] transition-all outline-none text-gray-900 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-70 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Se connecter <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Seuls les administrateurs et secrétaires autorisés peuvent accéder à cet espace. Toutes les tentatives de connexion sont enregistrées.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-gray-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Spass mit Deutsch Benin. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
