"use client";
import React, { useState, useEffect } from 'react';
import { Search, Settings, SquarePen, MoreHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from "@/hooks/useTranslations";

import { toast } from 'react-hot-toast';

const ChatSidebar = ({ conversations, activeId, onSelect, currentUser, onStartNewChat }) => {
  const { t, loaded } = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [isSearchingContacts, setIsSearchingContacts] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  // Correction : S'assurer que le défilement horizontal des favoris ne casse pas le layout
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Charger les contacts initiaux et les demandes d'amis
  useEffect(() => {
    fetchContacts();
    fetchRequests();
  }, [currentUser.id]);

  // Recherche avec debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetchContacts(searchTerm);
      } else if (searchTerm === "") {
        fetchContacts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContacts = async (query = "") => {
    setIsSearchingContacts(true);
    try {
      const url = query ? `/api/messages/contacts?search=${encodeURIComponent(query)}` : "/api/messages/contacts";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAllContacts(data);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setIsSearchingContacts(false);
    }
  };

  const fetchRequests = async () => {
    if (currentUser.userType === "STUDENT") {
      try {
        const res = await fetch('/api/friends/request');
        if (res.ok) {
          const data = await res.json();
          setFriendRequests(data || []);
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    }
  };

  const handleSendFriendRequest = async (targetId) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
      });
      if (res.ok) {
        toast.success(t("messaging.requestSent"));
        // Rafraîchir les contacts pour mettre à jour le statut
        fetchContacts(searchTerm);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/friends/request/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "ACCEPTED" })
      });
      if (res.ok) {
        toast.success(t("messaging.requestAccepted"));
        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
        fetchContacts(searchTerm);
      }
    } catch (err) {
      toast.error("Erreur");
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants?.find(p =>
      (p.candidateId && p.candidateId !== currentUser.id) ||
      (p.adminId && p.adminId !== currentUser.id)
    );
    const name = otherParticipant?.candidate
      ? `${otherParticipant.candidate.firstName} ${otherParticipant.candidate.lastName}`
      : otherParticipant?.admin?.name || t("messaging.inconnu");
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.role === "SECRETARY" || currentUser.role === "ACCOUNTANT";

  // Contacts suggérés
  const filteredContacts = allContacts.filter(contact => {
    if (contact.id === currentUser.id) return false;
    
    // Si on cherche activement, on montre tout le monde
    if (searchTerm) {
      return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    // Si pas de recherche, on ne montre que ceux qui n'ont pas encore de discussion
    const alreadyHasConv = conversations.some(conv =>
      conv.participants?.some(p => p.adminId === contact.id || p.candidateId === contact.id)
    );
    if (alreadyHasConv) return false;
    
    // Pour les admins, on montre tout par défaut
    return isAdmin;
  });

  const favorites = filteredConversations.slice(0, 5);

  if (!loaded) return null;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 pb-2">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003366] flex items-center justify-center text-white font-black text-xs">
              M
            </div>
            <h2 className="text-xl font-black text-[#003366] tracking-tight">{t("messaging.title")}</h2>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-[#003366]">
            <Settings size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative group">
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${searchTerm ? 'text-[#003366]' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder={t("messaging.searchDiscussion")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-10 text-sm outline-none focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors z-10 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Demandes d'amis (pour les étudiants) */}
        {friendRequests.length > 0 && (
          <div className="mb-6 px-1">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">{t("messaging.pendingRequests")} ({friendRequests.length})</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {friendRequests.map(req => (
                <div key={req.id} className="bg-white p-3 rounded-2xl border border-amber-100 flex items-center justify-between gap-2 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#003366] truncate">{req.sender.firstName} {req.sender.lastName}</p>
                    <p className="text-[9px] text-gray-400">Étudiant ({req.sender.level})</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => handleAcceptRequest(req.id)}
                      className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <span className="text-[10px] font-bold">OK</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {/* Nouveaux Contacts / Liste Étudiants */}
        {(searchTerm || isAdmin) && filteredContacts.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mb-3 px-2">
              {isAdmin ? t("messaging.allStudents") : t("messaging.newContacts")}
            </p>
            <div className="space-y-1">
              {filteredContacts.map(contact => {
                const canMessage = isAdmin || 
                                 contact.userType === "ADMIN" || 
                                 contact.isFriend;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={contact.id}
                    onClick={() => {
                      if (canMessage) {
                        onStartNewChat(contact.id, contact.userType);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border border-transparent ${canMessage ? 'cursor-pointer hover:bg-white hover:shadow-md hover:border-gray-100' : 'opacity-70'} mb-1 group`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#003366] font-black text-xs group-hover:scale-110 transition-transform shrink-0">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#003366] truncate">{contact.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium truncate">{contact.role}</p>
                      </div>
                    </div>
                    
                    {/* Bouton d'action si étudiant-étudiant non amis */}
                    {!canMessage && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (contact.friendStatus !== "PENDING") {
                            handleSendFriendRequest(contact.id);
                          }
                        }}
                        disabled={contact.friendStatus === "PENDING"}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                          contact.friendStatus === "PENDING" 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-[#003366] text-white hover:bg-[#004488]"
                        }`}
                      >
                        {contact.friendStatus === "PENDING" ? t("messaging.pending") : t("messaging.add")}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <p className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mb-3 px-2">{t("messaging.discussions")}</p>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => {
            const otherParticipant = conv.participants?.find(p =>
              (p.candidateId && p.candidateId !== currentUser.id) ||
              (p.adminId && p.adminId !== currentUser.id)
            );
            const name = otherParticipant?.candidate
              ? `${otherParticipant.candidate.firstName} ${otherParticipant.candidate.lastName}`
              : otherParticipant?.admin?.name || t("messaging.inconnu");
            const role = otherParticipant?.candidate ? t("messaging.student") : t("messaging.staff");
            const lastMessage = conv.messages[0];
            const isUnread = lastMessage && !lastMessage.read && lastMessage.senderId !== currentUser.id;

            return (
              <motion.div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer border relative group ${
                  activeId === conv.id
                    ? 'bg-white shadow-lg border-[#003366]/10 scale-[1.02] z-10'
                    : 'hover:bg-white hover:shadow-md border-transparent hover:border-gray-100'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform ${
                    activeId === conv.id ? 'bg-[#003366] text-white shadow-inner' : 'bg-blue-50 text-[#003366]'
                  }`}>
                    {name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full border border-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black text-sm truncate ${activeId === conv.id ? 'text-[#003366]' : 'text-slate-700'}`}>
                      {name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${isUnread ? 'font-black text-[#003366]' : 'text-gray-400 font-medium'}`}>
                      {lastMessage ? lastMessage.content : t("messaging.startConversation")}
                    </p>
                    {isUnread && (
                      <div className="w-2 h-2 bg-[#003366] rounded-full animate-pulse shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 opacity-30 grayscale">
            <Search size={40} className="mb-4 text-[#003366]" />
            <p className="text-xs font-bold text-[#003366] uppercase tracking-widest">{t("messaging.noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
