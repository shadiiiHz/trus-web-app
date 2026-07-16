import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/Button";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { EASE_PREMIUM, DURATION_MD, DURATION_SM } from "@/motion/variants";
import trusLogo from "@/assets/logo.png";

// Scroll-spy
// IDs of every section that has a corresponding nav link.
// Defined at module level so the array reference is stable across renders
// (avoids triggering useEffect repeatedly).
//
// 'pricing' is intentionally excluded — no <section id="pricing"> exists yet.
// 'why-us' is excluded — it has no nav link.
// When the user scrolls through an untracked section (WhyUs, Team, Testimonials)
// the previous tracked section stays active, which is the expected behaviour.
const TRACKED_SECTION_IDS = [
  "about",
  "portfolio",
  "templates",
  "services",
  "contact",
] as const;

// Fraction of viewport height at which a section "activates" — 40% from top.
// Using 40% (rather than 50%) means the nav updates slightly before the section
// fully dominates the view, which feels more responsive.
const TRIGGER_FRACTION = 0.4;

/**
 * Returns the ID of the last tracked section whose top edge has scrolled
 * above the trigger line, or '' when the user is at the very top (Home).
 *
 * Strategy: iterate all tracked sections in DOM order, keep updating `current`
 * as long as a section's top is ≤ trigger.  The last one to satisfy the
 * condition is the deepest visible section — therefore the active one.
 */
function useScrollSpy(): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    const update = () => {
      const trigger = window.innerHeight * TRIGGER_FRACTION;
      let current = "";

      for (const id of TRACKED_SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= trigger) {
          current = id;
        }
      }

      setActive(current);
    };

    // rAF-throttle: coalesce bursts of scroll events into one layout read per frame.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initialise immediately so state is correct on mount
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []); // empty — TRACKED_SECTION_IDS and TRIGGER_FRACTION are module-level constants

  return active;
}

// Navbar

export interface NavbarProps {
  data?: typeof siteConfig.nav;
  /** Slides the whole navbar up and fades it out (e.g. while a pinned section beneath it owns the viewport). */
  hidden?: boolean;
}

export function Navbar({ data = siteConfig.nav, hidden = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Backdrop blur/bg — triggers after 20 px of scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Live active-section ID from scroll position
  const activeSection = useScrollSpy();

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className="fixed inset-x-0 top-0 z-50"
        role="banner"
      >
        {/* Backdrop — full-width blur + bg, NO border (border handled separately below) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: scrolled
              ? "rgba(7, 7, 13, 0.92)"
              : "rgba(0,0,0,0)",
            backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          }}
          transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
          aria-hidden="true"
        />

        {/* Bottom border — constrained to content container width, not edge-to-edge */}
        <div
          className="absolute bottom-0 inset-x-0 flex justify-center px-5 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="w-full max-w-300 h-px"
            style={{ background: "rgba(255,255,255,0.18)" }}
          />
        </div>

        <nav
          className="relative mx-auto flex h-18 max-w-300 items-center justify-between px-5"
          aria-label="Main navigation"
        >
          {/* Logo — same asset as Footer */}
          <a
            href="/"
            className="shrink-0 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="TruS — home"
          >
            <img
              src={trusLogo}
              alt="TruS"
              decoding="async"
              style={{ height: "32px", width: "auto", display: "block" }}
            />
          </a>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-2.5" role="list">
            {data.links.map((link) => {
              // Derive the section ID from the href.
              // href '#'       → sectionId ''        → active when at top of page
              // href '#about'  → sectionId 'about'   → active when about is in view
              const sectionId = link.href === "#" ? "" : link.href.slice(1);
              const isActive = activeSection === sectionId;

              return (
                <li key={link.label}>
                  <NavLink
                    href={link.href}
                    label={link.label}
                    active={isActive}
                  />
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            <LanguageSwitch />
            <Button
              variant="gradient"
              href={data.cta.href}
              // glow
              // hoverScale={false}
              className="h-11 w-22.5 text-body font-medium"
            >
              {data.cta.label}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative z-10 flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-0 z-40 flex flex-col pt-20 px-6 pb-10"
            style={{
              background: "rgba(7, 7, 13, 0.97)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
          >
            <ul className="flex flex-col gap-6 mt-8" role="list">
              {data.links.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: DURATION_MD,
                    ease: EASE_PREMIUM,
                  }}
                >
                  <a
                    href={link.href}
                    className="text-display-sm font-display font-semibold text-brand-white hover:text-brand-accent-light transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-4">
              <LanguageSwitch className="self-center" />
              <Button
                variant="gradient"
                href={data.cta.href}
                className="w-full justify-center"
              >
                {data.cta.label}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className="group relative text-[15px] font-body font-normal text-brand-white hover:text-brand-accent-light transition-colors duration-200 px-1.75 py-1"
      aria-current={active ? "page" : undefined}
    >
      {label}
      {/* Underline — full width when active, animates in on hover otherwise */}
      <span
        className={[
          "absolute -bottom-0.5 left-1.75 h-px rounded-full transition-all duration-300",
          active
            ? "w-[calc(100%-14px)]"
            : "w-0 group-hover:w-[calc(100%-14px)]",
        ].join(" ")}
        style={{ background: "var(--color-brand-accent)" }}
        aria-hidden="true"
      />
    </a>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col gap-1.5 w-5" aria-hidden="true">
      <motion.span
        className="h-px w-full rounded-full bg-brand-white"
        animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
        transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
      />
      <motion.span
        className="h-px w-full rounded-full bg-brand-white"
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
        transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
      />
      <motion.span
        className="h-px w-full rounded-full bg-brand-white"
        animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
        transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
      />
    </span>
  );
}

export default Navbar;
