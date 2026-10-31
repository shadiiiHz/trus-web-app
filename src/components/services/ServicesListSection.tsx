import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SERVICE_PATHS } from "@/config/serviceDetails.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ServicesRail } from "@/components/services/ServicesRail";
import { VideoModal } from "@/components/services/VideoModal";

/** Detail page of each row, by row id (the title and the bold tagline link to it). */
const ROW_LINKS: Record<string, string> = {
  "growth-intelligence": SERVICE_PATHS.growth,
  multilingual: SERVICE_PATHS.multilingual,
  "web-design": SERVICE_PATHS.webDesign,
  "brand-identity": SERVICE_PATHS.brand,
  seo: SERVICE_PATHS.seo,
  "social-media": SERVICE_PATHS.social,
  "email-marketing": SERVICE_PATHS.email,
  youtube: SERVICE_PATHS.youtube,
  telegram: SERVICE_PATHS.telegram,
  instagram: SERVICE_PATHS.instagram,
  linkedin: SERVICE_PATHS.linkedin,
  "x-content": SERVICE_PATHS.x,
  "auto-post": SERVICE_PATHS.autoPost,
};

/** A link to the row's detail page, or a plain wrapper for a row that has none. */
function RowLink({ href, className, children }: { href?: string; className?: string; children: ReactNode }) {
  return href ? (
    <Link to={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

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
    <section id="services-list" aria-label="TruS AI Services" className="bg-black lg:bg-[#070606]">
      {/* On desktop the right rail (56px + 4px from the edge) sits over the margin, so the content keeps 80px there (Figma): a 20px gap to the rail at any width. */}
      <div className="mx-auto w-full max-w-330 px-5 py-14 lg:py-20 lg:pr-[clamp(20px,calc(80px_-_(100%_-_1320px)_/_2),80px)]">
        <FadeIn direction="up" delay={0.05}>
          <span
            className="block font-body text-[12px] font-normal uppercase leading-[15px] lg:text-[16px] lg:leading-[19px]"
            style={{ color: "#9F7EE1" }}
          >
            {eyebrow}
          </span>
        </FadeIn>

        <FadeIn direction="up" delay={0.14}>
          <h2 className="mt-2 font-hero text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-brand-white lg:text-[38px] lg:leading-[49px] lg:tracking-normal lg:capitalize">
            {heading}
          </h2>
        </FadeIn>

        <div className="mt-3 lg:mt-10">
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

      {isDesktop && <ServicesRail sectionId="services-list" />}

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

  // Figma tightens the long email-marketing title so it keeps its two lines.
  const titleTracking = item.id === "email-marketing" ? "lg:tracking-[-1px]" : "";

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
      className={`grid scroll-mt-28 cursor-pointer grid-cols-1 items-center gap-4 py-6 outline-none lg:grid-cols-[minmax(260px,574px)_1fr_minmax(200px,302px)] lg:gap-0 lg:py-0 lg:first:mt-0 lg:mt-6 ${isLast ? "lg:min-h-[354px]" : "border-b border-white/30 lg:min-h-[379px] lg:pb-6"}`}
    >
      {/* Title — a vertical "reel" of two stacked
          duplicate copies (idle-gray on top, active-purple/white directly
          below) inside a same-size overflow-hidden window. Activating
          slides the stack up by exactly one copy-height to reveal the
          other, instead of fading/spinning between colors. */}
      <RowLink href={ROW_LINKS[item.id]} className="block">
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
              className={`block font-body text-[20px] leading-[1.25] font-bold uppercase whitespace-pre-line lg:text-[32px] lg:leading-[60px] ${titleTracking}`}
              style={{ color: "#707075" }}
            >
              {item.title}
            </span>
            <span
              aria-hidden="true"
              className={`block font-body text-[20px] leading-[1.25] font-bold uppercase text-[#FBFBFB] lg:text-white whitespace-pre-line lg:text-[32px] lg:leading-[60px] ${titleTracking}`}
            >
              {item.title}
            </span>
          </motion.span>
        </span>
      </RowLink>

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
              className="relative w-full overflow-hidden rounded-[8px] lg:ml-auto lg:mr-[38px] lg:w-[332.62px] lg:rounded-[17.3634px] min-[1320px]:ml-[33px] min-[1320px]:mr-0"
              style={{
                aspectRatio: "332.62 / 240",
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
                    "rgba(7, 6, 6, 0.25)",
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
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.89] disabled:cursor-default lg:h-[60.77px] lg:w-[60.77px]"
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
        className="transition-opacity duration-300 leading-[19px] text-justify"
        style={{ color: isActive ? "#FFFFFF" : "#707075" }}
      >
        {item.eyebrow && (
          <p className="mb-4 font-body text-[16px] font-bold leading-[19px]">
            {ROW_LINKS[item.id] ? (
              <Link to={ROW_LINKS[item.id]} target="_blank" rel="noopener noreferrer">
                {item.eyebrow}
              </Link>
            ) : (
              item.eyebrow
            )}
          </p>
        )}
        <p
          className="font-body text-[14px] leading-[19px] whitespace-pre-line"
          style={isActive ? { color: "#BFBFBF" } : undefined}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default ServicesListSection;
