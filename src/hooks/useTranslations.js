"use client";
import { useState, useEffect, useCallback } from "react";

// Supported locales and default
const LOCALES = ["fr", "en", "de"];
const DEFAULT_LOCALE = "fr";

// Cache for loaded message bundles
const messageCache = {};

async function loadMessages(locale) {
  if (messageCache[locale]) return messageCache[locale];
  try {
    const mod = await import(`../../messages/${locale}.json`);
    messageCache[locale] = mod.default;
    return mod.default;
  } catch {
    const fallback = await import(`../../messages/${DEFAULT_LOCALE}.json`);
    messageCache[DEFAULT_LOCALE] = fallback.default;
    return fallback.default;
  }
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return acc[key];
    return undefined;
  }, obj);
}

/**
 * Client-side translation hook.
 * Usage: const { t, locale, changeLocale } = useTranslations();
 *        t("nav.dashboard") => "Tableau de bord" | "Dashboard" | "Übersicht"
 */
export function useTranslations() {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [messages, setMessages] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Read cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const stored = getCookie("NEXT_LOCALE") || DEFAULT_LOCALE;
    const validLocale = LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
    setLocale(validLocale);

    loadMessages(validLocale).then((msgs) => {
      setMessages(msgs);
      setLoaded(true);
    });
  }, []);

  const t = useCallback(
    (key, params = {}) => {
      const value = getNestedValue(messages, key);
      if (!value) return key;
      if (typeof value !== "string") return key;
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    },
    [messages]
  );

  const t_raw = useCallback(
    (key) => {
      return getNestedValue(messages, key);
    },
    [messages]
  );

  // Attach raw to t
  t.raw = t_raw;

  return { t, locale, loaded };
}
