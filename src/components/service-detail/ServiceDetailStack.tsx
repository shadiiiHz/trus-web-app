import { useLayoutEffect, useRef } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailAutomation } from "@/config/serviceDetails.config";

/** Scroll distance (in viewport heights) spent on each card sliding in. */
const VH_PER_STEP = 1.8;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scroll-driven card stack: the section pins to the viewport and, as the page
 * scrolls, each card slides up over the previous one. Scrolling back reverses it.
 * Progress is derived from scroll position, so it is naturally reversible.
 */
export function ServiceDetailStack({ automation, image }: { automation: ServiceDetailAutomation; image: string }) {
  const { eyebrow, heading, imageAlt, items } = automation;
  const wrapRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = items.length;

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const sticky = stickyRef.current;
      const spacer = spacerRef.current;
      if (!sticky || !spacer) return;
      // Pinning starts when the section top reaches the sticky offset (the Navbar height).
      const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const total = spacer.offsetHeight;
      const progress = total > 0 ? clamp((pinTop - wrap.getBoundingClientRect().top) / total) : 0;
      // Cards wait below in a list (one card height apart) and each rises to the top slot in turn.
      const step = cardRefs.current[0]?.offsetHeight ?? 0;
      const u = progress * (count - 1);
      // The top slot stays fully opaque; only the waiting cards below it fade.
      listRef.current?.style.setProperty("--stack-step", `${step}px`);
      cardRefs.current.forEach((card, i) => {
        if (!card || i === 0) return;
        const pos = Math.max(0, i - (reduce ? Math.round(u) : u));
        card.style.transform = `translate3d(0, ${pos * step}px, 0)`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <section
      aria-labelledby="service-stack-heading"
      ref={wrapRef}
      className="relative overflow-clip"
      style={{ background: "#E3E3E3" }}
    >
      {/* Sticks just below the fixed Navbar; the vertical padding is the section's top/bottom space. */}
      <div ref={stickyRef} className="sticky top-21 h-[calc(100vh-84px)] overflow-hidden pt-[60px] lg:top-18 lg:h-[calc(100vh-72px)] lg:pt-20">
        <div className="mx-auto flex h-full w-full max-w-[1068px] flex-col px-5">
          <FadeIn direction="up">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#5B2BB9] lg:text-section-label">{eyebrow}</p>
            <h2
              id="service-stack-heading"
              className="mt-2 font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:mt-3 lg:text-[38px]"
            >
              {heading}
            </h2>
          </FadeIn>

          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3 lg:mt-20 lg:flex-row lg:gap-5">
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="aspect-[2.1/1] w-full shrink-0 rounded-[20px] object-cover lg:h-[264px] lg:w-[321px] lg:aspect-auto"
            />

            {/* All cards share one grid cell, so the stack is as tall as the tallest card. */}
            <ol
              ref={listRef}
              className="grid min-h-0 flex-1 content-start overflow-hidden"
              style={{
                maskImage: "linear-gradient(to bottom, #000 var(--stack-step, 40%), transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 var(--stack-step, 40%), transparent 100%)",
              }}
            >
              {items.map((item, i) => (
                <li
                  key={item.title}
                  ref={(el) => {
                    cardRefs.current[i] = el as HTMLDivElement | null;
                  }}
                  className="col-start-1 row-start-1 border-b border-[#B8B8B8] pb-5 pt-6 will-change-transform lg:h-[275px] lg:px-[25px] lg:pb-0 lg:pt-[13px]"
                  style={{ background: "#E3E3E3", zIndex: i }}
                >
                  <p className="font-body text-[12px] leading-none text-[#5B2BB9] lg:text-[14px]">
                    {String(i + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-body text-[18px] font-semibold leading-tight text-[#070606] lg:mt-1.5 lg:text-[24px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-justify font-body text-[13px] leading-5 text-[#070606] lg:mt-3 lg:text-[16px] lg:leading-[25px]">
                    {renderRichText(item.description)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      {/* Extra scroll distance while the section is pinned. */}
      <div ref={spacerRef} aria-hidden style={{ height: `${(count - 1) * VH_PER_STEP * 100}vh` }} />
    </section>
  );
}

export default ServiceDetailStack;
