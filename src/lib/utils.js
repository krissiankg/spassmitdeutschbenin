import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display.
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Generate a unique consultation code.
 */
export function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
