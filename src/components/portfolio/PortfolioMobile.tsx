import { useCallback, useRef, useState } from "react";
import { siteConfig } from "@/config/site.config";
import { toTitleCase } from "@/utils/text";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

const SLIDE_GAP = 12;

/**
 * Mobile / tablet Portfolio — header copy followed by a swipeable one-card
 * carousel (scroll-snap) with pagination dots. Replaces the desktop's pinned,
 * scroll-driven two-row ribbon, which doesn't fit narrow screens.
 */
export function PortfolioMobile() {
  const { eyebrow, headline, description, moreProjects, projects } =
    siteConfig.portfolio;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = el.clientWidth + SLIDE_GAP;
    const next = Math.round(el.scrollLeft / step);
    setActive((prev) => (prev === next ? prev : next));
  }, []);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * (el.clientWidth + SLIDE_GAP), behavior: "smooth" });
  };

  return (
    <div
      id="portfolio"
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 40% at 90% 70%, rgba(91,43,185,0.14) 0%, transparent 65%), #000000",
      }}
    >
      <div
        className="mx-auto w-full max-w-330 px-5"
        style={{
          paddingTop: "clamp(52px, 15.6vw, 96px)",
          paddingBottom: "clamp(48px, 14vw, 80px)",
        }}
      >
        <p
          className="font-body font-normal uppercase m-0"
          style={{
            fontSize: "clamp(13px, 3.5vw, 16px)",
            lineHeight: 1.4,
            letterSpacing: "0.02em",
            color: "#9F7EE1",
          }}
        >
          {eyebrow}
        </p>

        <h2
          className="font-hero font-bold m-0"
          style={{
            fontSize: "clamp(24px, 6.5vw, 36px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            marginTop: "clamp(10px, 3vw, 14px)",
          }}
        >
          {toTitleCase(headline)}
        </h2>

        <p
          className="font-body font-normal m-0"
          style={{
            fontSize: "clamp(15px, 4.2vw, 19px)",
            lineHeight: 1.3,
            color: "#BFBFBF",
            marginTop: "clamp(12px, 3.5vw, 18px)",
          }}
        >
          {description.join(" ")}
        </p>

        <a
          href={moreProjects.href}
          className="block font-body font-medium underline underline-offset-4"
          style={{
            fontSize: "clamp(15px, 3.7vw, 19px)",
            lineHeight: 1.3,
            color: "#9F7EE1",
            marginTop: "clamp(24px, 7.4vw, 36px)",
          }}
        >
          {moreProjects.label}
        </a>

        {/* Carousel */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: SLIDE_GAP,
            marginTop: "clamp(24px, 7.4vw, 36px)",
            overscrollBehaviorX: "contain",
          }}
        >
          {projects.map((p) => (
            <div key={p.id} className="snap-center shrink-0 basis-full">
              <ProjectCard image={p.image} link={p.link} fluid />
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div
          className="flex items-center justify-center"
          style={{ gap: 6, marginTop: "clamp(20px, 6.9vw, 32px)" }}
          role="tablist"
          aria-label="Portfolio projects"
        >
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Project ${i + 1}`}
              onClick={() => goTo(i)}
              className="p-0 border-0 cursor-pointer"
              style={{
                width: i === active ? 22 : 7,
                height: 7,
                borderRadius: 4,
                background: "#FFFFFF",
                opacity: i === active ? 1 : 0.95,
                transition: "width 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioMobile;
