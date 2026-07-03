/**
 * i18n foundation.
 *
 * `en.json` is the single source of truth for every user-facing string on the
 * site, grouped by section. `site.config.ts` composes this text with structural
 * data (hrefs, ids, colours, image URLs) so components keep a single import.
 *
 * Multiple languages are NOT implemented yet — this only prepares the
 * architecture. To add a locale later: drop in `fr.json`, register it in
 * `locales`, and switch `currentLocale` (e.g. via React context).
 */
import en from './en.json'

export const defaultLocale = 'en' as const

export type Locale = typeof defaultLocale

export const locales = { en } as const

/** Active locale. Wire this to user/browser preference when i18n ships. */
export const currentLocale: Locale = defaultLocale

/** The resolved translation dictionary for the active locale. */
export const t = locales[currentLocale]

/**
 * Dot-path accessor for translations, e.g. `tr('hero.cta.primary')`.
 * Returns the path itself if the key is missing, so a typo is visible in the UI
 * rather than throwing. Prefer the typed `t` object above where possible.
 */
export function tr(path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc != null ? (acc as Record<string, unknown>)[key] : undefined), t)
  return typeof value === 'string' ? value : path
}

export { en }
export default t
