"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ 
  total, 
  page, 
  limit, 
  onPageChange, 
  onLimitChange,
  loading = false 
}) {
  const totalPages = Math.ceil(total / limit);
  if (total === 0) return null;

  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Affichage de <span className="font-bold text-gray-800 dark:text-gray-200">{startRange}-{endRange}</span> sur <span className="font-bold text-gray-800 dark:text-gray-200">{total}</span>
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Par page:</span>
          <select 
            value={limit} 
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            disabled={loading}
            className="text-xs bg-gray-50 dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#003366] outline-none"
          >
            {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {/* Simple version: Page X sur Y */}
          <span className="px-3 py-1.5 text-xs font-bold text-[#003366] dark:text-gray-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
            Page {page} <span className="text-gray-400 font-normal mx-1">sur</span> {totalPages}
          </span>
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
