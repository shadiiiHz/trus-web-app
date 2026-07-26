import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, setLocale, type Locale } from "@/i18n";

type FlagFit = "slice" | "meet";

interface LanguageOption {
  code: Locale;
  label: string;
  name: string;
  Flag: React.FC<{ fit: FlagFit }>;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "EN", name: "English", Flag: FlagGB },
  { code: "fr", label: "FR", name: "French", Flag: FlagFR },
  { code: "es", label: "ES", name: "Spanish", Flag: FlagES },
  { code: "ru", label: "RU", name: "Russian", Flag: FlagRU },
  { code: "de", label: "DE", name: "German", Flag: FlagDE },
  { code: "it", label: "IT", name: "Italian", Flag: FlagIT },
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
  // Distance from the trigger's own top edge down to the header's bottom
  // border, in px — lets the panel sit flush on that line instead of
  // hanging off the trigger button (which is vertically centred in the
  // taller header and doesn't reach the border itself). Null when there's
  // no header ancestor (e.g. the mobile menu's switcher).
  const [headerLineOffset, setHeaderLineOffset] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Room needed for the full option grid (2 rows + padding). Flip the panel
  // above the trigger when there isn't enough space below — e.g. the mobile
  // menu's switcher sits near the bottom of the viewport.
  const PANEL_HEIGHT_ESTIMATE = 170;

  useEffect(() => {
    if (!open) return;

    const rootRect = rootRef.current?.getBoundingClientRect();
    const headerBottom = rootRef.current?.closest("header")?.getBoundingClientRect().bottom;
    setHeaderLineOffset(rootRect && headerBottom != null ? headerBottom - rootRect.top : null);

    const spaceBelow = rootRect ? window.innerHeight - rootRect.bottom : Infinity;
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
          className={`absolute left-0 z-50 grid h-35.75 w-51.75 grid-cols-3 grid-rows-2 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl backdrop-saturate-150 ${openUp ? "bottom-[calc(100%+14px)]" : headerLineOffset == null ? "top-[calc(100%+14px)]" : ""}`}
          style={{
            background: "rgba(9, 5, 9, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            ...(!openUp && headerLineOffset != null ? { top: headerLineOffset } : {}),
          }}
        >
          {/* Grid dividers: 2 continuous vertical lines (between the 3 columns) and
              1 continuous horizontal line (between the 2 rows), each inset slightly
              from the panel edge. Single elements so they can't fragment/misalign —
              they naturally cross where they overlap. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 bottom-3 w-px"
            style={{ left: "33.333%", background: "rgba(255, 255, 255, 0.1)" }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 bottom-3 w-px"
            style={{ left: "66.666%", background: "rgba(255, 255, 255, 0.1)" }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 right-3 h-px"
            style={{ top: "50%", background: "rgba(255, 255, 255, 0.1)" }}
          />
          {LANGUAGES.map((lang, index) => {
            const selected = lang.code === locale;
            const isTopRow = index < 3;
            return (
              <li key={lang.code} role="none" className="relative list-none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(lang.code)}
                  className={`relative flex h-full w-full cursor-pointer flex-col items-center gap-2 px-3 text-center transition-colors hover:bg-white/10 ${isTopRow ? "justify-end pb-2" : "justify-center py-4"}`}
                >
                  <MenuFlagBadge Flag={lang.Flag} />
                  <span className="text-label font-body font-normal text-brand-white">{lang.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Navbar trigger flag — the flag graphic itself, cropped to fill a fixed 24×24 square. */
function TriggerFlag({ Flag }: { Flag: React.FC<{ fit: FlagFit }> }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm"
      style={{ width: 24, height: 24 }}
    >
      <Flag fit="slice" />
    </span>
  );
}

/** Menu grid flag — a 24×24 square, cropped to fill, with a solid white border. */
function MenuFlagBadge({ Flag }: { Flag: React.FC<{ fit: FlagFit }> }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border"
      style={{ width: 24, height: 24, borderWidth: 0.5, borderColor: "rgba(255, 255, 255, 1)" }}
    >
      <Flag fit="slice" />
    </span>
  );
}

function FlagGB({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 0H0V20H20V0Z" fill="#F0F0F0" />
      <path d="M0 11.875H8.125V20H11.875V11.875H20V8.125H11.875V0H8.125V8.125H0V11.875Z" fill="#D80027" />
      <path d="M15.8945 13.0435L19.9992 17.1481V13.0435H15.8945Z" fill="#0052B4" />
      <path d="M13.043 13.0435L19.9995 20V18.0328L15.0102 13.0435H13.043Z" fill="#0052B4" />
      <path d="M18.1465 20.0001L13.043 14.896V20.0001H18.1465Z" fill="#0052B4" />
      <path d="M13.043 13.0435L19.9995 20V18.0328L15.0102 13.0435H13.043Z" fill="#F0F0F0" />
      <path d="M13.043 13.0435L19.9995 20V18.0328L15.0102 13.0435H13.043Z" fill="#D80027" />
      <path d="M3.1368 13.0435L0 16.1803V13.0435H3.1368Z" fill="#0052B4" />
      <path d="M6.95609 13.9282V20H0.884766L6.95609 13.9282Z" fill="#0052B4" />
      <path d="M4.98922 13.0435L0 18.0327V19.9999L6.95641 13.0435H4.98922Z" fill="#D80027" />
      <path d="M4.10469 6.95674L0 2.85205V6.95674H4.10469Z" fill="#0052B4" />
      <path d="M6.95652 6.95652L0 0V1.96719L4.98934 6.95652H6.95652Z" fill="#0052B4" />
      <path d="M1.85352 0L6.95707 5.10402V0H1.85352Z" fill="#0052B4" />
      <path d="M6.95652 6.95652L0 0V1.96719L4.98934 6.95652H6.95652Z" fill="#F0F0F0" />
      <path d="M6.95652 6.95652L0 0V1.96719L4.98934 6.95652H6.95652Z" fill="#D80027" />
      <path d="M16.8633 6.95662L20.0001 3.81982V6.95662H16.8633Z" fill="#0052B4" />
      <path d="M13.043 6.0718V0H19.1143L13.043 6.0718Z" fill="#0052B4" />
      <path d="M15.0102 6.9564L19.9994 1.96715V0L13.043 6.9564H15.0102Z" fill="#D80027" />
    </svg>
  );
}

function FlagDE({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 0H0V20H20V0Z" fill="#D80027" />
      <path d="M20 0H0V6.66652H20V0Z" fill="black" />
      <path d="M20 13.3335H0V20H20V13.3335Z" fill="#FFDA44" />
    </svg>
  );
}

function FlagFR({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 0H0V20H20V0Z" fill="#F0F0F0" />
      <path d="M6.66652 0H0V20H6.66652V0Z" fill="#0052B4" />
      <path d="M19.9995 0H13.333V20H19.9995V0Z" fill="#D80027" />
    </svg>
  );
}

function FlagES({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 0H0V20H20V0Z" fill="#FFDA44" />
      <path d="M20 0H0V6.66652H20V0Z" fill="#D80027" />
      <path d="M20 13.3335H0V20H20V13.3335Z" fill="#D80027" />
    </svg>
  );
}

function FlagIT({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M13.3333 0H6.66663H0V20H6.66663H13.3333H20V0H13.3333Z" fill="#F0F0F0" />
      <path d="M6.66651 0H0V20H6.66651V0Z" fill="#6DA544" />
      <path d="M20.0005 0H13.334V20H20.0005V0Z" fill="#D80027" />
    </svg>
  );
}

function FlagRU({ fit }: { fit: FlagFit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 0H0V20H20V0Z" fill="#0052B4" />
      <path d="M20 0H0V6.66652H20V0Z" fill="#F0F0F0" />
      <path d="M20 13.3335H0V20H20V13.3335Z" fill="#D80027" />
    </svg>
  );
}

export default LanguageSwitch;
