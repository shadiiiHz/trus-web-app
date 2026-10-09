import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site.config";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { useSnapCarousel } from "@/hooks/useSnapCarousel";
import { toTitleCase } from "@/utils/text";

const SLIDE_GAP = 12;

/**
 * Mobile / tablet Testimonials — left-aligned header over a faint globe, then
 * a swipeable one-card carousel with pagination dots. Replaces the desktop's
 * pinned five-card scroll choreography.
 */
export function TestimonialsMobile() {
  const { eyebrow, heading, subtitle, items } = siteConfig.testimonials;
  const { scrollerRef, active, onScroll, goTo } = useSnapCarousel(SLIDE_GAP);

  // Defer the globe video (3.3 MB) until the section nears the viewport.
  const rootRef = useRef<HTMLDivElement>(null);
  const [globeNear, setGlobeNear] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || globeNear) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGlobeNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [globeNear]);

  return (
    <div
      id="testimonials"
      ref={rootRef}
      className="relative overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      {/* Faint globe behind the header + card */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "4%",
          left: "50%",
          width: "130%",
          aspectRatio: "1 / 1",
          transform: "translateX(-50%)",
          opacity: 0.4,
          pointerEvents: "none",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black 25%, transparent 68%)",
          maskImage:
            "radial-gradient(circle at 50% 45%, black 25%, transparent 68%)",
        }}
      >
        <video
          src={globeNear ? "/globe.mp4" : undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div
        className="relative mx-auto w-full max-w-330 px-5"
        style={{
          zIndex: 1,
          paddingTop: "clamp(56px, 15vw, 96px)",
          paddingBottom: "clamp(48px, 14vw, 88px)",
        }}
      >
        <p
          className="font-body font-normal uppercase m-0"
          style={{
            fontSize: "clamp(12px, 3.3vw, 15px)",
            letterSpacing: "0.02em",
            color: "#9F7EE1",
          }}
        >
          {eyebrow}
        </p>

        <h2
          className="font-hero font-bold m-0"
          style={{
            fontSize: "clamp(26px, 7vw, 40px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            marginTop: "clamp(6px, 2vw, 10px)",
          }}
        >
          {toTitleCase(heading)}
        </h2>

        <p
          className="font-body font-normal m-0"
          style={{
            fontSize: "clamp(14px, 3.9vw, 19px)",
            lineHeight: 1.5,
            color: "#BFBFBF",
            marginTop: "clamp(12px, 3.6vw, 18px)",
          }}
        >
          {subtitle.join(" ")}
        </p>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: SLIDE_GAP,
            marginTop: "clamp(22px, 6.4vw, 32px)",
            overscrollBehaviorX: "contain",
          }}
        >
          {items.map((item) => (
            <div key={item.name} className="snap-center shrink-0 basis-full flex">
              <TestimonialCard
                fluid
                name={item.name}
                role={item.role}
                quote={item.quote}
                avatar={item.avatar}
              />
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-center"
          style={{ gap: 7, marginTop: "clamp(20px, 6vw, 30px)" }}
          role="tablist"
          aria-label="Testimonials"
        >
          {items.map((item, i) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={item.name}
              onClick={() => goTo(i)}
              className="p-0 border-0 cursor-pointer"
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: "#FFFFFF",
                transition: "width 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestimonialsMobile;
