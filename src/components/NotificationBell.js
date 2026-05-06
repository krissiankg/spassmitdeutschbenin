"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell({ apiUrl }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [apiUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(apiUrl, { method: "PUT" });
      // Update local state to show all as read immediately
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2.5 text-gray-500 hover:text-[#003366] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative transition-all"
        title="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-[#1E1E1E] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-[#003366] dark:text-gray-100 flex items-center gap-2">
                <Bell size={16} /> Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm text-gray-400">Aucune notification</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${
                      n.isRead ? "opacity-60" : "bg-blue-50/20 dark:bg-blue-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                         n.type === "SUCCESS" ? "bg-green-500" : 
                         n.type === "WARNING" ? "bg-orange-500" : 
                         n.type === "MESSAGE" ? "bg-blue-500" : "bg-gray-400"
                       }`} />
                       <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold ${
                          n.type === "SUCCESS" ? "text-green-600 dark:text-green-400" : 
                          n.type === "WARNING" ? "text-orange-500" : 
                          "text-[#003366] dark:text-gray-200"
                        } mb-1 truncate`}>
                          {n.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
                          {new Date(n.createdAt).toLocaleDateString()} à{" "}
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-[10px] font-bold text-gray-500 hover:text-[#003366] dark:hover:text-white transition-colors">
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
