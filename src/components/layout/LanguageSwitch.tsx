import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, setLocale, localeNames, type Locale } from "@/i18n";

type FlagFit = "slice" | "meet";

interface LanguageOption {
  code: Locale;
  label: string;
  name: string;
  Flag: React.FC<{ fit: FlagFit }>;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "EN", name: localeNames.en, Flag: FlagGB },
  { code: "fr", label: "FR", name: localeNames.fr, Flag: FlagFR },
  { code: "es", label: "ES", name: localeNames.es, Flag: FlagES },
  { code: "de", label: "DE", name: localeNames.de, Flag: FlagDE },
  { code: "ru", label: "RU", name: localeNames.ru, Flag: FlagRU },
];

const LANGUAGE_BY_CODE = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
) as Record<Locale, LanguageOption>;

export interface LanguageSwitchProps {
  className?: string;
}

/**
 * Switches locale while keeping whatever the user is currently looking at
 * pinned in place. Translated text (esp. German/Russian, which run noticeably
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

/** "EN [flag] ⌄" trigger that opens a dropdown listing every language in `locales`. */
export function LanguageSwitch({ className = "" }: LanguageSwitchProps) {
  const locale = useLocale();
  const current = LANGUAGE_BY_CODE[locale];
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Room needed for the full option list (5 rows + padding). Flip the panel
  // above the trigger when there isn't enough space below — e.g. the mobile
  // menu's switcher sits near the bottom of the viewport.
  const PANEL_HEIGHT_ESTIMATE = 300;

  useEffect(() => {
    if (!open) return;

    const spaceBelow = rootRef.current
      ? window.innerHeight - rootRef.current.getBoundingClientRect().bottom
      : Infinity;
    setOpenUp(spaceBelow < PANEL_HEIGHT_ESTIMATE);

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (code: Locale) => {
    setOpen(false);
    if (code !== locale) selectLocale(code);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Language: ${current.name}. Open language menu`}
        className="flex cursor-pointer items-center gap-2 text-body font-normal transition-colors text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:rounded"
      >
        {current.label}
        <TriggerFlag Flag={current.Flag} />
        <ChevronDown
          size={12}
          strokeWidth={4}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Select language"
          className={`absolute left-1/2 z-50 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border py-1 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 ${openUp ? "bottom-[calc(100%+14px)]" : "top-[calc(100%+14px)]"}`}
          style={{
            background: "rgba(9, 5, 9, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        >
          {LANGUAGES.map((lang, index) => {
            const selected = lang.code === locale;
            return (
              <li key={lang.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(lang.code)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10 ${index > 0 ? "border-t" : ""}`}
                  style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                >
                  <MenuFlagBadge Flag={lang.Flag} />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-medium text-brand-white">{lang.name}</span>
                    <span className="text-[13px] text-brand-muted">{lang.label}</span>
                  </span>
                  {selected && (
                    <Check
                      size={18}
                      strokeWidth={3}
                      className="ml-auto shrink-0"
                      style={{ color: "var(--color-brand-accent)" }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Navbar trigger flag — the flag graphic itself, cropped to fill a fixed 28×16.34 rect. */
function TriggerFlag({ Flag }: { Flag: React.FC<{ fit: FlagFit }> }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: 28, height: 16.34 }}
    >
      <Flag fit="slice" />
    </span>
  );
}

/** Menu row flag — a 24×24 white square with the flag shown smaller, centred, uncropped. */
function MenuFlagBadge({ Flag }: { Flag: React.FC<{ fit: FlagFit }> }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden bg-white"
      style={{ width: 24, height: 24, borderRadius: 4 }}
    >
      <span className="inline-flex" style={{ width: 16, height: 16 }}>
        <Flag fit="meet" />
      </span>
    </span>
  );
}

function FlagGB({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M30 0H0V19.9998H30V0Z" fill="#F0F0F0" />
      <path
        d="M16.875 0H13.125V8.1248H0V11.8747H13.125V19.9995H16.875V11.8747H30V8.1248H16.875V0Z"
        fill="#D80027"
      />
      <path d="M23.0742 13.478L30.0009 17.3262V13.478H23.0742Z" fill="#0052B4" />
      <path d="M18.2617 13.478L30.0009 19.9996V18.1555L21.5813 13.478H18.2617Z" fill="#0052B4" />
      <path d="M26.8739 19.9998L18.2617 15.2148V19.9998H26.8739Z" fill="#0052B4" />
      <path d="M18.2617 13.478L30.0009 19.9996V18.1555L21.5813 13.478H18.2617Z" fill="#F0F0F0" />
      <path d="M18.2617 13.478L30.0009 19.9996V18.1555L21.5813 13.478H18.2617Z" fill="#D80027" />
      <path d="M5.29341 13.478L0 16.4188V13.478H5.29341Z" fill="#0052B4" />
      <path d="M11.7397 14.3071V19.9995H1.49414L11.7397 14.3071Z" fill="#0052B4" />
      <path d="M8.41951 13.478L0 18.1555V19.9996L11.7391 13.478H8.41951Z" fill="#D80027" />
      <path d="M6.92665 6.52147L0 2.67334V6.52147H6.92665Z" fill="#0052B4" />
      <path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#0052B4" />
      <path d="M3.12683 0L11.7391 4.78491V0H3.12683Z" fill="#0052B4" />
      <path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#F0F0F0" />
      <path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#D80027" />
      <path d="M24.707 6.52182L30.0004 3.58105V6.52182H24.707Z" fill="#0052B4" />
      <path d="M18.2617 5.69233V0H28.5072L18.2617 5.69233Z" fill="#0052B4" />
      <path d="M21.5813 6.52159L30.0009 1.84414V0L18.2617 6.52159H21.5813Z" fill="#D80027" />
    </svg>
  );
}

function FlagDE({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M30 0H0V20H30V0Z" fill="#D80027" />
      <path d="M30 0H0V6.66643H30V0Z" fill="black" />
      <path d="M30 13.333H0V19.9994H30V13.333Z" fill="#FFDA44" />
    </svg>
  );
}

function FlagFR({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M30 0H0V20H30V0Z" fill="#F0F0F0" />
      <path d="M9.99978 0H0V20H9.99978V0Z" fill="#0052B4" />
      <path d="M30 0H20.0002V20H30V0Z" fill="#D80027" />
    </svg>
  );
}

function FlagES({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M30 0H0V20H30V0Z" fill="#FFDA44" />
      <path d="M30 0H0V6.66643H30V0Z" fill="#D80027" />
      <path d="M30 13.333H0V19.9994H30V13.333Z" fill="#D80027" />
    </svg>
  );
}

function FlagRU({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 0V6.66649V13.333V19.9995H30V13.333V6.66649V0H0Z" fill="#F0F0F0" />
      <path d="M30 0H0V19.9998H30V0Z" fill="#0052B4" />
      <path d="M30 0H0V6.66637H30V0Z" fill="#F0F0F0" />
      <path d="M30 13.333H0V19.9994H30V13.333Z" fill="#D80027" />
    </svg>
  );
}

export default LanguageSwitch;
