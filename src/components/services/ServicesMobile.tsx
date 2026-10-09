import { useCallback, useRef, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { ServiceCard } from "@/components/services/ServiceCard";

const SLIDE_GAP = 12;

/**
 * Mobile / tablet Services — left-aligned header, a thin divider, then a
 * one-card-at-a-time swipeable carousel with pagination dots. Replaces the
 * desktop's pinned two-row crossing parallax.
 */
export function ServicesMobile({ iconMap }: { iconMap: Record<string, ReactNode> }) {
  const { eyebrow, heading, description, items } = siteConfig.services;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / (el.clientWidth + SLIDE_GAP));
    setActive((prev) => (prev === next ? prev : next));
  }, []);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * (el.clientWidth + SLIDE_GAP), behavior: "smooth" });
  };

  return (
    <section
      id="services"
      aria-label="Services"
      className="relative overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div
        className="mx-auto w-full max-w-330 px-5"
        style={{
          paddingTop: "clamp(56px, 16vw, 100px)",
          paddingBottom: "clamp(48px, 14vw, 88px)",
        }}
      >
        <p
          className="font-body font-normal uppercase m-0"
          style={{
            fontSize: "clamp(12px, 3.3vw, 16px)",
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
            fontSize: "clamp(26px, 7vw, 40px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            marginTop: "clamp(6px, 2vw, 10px)",
          }}
        >
          {heading}
        </h2>

        <p
          className="font-body font-normal m-0"
          style={{
            fontSize: "clamp(15px, 4.2vw, 20px)",
            lineHeight: 1.55,
            color: "#BFBFBF",
            marginTop: "clamp(14px, 4vw, 20px)",
          }}
        >
          {description}
        </p>

        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: "rgba(255,255,255,0.3)",
            marginTop: "clamp(22px, 6.4vw, 32px)",
          }}
        />

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          aria-label="Service cards"
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: SLIDE_GAP,
            marginTop: "clamp(22px, 6.4vw, 32px)",
            overscrollBehaviorX: "contain",
            alignItems: "stretch",
          }}
        >
          {items.map((service, i) => (
            <div key={service.id} className="snap-center shrink-0 basis-full flex">
              <ServiceCard
                fluid
                dark={i % 2 === 1}
                icon={iconMap[service.id]}
                title={service.title}
                description={service.description}
              />
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-center"
          style={{ gap: 6, marginTop: "clamp(18px, 5.2vw, 26px)" }}
          role="tablist"
          aria-label="Services"
        >
          {items.map((service, i) => (
            <button
              key={service.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={service.title}
              onClick={() => goTo(i)}
              className="p-0 border-0 cursor-pointer"
              style={{
                width: i === active ? 23 : 8,
                height: 8,
                borderRadius: 4,
                background: "#E3E3E3",
                transition: "width 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesMobile;
