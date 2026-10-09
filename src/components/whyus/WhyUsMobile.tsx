import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { WhyUsCard } from "@/components/whyus/WhyUsCard";

/** One stacked card — its border pulses as it travels through the viewport. */
function MobileCard({
  card,
}: {
  card: (typeof siteConfig.whyUs.cards)[number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 25%"],
  });
  const borderProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div ref={ref}>
      <WhyUsCard
        number={card.number}
        label={card.label}
        title={card.title}
        bullets={card.bullets}
        borderProgress={borderProgress}
        fluid
      />
    </div>
  );
}

/**
 * Mobile / tablet Why Us — left-aligned header followed by the four process
 * cards stacked full-width. No pinning or scroll-split (the desktop effect
 * needs a wide viewport); each card keeps its animated border pulse.
 */
export function WhyUsMobile() {
  const { cards, eyebrow, headline, description } = siteConfig.whyUs;

  return (
    <div
      id="why-us"
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 28% at 50% 0%, rgba(91,43,185,0.28) 0%, transparent 70%), var(--color-brand-bg)",
      }}
    >
      <div
        className="mx-auto w-full max-w-330 px-5"
        style={{
          paddingTop: "clamp(48px, 14vw, 88px)",
          paddingBottom: "clamp(48px, 14vw, 88px)",
        }}
      >
        <p
          className="font-body font-normal uppercase m-0"
          style={{
            fontSize: "clamp(12px, 3.2vw, 15px)",
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
            marginTop: "clamp(8px, 2.5vw, 12px)",
          }}
        >
          {headline.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p
          className="font-body font-normal m-0"
          style={{
            fontSize: "clamp(14px, 3.8vw, 18px)",
            lineHeight: 1.35,
            color: "#BFBFBF",
            marginTop: "clamp(10px, 3vw, 16px)",
          }}
        >
          {description}
        </p>

        <div
          className="flex flex-col"
          style={{ gap: "clamp(20px, 6vw, 28px)", marginTop: "clamp(28px, 8vw, 40px)" }}
        >
          {cards.map((card) => (
            <MobileCard key={card.number} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WhyUsMobile;
