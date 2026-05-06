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
 * Generate a robust temporary password for LMS.
 */
export function generateLmsPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#!';
  const all = upper + lower + digits + special;
  
  // Ensure at least one of each type
  let pwd = upper[Math.floor(Math.random() * upper.length)]
          + lower[Math.floor(Math.random() * lower.length)]
          + digits[Math.floor(Math.random() * digits.length)]
          + special[Math.floor(Math.random() * special.length)];
          
  // Add 5 more random characters
  for (let i = 0; i < 5; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}
