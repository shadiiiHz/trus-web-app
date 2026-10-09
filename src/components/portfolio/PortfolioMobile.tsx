import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import "swiper/css";

import { siteConfig } from "@/config/site.config";
import { toTitleCase } from "@/utils/text";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

const SLIDE_GAP = 12;
const AUTOPLAY_DELAY = 3500;
const TRANSITION_SPEED = 650;

/**
 * Mobile / tablet Portfolio
 * - One project card per slide
 * - Infinite looping
 * - Smooth touch/swipe interaction
 * - Custom pagination dots
 */
export function PortfolioMobile() {
  const { eyebrow, headline, description, moreProjects, projects } =
    siteConfig.portfolio;

  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed) return;

    swiper.slideToLoop(index, TRANSITION_SPEED);
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
        {projects.length > 0 && (
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setActive(swiper.realIndex);
            }}
            onRealIndexChange={(swiper) => {
              setActive(swiper.realIndex);
            }}
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={SLIDE_GAP}
            loop={projects.length > 1}
            speed={TRANSITION_SPEED}
            grabCursor
            watchOverflow
            autoplay={
              projects.length > 1
                ? {
                    delay: AUTOPLAY_DELAY,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            className="portfolio-mobile-swiper"
            style={{
              marginTop: "clamp(24px, 7.4vw, 36px)",
              overflow: "hidden",
            }}
          >
            {projects.map((p) => (
              <SwiperSlide key={p.id}>
                <ProjectCard image={p.image} link={p.link} fluid />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Custom pagination dots */}
        {projects.length > 1 && (
          <div
            className="flex items-center justify-center"
            style={{
              gap: 6,
              marginTop: "clamp(20px, 6.9vw, 32px)",
            }}
            role="group"
            aria-label="Portfolio projects"
          >
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-current={i === active ? "true" : undefined}
                aria-label={`Go to project ${i + 1}`}
                onClick={() => goTo(i)}
                className="shrink-0 p-0 border-0 cursor-pointer"
                style={{
                  width: i === active ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: "#E5E5E5",
                  opacity: i === active ? 1 : 0.95,
                  transition: "width 0.25s ease, opacity 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioMobile;
