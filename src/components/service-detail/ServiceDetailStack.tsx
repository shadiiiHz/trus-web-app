import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import { ServiceStackIconGlyph, type ServiceStackIcon } from "@/components/service-detail/socialIcons";
import type { ServiceDetailAutomation } from "@/config/serviceDetails.config";

/** Scroll distance (in viewport heights) spent on each card sliding in. */
const VH_PER_STEP = 3;

/** Empty space (px) kept between the card in place and the next one waiting below it. */
const CARD_GAP = 40;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Scroll-driven card stack: the section pins to the viewport and, as the page
 * scrolls, each card slides up over the previous one. Scrolling back reverses it.
 * Progress is derived from scroll position, so it is naturally reversible.
 */
export function ServiceDetailStack({
  automation,
  image,
  icons,
  links,
}: {
  automation: ServiceDetailAutomation;
  image: string;
  /** One glyph per item, shown before its title. */
  icons?: readonly ServiceStackIcon[];
  /** One route per item; when set, the item's title links to it. */
  links?: readonly string[];
}) {
  const { heading, imageAlt, items } = automation;
  const wrapRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = items.length;

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      // Below lg the cards are a plain list: no pinning, no sliding.
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        cardRefs.current.forEach((card) => card && (card.style.transform = ""));
        return;
      }
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
      cardRefs.current.forEach((card, i) => {
        if (!card || i === 0) return;
        const pos = Math.max(0, i - (reduce ? Math.round(u) : u));
        card.style.transform = `translate3d(0, ${pos * (step + CARD_GAP)}px, 0)`;
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
      className="relative overflow-clip shadow-[0_1px_0_#070606]"
      style={{ background: "#070606" }}
    >
      {/* Sticks just below the fixed Navbar; the vertical padding is the section's top/bottom space. */}
      <div ref={stickyRef} className="px-0 py-14 lg:sticky lg:top-18 lg:h-[calc(100vh-72px)] lg:overflow-hidden lg:py-0 lg:pt-20">
        <div className="mx-auto flex h-full w-full max-w-[1064px] flex-col px-5 min-[1104px]:px-0">
          <FadeIn direction="up">
            <h2
              id="service-stack-heading"
              className="font-hero text-[26px] font-bold leading-[34px] text-white lg:text-[32px] lg:leading-[42px]"
            >
              {heading}
            </h2>
          </FadeIn>

          <div className="mt-10 flex flex-col gap-4 lg:mt-[67px] lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-5">
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="h-[200px] w-full shrink-0 rounded-lg lg:rounded-2xl object-cover object-center lg:object-left lg:h-[267px] lg:w-[420px] lg:aspect-auto"
            />

            {/* All cards share one grid cell, so the stack is as tall as the tallest card. */}
            <ol
              className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:content-start lg:gap-0 lg:overflow-hidden"
            >
              {items.map((item, i) => (
                <li
                  key={item.title}
                  ref={(el) => {
                    cardRefs.current[i] = el as HTMLDivElement | null;
                  }}
                  className={`lg:col-start-1 lg:row-start-1 lg:will-change-transform lg:h-[267px] lg:pt-5 ${i === 0 ? "lg:px-5" : "lg:px-[25px]"} ${i < count - 1 ? "lg:border-b lg:border-white/30" : ""}`}
                  style={{ background: "#070606", zIndex: i }}
                >
                  <p className="font-body text-[14px] leading-6 text-[#9F7EE1]">
                    {String(i + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
                  </p>
                  <h3 className={`mt-0 flex items-start gap-2 font-body text-[18px] font-bold leading-[31px] text-white lg:text-[20px] ${i === 0 ? "lg:mt-2" : "lg:mt-0"}`}>
                    {icons?.[i] && (
                      <ServiceStackIconGlyph
                        name={icons[i]}
                        className="size-8 shrink-0"
                      />
                    )}
                    {links?.[i] ? (
                      <Link to={links[i]} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-[#9F7EE1]">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className={`mt-2.5 text-justify font-body text-[16px] leading-[22px] text-white ${i === 0 ? "lg:mt-2" : "lg:mt-2.5"} ${i < 3 ? "lg:leading-[22px]" : "lg:leading-[26px]"}`}>
                    {renderRichText(item.description)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      {/* Extra scroll distance while the section is pinned. */}
      <div ref={spacerRef} aria-hidden className="hidden lg:block" style={{ height: `${(count - 1) * VH_PER_STEP * 100}vh` }} />
    </section>
  );
}

export default ServiceDetailStack;
