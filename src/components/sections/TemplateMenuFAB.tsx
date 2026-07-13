import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/Button";
import { EASE_PREMIUM, DURATION_MD, DURATION_SM } from "@/motion/variants";
import trusLogo from "@/assets/logo.png";

interface TemplateMenuFABProps {
  /** Only rendered while the Template section owns the viewport (navbar is hidden then). */
  active: boolean;
}

/**
 * Small "tab" pinned to the right edge, visible only inside the
 * Template section (where the main Navbar slides away). Opens a glassy
 * flyout panel right next to it with the same links as the main nav.
 */
export function TemplateMenuFAB({ active }: TemplateMenuFABProps) {
  const [open, setOpen] = useState(false);
  const { links, cta } = siteConfig.nav;

  // Gate on `active` too, so the popup never lingers after the tab itself unmounts.
  const popupOpen = open && active;

  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupOpen]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ x: 24 }}
            animate={{ x: 0 }}
            exit={{ x: 24 }}
            transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
            className="fixed top-1/2 -right-4 z-50 -translate-y-1/2"
            style={{ willChange: "transform", transform: "translateZ(0)" }}
          >
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Open template section menu"
              aria-haspopup="dialog"
              aria-expanded={popupOpen}
              className="group relative flex h-18 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-l-full border transition-shadow duration-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] focus-visible:outline-none"
              style={{
                background:
                  "linear-gradient(155deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 30%, rgba(20,18,32,0.32) 55%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(14px) saturate(140%)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                borderRight: "none",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                isolation: "isolate",
                willChange: "backdrop-filter",
              }}
            >
              {/* Glossy highlight streak — mimics light hitting curved glass */}
              <span
                className="pointer-events-none absolute -left-2 -top-2 h-8 w-14 rotate-[-20deg] rounded-full opacity-20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                  filter: "blur(3px)",
                }}
                aria-hidden="true"
              />
              {/* Soft base reflection near the bottom */}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-5 opacity-10"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                }}
                aria-hidden="true"
              />

              <span className="relative z-10 flex h-4 w-4 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={popupOpen ? "close" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {popupOpen ? (
                      <X
                        className="h-4 w-4 cursor-pointer text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                        strokeWidth={2}
                      />
                    ) : (
                      <Menu
                        className="h-4 w-4 cursor-pointer text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110"
                        strokeWidth={2}
                      />
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popupOpen && (
          <>
            {/* Invisible click-catcher — closes the flyout without dimming the page. */}
            <motion.div
              className="fixed inset-0 z-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION_SM }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
              className="fixed top-1/2 right-16 z-100 w-72 max-w-[calc(100vw-2.5rem)] -translate-y-1/2 overflow-hidden rounded-2xl border p-6"
              style={{
                background:
                  "linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 30%, rgba(20,18,32,0.28) 55%, rgba(255,255,255,0.04) 100%)",
                backdropFilter: "blur(20px) saturate(150%)",
                WebkitBackdropFilter: "blur(20px) saturate(150%)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                boxShadow:
                  "0 24px 64px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -6px 14px -8px rgba(0,0,0,0.2)",
              }}
            >
              {/* Glossy highlight streak — mimics light hitting curved glass */}
              <span
                className="pointer-events-none absolute -left-6 -top-6 h-24 w-40 rotate-[-20deg] rounded-full opacity-20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                  filter: "blur(4px)",
                }}
                aria-hidden="true"
              />
              {/* Soft base reflection near the bottom */}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 opacity-10"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                }}
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-brand-white/90 absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>

              <img src={trusLogo} alt="Trus" className="relative z-10 h-6 w-auto" />

              <ul className="relative z-10 mt-4 flex flex-col gap-0.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-white hover:text-brand-bg block cursor-pointer rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-white/8"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="relative z-10" onClick={() => setOpen(false)}>
                <Button variant="gradient" href={cta.href} className="mt-4 w-full justify-center cursor-pointer">
                  {cta.label}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default TemplateMenuFAB;
