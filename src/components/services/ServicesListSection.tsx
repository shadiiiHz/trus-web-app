import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";

/**
 * "TRUS AI Services" list — one row per service. Hovering (or tapping, on
 * touch) a row's content — its title or its media thumbnail — makes that
 * row the active one: its bullet and title both slide through the same
 * vertical "reel" (see `Bullet` and the title span below) to their active
 * color, and its thumbnail (placeholder media for now, see
 * `servicesListMeta` in site.config.ts) expands into the row. Only one row
 * is active at a time; the first row starts active so the section isn't
 * empty on load.
 *
 * Each row's `id` matches a branch id on the hero tree diagram
 * (`ServiceGrowthTree`) — clicking a branch there dispatches a
 * `trus:activate-service` event (see the listener below) that opens the
 * matching row and scrolls to it here.
 */
export function ServicesListSection() {
  const { eyebrow, heading, items } = siteConfig.servicesPage.list;
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  // While a tree-branch click is smoothly scrolling this list into view,
  // the user's real cursor stays put on screen — but the row underneath it
  // changes as the page scrolls, and Chromium fires a mouseenter/mouseleave
  // for that incidental change. Left alone, that immediately stomps the
  // row the click just opened. suppressHoverRef blocks hover-driven
  // activation for a beat after a programmatic activation so the click
  // wins until the scroll actually settles.
  const suppressHoverRef = useRef(false);

  const activateFromHover = (id: string) => {
    if (suppressHoverRef.current) return;
    setActiveId(id);
  };
  const deactivateFromHover = () => {
    if (suppressHoverRef.current) return;
    setActiveId(null);
  };

  // Cross-component activation: ServiceGrowthTree dispatches this when a
  // branch label is clicked. Opening the row changes its height (the
  // thumbnail animates in/out over ~0.4s) and so does closing whichever
  // row was active before — scrolling immediately, before that layout
  // shift finishes, was the "sometimes doesn't work" bug: scrollIntoView
  // landed on a target position that the still-animating rows above it
  // then invalidated. Deferring the actual scroll until after that
  // settles fixes it; the row still opens immediately so the response
  // feels instant.
  useEffect(() => {
    const onActivate = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!items.some((item) => item.id === id)) return;
      setActiveId(id);
      suppressHoverRef.current = true;
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
      window.setTimeout(() => {
        suppressHoverRef.current = false;
      }, 1000);
    };
    window.addEventListener("trus:activate-service", onActivate);
    return () => window.removeEventListener("trus:activate-service", onActivate);
  }, [items]);

  return (
    <section
      aria-label="TruS AI Services"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto w-full max-w-330 px-5 py-24 lg:py-28">
        <FadeIn direction="up" delay={0.05}>
          <span
            className="font-body text-body font-normal uppercase tracking-[0.22em]"
            style={{ color: "#9F7EE1" }}
          >
            {eyebrow}
          </span>
        </FadeIn>

        <FadeIn direction="up" delay={0.14}>
          <h2 className="font-hero font-bold text-[58px] mt-1 text-brand-white">
            {heading}
          </h2>
        </FadeIn>

        <div className="mt-10">
          {items.map((item, i) => (
            <ServiceRow
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onActivate={() => activateFromHover(item.id)}
              onDeactivate={deactivateFromHover}
              delay={0.05 * i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ListItem {
  id: string;
  title: string;
  description: string;
  media: string;
  eyebrow?: string;
}

function ServiceRow({
  item,
  isActive,
  onActivate,
  onDeactivate,
}: {
  item: ListItem;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  delay: number;
}) {
  return (
    <div
      id={item.id}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      onClick={onActivate}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className="grid scroll-mt-28 cursor-pointer grid-cols-1 items-center gap-3 border-b border-white/20 py-6 outline-none lg:grid-cols-[minmax(260px,360px)_1fr_minmax(200px,303px)] lg:gap-8 lg:py-7"
    >
      {/* Title + bullet — both are a vertical "reel" of two stacked
          duplicate copies (idle-gray on top, active-purple/white directly
          below) inside a same-size overflow-hidden window. Activating
          slides the stack up by exactly one copy-height to reveal the
          other, instead of fading/spinning between colors. */}
      <div className="flex items-end gap-2.5">
        <Bullet active={isActive} />
        <span
          className="relative inline-block overflow-hidden h-[1.3em] lg:h-[1.8em]"
        >
          <motion.span
            animate={{ y: isActive ? "-50%" : "0%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <span
              className="font-body text-lg leading-tight font-semibold tracking-wide whitespace-nowrap uppercase lg:text-[24px]"
              style={{ color: "#707075" }}
            >
              {item.title}
            </span>
            <span
              className="font-body text-lg leading-tight font-semibold tracking-wide whitespace-nowrap uppercase lg:text-[24px]"
              style={{ color: "#FFFFFF" }}
            >
              {item.title}
            </span>
          </motion.span>
        </span>
      </div>

      {/* Media thumbnail — only the active row shows one. Right-aligned
          (not centered) within its column so it sits close to the
          description text next to it rather than in the middle of the gap
          on the left side. */}
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-md lg:ml-auto lg:mr-14"
              style={{
                width: "306.5px",
                maxWidth: "100%",
                aspectRatio: "306.5 / 221.15",
              }}
            >
              <img
                src={item.media}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                  <Play
                    size={21}
                    fill="#0B0C01"
                    color="#0B0C01"
                    style={{ marginLeft: 2 }}
                  />
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Description */}
      <div
        className="transition-opacity duration-300 text-justify leading-[18.75px]"
        style={{ color: isActive ? "#FFFFFF" : "#707075" }}
      >
        {item.eyebrow && (
          <p className="mb-1.5 font-body text-body uppercase tracking-[0.14em]">
            {item.eyebrow}
          </p>
        )}
        <p className="font-body text-body-sm">
          {item.description}
        </p>
      </div>
    </div>
  );
}

/**
 * Target-style bullet (outer ring + concentric inner dot, per the Figma
 * spec). Same reel mechanism as the title next to it: two full copies
 * (idle-gray, active-purple) stacked inside a bullet-sized
 * overflow-hidden window, sliding via translateY(-50%) on a 200%-tall
 * inner column — not a separate spin/fill effect.
 */
function Bullet({ active }: { active: boolean }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full mb-[4.3px]"
      style={{ width: 15, height: 15 }}
    >
      <motion.span
        animate={{ y: active ? "-50%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col"
      >
        <BulletFace color="#707075" />
        <BulletFace color="#9F7EE1" />
      </motion.span>
    </span>
  );
}

function BulletFace({ color }: { color: string }) {
  return (
    <span
      className="flex items-center justify-center rounded-full"
      style={{ width: 15, height: 15, border: `1.5px solid ${color}` }}
    >
      <span className="rounded-full" style={{ width: 10, height: 10, background: color }} />
    </span>
  );
}

export default ServicesListSection;
