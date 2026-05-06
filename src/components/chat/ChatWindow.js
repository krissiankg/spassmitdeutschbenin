"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, Settings, Info, Image as ImageIcon, Smile, Send, Paperclip, File, Download, X, Bell, Moon, Trash2, Shield, Mic, MicOff, VideoOff, PhoneOff, Maximize2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTranslations } from "@/hooks/useTranslations";

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const ChatWindow = ({ conversation, messages, onSendMessage, currentUser, onBack }) => {
  const { t, loaded } = useTranslations();
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // 'audio' or 'video'
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!loaded) return null;

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-12 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#003366] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#003366] rounded-full blur-[120px]"></div>
        </div>
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#003366]/5 rounded-[2rem] flex items-center justify-center mb-6 rotate-12 shadow-inner">
          <Send size={32} className="text-[#003366]/20 lg:w-10 lg:h-10 -rotate-12" />
        </div>
        <h3 className="text-lg lg:text-2xl font-black text-[#003366] mb-2">{t("messaging.title")}</h3>
        <p className="text-xs lg:text-sm text-gray-400 max-w-xs leading-relaxed">{t("messaging.subtitle")}</p>
      </div>
    );
  }

  const otherParticipant = conversation.participants?.find(p =>
    (p.candidateId && p.candidateId !== currentUser.id) ||
    (p.adminId && p.adminId !== currentUser.id)
  );
  const name = otherParticipant?.candidate
    ? `${otherParticipant.candidate.firstName} ${otherParticipant.candidate.lastName}`
    : otherParticipant?.admin?.name || t("messaging.inconnu");

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        onSendMessage("", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const jitsiRoomName = `SpassMitDeutsch-${conversation.id}`;
  const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}#config.startWithAudioMuted=${activeCall === 'video'}&config.startWithVideoMuted=${activeCall === 'audio'}`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F8FAFC]/50">
      {/* Call UI Overlay */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <div className="p-4 lg:p-6 flex items-center justify-between text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center font-black text-sm lg:text-base">
                  {name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm lg:text-base">{name}</h4>
                  <p className="text-[10px] lg:text-xs text-green-400 animate-pulse">{t("messaging.calling")}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCall(null)}
                className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 hover:bg-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={20} className="lg:w-6 lg:h-6" />
              </button>
            </div>

            <div className="flex-1 bg-gray-900 overflow-hidden m-2 lg:m-4 rounded-2xl lg:rounded-[2rem] border border-white/10 relative shadow-2xl">
              <iframe
                src={jitsiUrl}
                className="w-full h-full border-none"
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="h-20 px-4 lg:px-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-[#003366] transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-xl lg:rounded-2xl bg-[#003366] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-900/10">
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-[#003366] text-sm lg:text-base leading-tight truncate">{name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("messaging.online")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2 relative shrink-0">
          <div className="hidden sm:flex items-center gap-1 mr-2 border-r border-gray-100 pr-2">
            <button
              onClick={() => setActiveCall('audio')}
              className="p-2 lg:p-2.5 text-gray-400 hover:bg-[#003366]/5 hover:text-[#003366] rounded-xl transition-all"
            >
              <Phone size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => setActiveCall('video')}
              className="p-2 lg:p-2.5 text-gray-400 hover:bg-[#003366]/5 hover:text-[#003366] rounded-xl transition-all"
            >
              <Video size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 lg:p-2.5 rounded-xl transition-all ${showSettings ? 'bg-[#003366] text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-50 hover:text-[#003366]'}`}
            >
              <Settings size={20} className="lg:w-5 lg:h-5" />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-[100]"
                >
                  <h4 className="text-sm font-black text-[#003366] mb-4 uppercase tracking-wider">{t("messaging.settings")}</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Bell size={16} /></div>
                        <span className="text-xs font-bold text-gray-600">{t("messaging.notifications")}</span>
                      </div>
                      <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center"><Moon size={16} /></div>
                        <span className="text-xs font-bold text-gray-600">{t("messaging.darkMode")}</span>
                      </div>
                      <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-colors text-xs font-bold">
                        <Trash2 size={16} />
                        {t("messaging.deleteChat")}
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-500 rounded-2xl transition-colors text-xs font-bold mt-1">
                        <Shield size={16} />
                        {t("messaging.block")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="p-2 lg:p-2.5 text-gray-400 hover:bg-gray-50 hover:text-[#003366] rounded-xl transition-all">
            <Info size={20} className="lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 scroll-smooth custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#003366]/20">
              <Smile size={32} />
            </div>
            <p className="text-sm font-bold text-[#003366]">{t("messaging.sayHello")}</p>
            <p className="text-xs text-gray-400 mt-1">{t("messaging.startPrompt")}</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = (msg.senderCandidateId === currentUser.id) || (msg.senderAdminId === currentUser.id);

          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 lg:gap-3`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-lg bg-[#003366]/5 flex items-center justify-center text-[#003366] font-bold text-[10px] shrink-0 mb-1 border border-[#003366]/10">
                  {name.charAt(0)}
                </div>
              )}
              <div className={`max-w-[85%] lg:max-w-[70%] group relative`}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-3.5 lg:p-4 rounded-2xl lg:rounded-[1.75rem] text-xs lg:text-[13px] leading-relaxed shadow-sm ${isMe
                    ? 'bg-[#003366] text-white rounded-br-none shadow-blue-900/10'
                    : 'bg-white text-gray-700 rounded-bl-none border border-gray-100 shadow-sm'
                    }`}
                >
                  {msg.attachmentUrl && (
                    <div className="mb-3 overflow-hidden rounded-xl lg:rounded-2xl border border-black/5 bg-black/5">
                      {msg.attachmentType?.startsWith('image/') ? (
                        <img src={msg.attachmentUrl} alt={msg.attachmentName} className="w-full h-auto block hover:scale-105 transition-transform cursor-pointer" />
                      ) : (
                        <div className={`p-3 lg:p-4 flex items-center gap-2 lg:gap-3 ${isMe ? 'bg-white/10' : 'bg-gray-50'}`}>
                          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center ${isMe ? 'bg-white/20 text-white' : 'bg-white text-[#003366] shadow-sm'}`}>
                            <File size={16} className="lg:w-5 lg:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold truncate text-[10px] lg:text-xs ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.attachmentName}</p>
                            <p className={`text-[8px] lg:text-[10px] uppercase font-black ${isMe ? 'text-white/60' : 'text-gray-400'}`}>{t("messaging.file")}</p>
                          </div>
                          <a
                            href={msg.attachmentUrl}
                            download={msg.attachmentName}
                            target="_blank"
                            className={`p-2 rounded-lg transition-colors ${isMe ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-500'}`}
                          >
                            <Download size={16} className="lg:w-[18px] lg:h-[18px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.content}
                </motion.div>
                <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end px-1' : 'justify-start px-1'}`}>
                  <p className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isMe && (
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`}>
                      ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 lg:p-8 bg-white border-t border-gray-50 shrink-0">
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                ref={emojiPickerRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 lg:left-0 mb-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden max-w-[calc(100vw-2rem)]"
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width="100%"
                  height={350}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                  searchDisabled={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 lg:gap-4 bg-gray-50 p-2 lg:p-3 pl-4 lg:pl-6 rounded-[1.5rem] lg:rounded-[2rem] border border-gray-100 shadow-inner focus-within:bg-white focus-within:border-[#003366]/20 focus-within:ring-4 focus-within:ring-[#003366]/5 transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 text-gray-400 hover:text-[#003366] transition-all disabled:opacity-50 shrink-0 hover:scale-110 active:scale-90"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Paperclip size={20} className="lg:w-6 lg:h-6" />
              )}
            </button>

            <input
              type="text"
              placeholder={t("messaging.typeMessage")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none text-sm lg:text-base text-gray-700 py-2 min-w-0 placeholder:text-gray-400 placeholder:font-medium"
            />

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 transition-all shrink-0 hover:scale-110 active:scale-90 ${showEmojiPicker ? 'text-[#003366]' : 'text-gray-400 hover:text-[#003366]'}`}
            >
              <Smile size={20} className="lg:w-6 lg:h-6" />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isUploading}
              className="w-10 h-10 lg:w-12 lg:h-12 bg-[#003366] text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:grayscale disabled:scale-100 shrink-0"
            >
              <Send size={18} className="lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
