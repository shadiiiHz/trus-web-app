import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { VideoModal } from "@/components/services/VideoModal";

/**
 * "TRUS AI Services" list — one row per service. Hovering (or tapping, on
 * touch) a row's content — its title or its media thumbnail — makes that
 * row the active one: its bullet and title both slide through the same
 * vertical "reel" (see the title span below) to their active
 * color, and its thumbnail (placeholder media for now, see
 * `servicesListMeta` in site.config.ts) expands into the row. Only one row
 * is active at a time; none are active on load — all rows start "off"
 * until the user hovers/taps/clicks one.
 *
 * Each row's `id` matches a branch id on the hero tree diagram
 * (`ServiceGrowthTree`) — clicking a branch there dispatches a
 * `trus:activate-service` event (see the listener below) that opens the
 * matching row and scrolls to it here.
 */
export function ServicesListSection() {
  const { eyebrow, heading, items } = siteConfig.servicesPage.list;
  // Touch layouts have no hover, so the first service starts open (per the
  // mobile design) and only changes on tap; desktop starts with none open.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [activeId, setActiveId] = useState<string | null>(() =>
    typeof window !== "undefined" && window.innerWidth < 1024
      ? (items[0]?.id ?? null)
      : null,
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playingItem = items.find((item) => item.id === playingId);

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
    if (!isDesktop || suppressHoverRef.current) return;
    setActiveId(null);
  };

  // Cross-component activation: ServiceGrowthTree dispatches this when a
  // branch label is clicked. The newly active row's thumbnail reserves its
  // layout space immediately, but the *previously* active row's thumbnail
  // stays mounted for its full exit animation (~0.7s) before it actually
  // leaves the DOM. If that closing row sits above the new target, its
  // collapse shifts everything below it upward — including the target —
  // *after* scrollIntoView already landed, which is the "anchor sometimes
  // doesn't line up with scroll-mt-28" bug: the scroll itself was correct,
  // the ground just moved under it afterwards. A fixed setTimeout can't
  // reliably outlast that animation, so instead we scroll only once we
  // actually know the closing row is gone — via handleRowExitComplete below —
  // with a timeout fallback in case no row was exiting (or Framer cancels
  // the exit by re-entering) so the scroll never gets stuck pending.
  const pendingScrollRef = useRef<{ targetId: string; waitingForId: string } | null>(null);
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const runPendingScroll = (targetId: string) => {
    pendingScrollRef.current = null;

    // onExitComplete fires as soon as Framer's exit animation finishes, but
    // the row's actual DOM removal is a React commit that can still land a
    // frame later — calling scrollIntoView synchronously here can measure
    // the *stale* (pre-removal) layout and scroll to where the target used
    // to be. Two rAFs reliably land after that commit and its layout pass.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });

        // The smooth scroll itself takes several hundred ms, and the cursor
        // stays put on screen while the page moves under it — so a row can
        // end up under the mouse mid-scroll and fire a stray hover
        // activation that undoes the scroll we just started. Keep hover
        // suppressed until the scroll genuinely finishes (`scrollend`),
        // with a timeout fallback for browsers without it (or if it never
        // fires).
        let released = false;
        const release = () => {
          if (released) return;
          released = true;
          suppressHoverRef.current = false;
          window.removeEventListener("scrollend", release);
        };
        window.addEventListener("scrollend", release, { once: true });
        window.setTimeout(release, 1500);
      });
    });
  };

  const handleRowExitComplete = (rowId: string) => {
    if (pendingScrollRef.current?.waitingForId === rowId) {
      runPendingScroll(pendingScrollRef.current.targetId);
    }
  };

  useEffect(() => {
    const onActivate = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!items.some((item) => item.id === id)) return;
      const previousId = activeIdRef.current;
      setActiveId(id);
      suppressHoverRef.current = true;

      if (previousId && previousId !== id) {
        pendingScrollRef.current = { targetId: id, waitingForId: previousId };
        // Safety net: if the closing row's exit callback never fires
        // (e.g. Framer cancels the exit because the row gets reactivated
        // before it finishes), don't leave the scroll pending forever.
        window.setTimeout(() => {
          if (pendingScrollRef.current?.targetId === id) {
            runPendingScroll(id);
          }
        }, 900);
      } else {
        runPendingScroll(id);
      }
    };
    window.addEventListener("trus:activate-service", onActivate);
    return () => window.removeEventListener("trus:activate-service", onActivate);
  }, [items]);

  return (
    <section
      aria-label="TruS AI Services"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto w-full max-w-330 px-5 pt-14 pb-12 lg:py-28">
        <FadeIn direction="up" delay={0.05}>
          <span
            className="font-body text-[12px] font-normal uppercase tracking-[0.12em] lg:text-body lg:tracking-[0.22em]"
            style={{ color: "#9F7EE1" }}
          >
            {eyebrow}
          </span>
        </FadeIn>

        <FadeIn direction="up" delay={0.14}>
          <h2 className="font-hero font-bold text-[26px] leading-[1.2] mt-2 text-brand-white lg:text-[38px] lg:leading-normal lg:mt-1">
            {heading}
          </h2>
        </FadeIn>

        <div className="mt-8 lg:mt-10">
          {items.map((item, i) => (
            <ServiceRow
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              isLast={i === items.length - 1}
              onActivate={() => activateFromHover(item.id)}
              onDeactivate={deactivateFromHover}
              onExitComplete={() => handleRowExitComplete(item.id)}
              onPlay={() => setPlayingId(item.id)}
              delay={0.05 * i}
            />
          ))}
        </div>
      </div>

      {playingItem?.youtubeId && (
        <VideoModal
          videoId={playingItem.youtubeId}
          onClose={() => setPlayingId(null)}
        />
      )}
    </section>
  );
}

interface ListItem {
  id: string;
  title: string;
  description: string;
  media: string;
  eyebrow?: string;
  youtubeId?: string;
}

function ServiceRow({
  item,
  isActive,
  isLast,
  onActivate,
  onDeactivate,
  onExitComplete,
  onPlay,
}: {
  item: ListItem;
  isActive: boolean;
  isLast: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onExitComplete: () => void;
  onPlay: () => void;
  delay: number;
}) {
  // The title wraps onto several lines, so the reel window is measured
  // (one copy's height) instead of being a fixed single-line height.
  const titleRef = useRef<HTMLSpanElement>(null);
  const [titleH, setTitleH] = useState(0);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const measure = () => setTitleH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      className={`grid scroll-mt-28 cursor-pointer grid-cols-1 items-center gap-3 py-6 outline-none lg:grid-cols-[minmax(260px,600px)_1fr_minmax(200px,303px)] lg:gap-8 lg:py-7 ${isLast ? "" : "border-b border-white/30"}`}
    >
      {/* Title — a vertical "reel" of two stacked
          duplicate copies (idle-gray on top, active-purple/white directly
          below) inside a same-size overflow-hidden window. Activating
          slides the stack up by exactly one copy-height to reveal the
          other, instead of fading/spinning between colors. */}
      <div>
        <span
          className="relative block overflow-hidden"
          style={{ height: titleH || undefined }}
        >
          <motion.span
            animate={{ y: isActive ? -titleH : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <span
              ref={titleRef}
              className="block font-body text-[20px] leading-[1.6] font-semibold tracking-wide uppercase whitespace-pre-line lg:text-[32px] lg:leading-[1.8]"
              style={{ color: "#707075" }}
            >
              {item.title}
            </span>
            <span
              aria-hidden="true"
              className="block font-body text-[20px] leading-[1.6] font-semibold tracking-wide uppercase whitespace-pre-line lg:text-[32px] lg:leading-[1.8]"
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
      <div className="min-w-0 empty:hidden lg:empty:block">
        <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
          {isActive && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative my-2 w-full overflow-hidden rounded-md border border-white/20 lg:my-0 lg:ml-auto lg:mr-0 lg:w-[306.5px]"
              style={{
                aspectRatio: "306.5 / 221.15",
              }}
            >
              {item.youtubeId ? (
                <iframe
                  className="pointer-events-none h-full w-full"
                  src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${item.youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                  title={`${item.title.replace(/\n/g, " ")} preview`}
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <img
                  src={item.media}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  disabled={!item.youtubeId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay();
                  }}
                  aria-label="Play video"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg disabled:cursor-default"
                >
                  <Play
                    size={21}
                    fill="#0B0C01"
                    color="#0B0C01"
                    style={{ marginLeft: 2 }}
                  />
                </button>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Description */}
      <div
        className="transition-opacity duration-300 leading-5 text-justify lg:leading-[18.75px]"
        style={{ color: isActive ? "#FFFFFF" : "#707075" }}
      >
        {item.eyebrow && (
          <p className="mb-3 font-body text-[16px] font-bold leading-[18.75px] tracking-normal lg:tracking-[-0.5px]">
            {item.eyebrow}
          </p>
        )}
        <p className="font-body text-body-sm whitespace-pre-line">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default ServicesListSection;
