"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ChatLayout from '@/components/chat/ChatLayout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatProfileDetails from '@/components/chat/ChatProfileDetails';
import { toast } from 'react-hot-toast';
import { useTranslations } from "@/hooks/useTranslations";

export default function MessagingPage() {
  const { data: session } = useSession();
  const { t, loaded } = useTranslations();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);

      // Polling pour les nouveaux messages et mise à jour de la sidebar
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id, true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId, isPolling = false) => {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        // Pour éviter le scroll automatique intempestif si pas de nouveau message
        if (!isPolling || data.length !== messages.length) {
          setMessages(data);
          // Si on est en polling et qu'il y a de nouveaux messages, on refresh la sidebar
          if (isPolling && data.length > messages.length) {
            fetchConversations();
          }
        }
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  const handleSendMessage = async (content, attachment = null) => {
    if (!activeConversation) return;

    try {
      const res = await fetch(`/api/messages/${activeConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachmentUrl: attachment?.url,
          attachmentType: attachment?.type,
          attachmentName: attachment?.name
        })
      });

      if (res.ok) {
        fetchMessages(activeConversation.id);
        fetchConversations(); // Update sidebar last message
      } else {
        toast.error(t("messaging.sendFailed"));
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(t("messaging.serverError"));
    }
  };

  const handleStartNewChat = async (targetId, targetType) => {
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType })
      });

      if (res.ok) {
        const newConv = await res.json();
        await fetchConversations();
        setActiveConversation(newConv);
      } else {
        toast.error(t("messaging.openChatFailed"));
      }
    } catch (err) {
      console.error("Start new chat error:", err);
      toast.error(t("messaging.openChatError"));
    }
  };

  if (loading || !loaded) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center bg-white rounded-[2.5rem]">
        <div className="w-12 h-12 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Obtenir les infos du contact actif pour le panneau de droite
  const activeContact = (activeConversation && activeConversation.participants) ? (() => {
    const p = activeConversation.participants?.find(p =>
      (p.candidateId && p.candidateId !== session.user.id) ||
      (p.adminId && p.adminId !== session.user.id)
    );
    return {
      name: p?.candidate ? `${p.candidate.firstName} ${p.candidate.lastName}` : p?.admin?.name || t("messaging.inconnu"),
      email: p?.candidate ? p.candidate.email : p?.admin?.email || "",
      role: p?.candidate ? t("messaging.student") : p?.admin?.role || t("messaging.staff")
    };
  })() : null;

  return (
    <ChatLayout>
      <div className={`${activeConversation ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 border-r border-gray-50 h-full flex-shrink-0 min-w-0`}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
          onStartNewChat={handleStartNewChat}
          currentUser={session?.user || {}}
        />
      </div>

      <div className={`${activeConversation ? 'flex' : 'hidden'} lg:flex flex-1 h-full`}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={session?.user || {}}
          onBack={() => setActiveConversation(null)}
        />
      </div>

      <div className="hidden xl:flex w-72 border-l border-gray-50 h-full">
        <ChatProfileDetails user={activeContact} />
      </div>
    </ChatLayout>
  );
}
