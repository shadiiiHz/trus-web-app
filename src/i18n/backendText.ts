/**
 * Translation for text the backend serves in English only (service
 * descriptions, unit labels, plan names, status messages, …).
 *
 * Each `{locale}.json` has a top-level `backendText` map from the exact
 * English string to its translation. A `{n}` in a key matches any number and
 * is carried over into the translation, so one entry covers
 * "(2 posts per day included)", "(15 posts per day included)", etc.
 *
 * Text with no entry (and all text in English) is returned unchanged, so a
 * new backend string shows up in English until it's added to the dictionaries.
 *
 * Usage — anywhere, for any backend field:
 *   localizeBackendText(service.description)
 *   localizeBackendFields(service, ["description", "unitLabel"])
 */
import { getLocale, locales, useLocale, type Locale } from "./index";

type Dictionary = Record<string, string>;
type Pattern = { regex: RegExp; target: string };

const NUMBER = "(\\d+(?:[.,]\\d+)?)";
const patternCache = new Map<Locale, Pattern[]>();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dictionaryFor(locale: Locale): Dictionary {
  return (locales[locale] as { backendText?: Dictionary }).backendText ?? {};
}

function patternsFor(locale: Locale): Pattern[] {
  let patterns = patternCache.get(locale);
  if (!patterns) {
    patterns = Object.entries(dictionaryFor(locale))
      .filter(([source]) => source.includes("{n}"))
      .map(([source, target]) => ({
        regex: new RegExp(`^${source.split("{n}").map(escapeRegExp).join(NUMBER)}$`, "i"),
        target,
      }));
    patternCache.set(locale, patterns);
  }
  return patterns;
}

/** Translates one English backend string into `locale` (the active locale by default). */
export function localizeBackendText(
  text: string | null | undefined,
  locale: Locale = getLocale(),
): string {
  if (!text) return text ?? "";
  const trimmed = text.trim();

  const exact = dictionaryFor(locale)[trimmed];
  if (exact !== undefined) return exact;

  for (const { regex, target } of patternsFor(locale)) {
    const match = trimmed.match(regex);
    if (match) {
      const numbers = match.slice(1);
      let i = 0;
      return target.replace(/\{n\}/g, () => numbers[i++] ?? "");
    }
  }
  return text;
}

/** Returns a copy of `item` with the given string fields translated. */
export function localizeBackendFields<T extends object, K extends keyof T>(
  item: T,
  fields: readonly K[],
  locale: Locale = getLocale(),
): T {
  const copy = { ...item };
  for (const field of fields) {
    const value = copy[field];
    if (typeof value === "string") {
      copy[field] = localizeBackendText(value, locale) as T[K];
    }
  }
  return copy;
}

/**
 * Hook form: re-renders the component on a language switch and returns a
 * translator bound to the active locale.
 */
export function useBackendText(): (text: string | null | undefined) => string {
  const locale = useLocale();
  return (text) => localizeBackendText(text, locale);
}
