import { useId } from "react";
import { useLocale, setLocale, type Locale } from "@/i18n";

interface LanguageOption {
  code: Locale;
  label: string;
  Flag: React.FC;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "EN", Flag: FlagGB },
  { code: "de", label: "DE", Flag: FlagDE },
];

const LANGUAGE_BY_CODE = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
) as Record<Locale, LanguageOption>;

function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "de" : "en";
}

export interface LanguageSwitchProps {
  className?: string;
}

/**
 * Switches locale while keeping whatever the user is currently looking at
 * pinned in place. Translated text (esp. German, which runs noticeably
 * longer than English) reflows section heights above the viewport, which
 * shifts everything below by a few dozen pixels even though `scrollY`
 * itself doesn't change — that shift reads as a jump/jitter to the user.
 * Fix: snapshot the element at viewport-centre before the switch, then
 * scroll by however far that same element moved once the new text has
 * been laid out.
 */
// Same top-level sections/order as App.tsx (and Navbar's own scroll-spy) —
// real content landmarks, not decorative layers, so they're a reliable
// thing to re-measure after the text swap.
const SECTION_IDS = [
  "about",
  "portfolio",
  "why-us",
  "templates",
  "services",
  "team",
  "testimonials",
  "contact",
  "footer",
] as const;

/** The deepest section the user has already scrolled into (its top is at or above the viewport top), or null if still above `#about` (in the Hero). */
function findScrollAnchorSection(): HTMLElement | null {
  let current: HTMLElement | null = null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 0) {
      current = el;
    }
  }
  return current;
}

// How long to keep re-pinning the anchor after a switch. Layout can keep
// settling a little past the initial React re-render — a webfont glyph
// swap or an image resolving its intrinsic size both reflow text a beat
// later — so one correction isn't always enough.
const REPIN_WINDOW_MS = 500;

function selectLocale(code: Locale) {
  const anchor = typeof document !== "undefined" ? findScrollAnchorSection() : null;
  const targetTop = anchor?.getBoundingClientRect().top;

  setLocale(code);

  if (!anchor || targetTop == null) return;

  // If the user starts scrolling themselves, stop fighting them — the
  // re-pinning is only meant to counteract layout shift from the text
  // swap, not to lock the page in place.
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const listenerOpts: AddEventListenerOptions = { passive: true, once: true };
  window.addEventListener("wheel", cancel, listenerOpts);
  window.addEventListener("touchstart", cancel, listenerOpts);
  window.addEventListener("keydown", cancel, listenerOpts);

  const stopListening = () => {
    window.removeEventListener("wheel", cancel, listenerOpts);
    window.removeEventListener("touchstart", cancel, listenerOpts);
    window.removeEventListener("keydown", cancel, listenerOpts);
  };

  const deadline = performance.now() + REPIN_WINDOW_MS;
  const tick = () => {
    if (cancelled) {
      stopListening();
      return;
    }
    const delta = anchor.getBoundingClientRect().top - targetTop;
    if (delta !== 0) window.scrollBy(0, delta);
    if (performance.now() < deadline) {
      requestAnimationFrame(tick);
    } else {
      stopListening();
    }
  };
  requestAnimationFrame(tick);
}

/** Plain "EN 🇬🇧" text+flag indicator — click to toggle to the other language. */
export function LanguageSwitch({ className = "" }: LanguageSwitchProps) {
  const locale = useLocale();
  const current = LANGUAGE_BY_CODE[locale];
  const next = otherLocale(locale);

  return (
    <button
      type="button"
      onClick={() => selectLocale(next)}
      aria-label={`Language: ${current.label}. Switch to ${LANGUAGE_BY_CODE[next].label}`}
      className={`flex cursor-pointer items-center gap-2 text-[15px] font-normal text-brand-white/90 transition-colors hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:rounded ${className}`}
    >
      {current.label}
      <current.Flag />
    </button>
  );
}

function FlagGB() {
  const id = useId();
  return (
    <svg
      width="26"
      height="16.34"
      viewBox="0 0 60 30"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <clipPath id={`${id}-s`}>
        <rect width="60" height="30" />
      </clipPath>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}-s)`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 60,30 M60,0 0,30"
          clipPath={`url(#${id}-t)`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagDE() {
  return (
    <svg
      width="26"
      height="16.34"
      viewBox="0 0 18 13"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect y="0" width="18" height="4.33" fill="#000000" />
      <rect y="4.33" width="18" height="4.33" fill="#DD0000" />
      <rect y="8.66" width="18" height="4.34" fill="#FFCE00" />
    </svg>
  );
}

export default LanguageSwitch;
