/**
 * i18n foundation.
 *
 * Each `{locale}.json` file is the single source of truth for every
 * user-facing string on the site, grouped by section. `site.config.ts`
 * composes this text with structural data (hrefs, ids, colours, image URLs)
 * so components keep a single import.
 *
 * The active locale lives in a tiny external store (below), persisted to
 * `localStorage`. `useLocale()` subscribes a component to changes; `setLocale()`
 * switches it. Components that read `siteConfig`/`t` during render (the
 * pattern used throughout this codebase) automatically show the new
 * language once something up the tree re-renders after a switch.
 */
import { useSyncExternalStore } from "react";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";
import de from "./de.json";
import ru from "./ru.json";

export const defaultLocale = "en" as const;

export const locales = { en, fr, es, de, ru } as const;

export type Locale = keyof typeof locales;

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ru: "Русский",
};

const STORAGE_KEY = "trus-locale";

function isLocale(value: string | null): value is Locale {
  return value != null && value in locales;
}

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

let currentLocale: Locale = readInitialLocale();
const listeners = new Set<() => void>();

/** Reads the active locale outside of React (e.g. from `site.config.ts`). */
export function getLocale(): Locale {
  return currentLocale;
}

/** Switches the active locale, persists it, and notifies every `useLocale()` subscriber. */
export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Subscribes the calling component to locale changes, re-rendering it on switch. */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => defaultLocale);
}

/** The resolved translation dictionary for the active locale, read live. */
export const t = new Proxy({} as (typeof locales)[Locale], {
  get(_target, prop: string | symbol) {
    return (locales[currentLocale] as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Dot-path accessor for translations, e.g. `tr('hero.cta.primary')`.
 * Returns the path itself if the key is missing, so a typo is visible in the UI
 * rather than throwing. Prefer the typed `t` object above where possible.
 */
export function tr(path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc != null ? (acc as Record<string, unknown>)[key] : undefined),
      locales[currentLocale],
    );
  return typeof value === "string" ? value : path;
}

export { en, fr, es, de, ru };
export default t;
