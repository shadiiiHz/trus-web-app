import { useRef, useState, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import "swiper/css";

import { siteConfig } from "@/config/site.config";
import { ServiceCard } from "@/components/services/ServiceCard";

const SLIDE_GAP = 12;
const AUTOPLAY_DELAY = 3500;
const TRANSITION_SPEED = 650;

export function ServicesMobile({
  iconMap,
}: {
  iconMap: Record<string, ReactNode>;
}) {
  const { eyebrow, heading, description, items } = siteConfig.services;

  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed) return;

    swiper.slideToLoop(index, TRANSITION_SPEED);
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

        {items.length > 0 && (
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper: SwiperClass) => {
              swiperRef.current = swiper;
              setActive(swiper.realIndex);
            }}
            onRealIndexChange={(swiper: SwiperClass) => {
              setActive(swiper.realIndex);
            }}
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={SLIDE_GAP}
            loop={items.length > 1}
            speed={TRANSITION_SPEED}
            grabCursor
            watchOverflow
            autoplay={
              items.length > 1
                ? {
                    delay: AUTOPLAY_DELAY,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            className="services-mobile-swiper"
            style={{
              marginTop: "clamp(22px, 6.4vw, 32px)",
              overflow: "hidden",
            }}
          >
            {items.map((service, i) => (
              <SwiperSlide
                key={service.id}
                style={{
                  height: "auto",
                  display: "flex",
                }}
              >
                <div className="w-full flex">
                  <ServiceCard
                    fluid
                    dark={i % 2 === 1}
                    icon={iconMap[service.id]}
                    title={service.title}
                    description={service.description}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {items.length > 1 && (
          <div
            className="flex items-center justify-center"
            style={{
              gap: 6,
              marginTop: "clamp(18px, 5.2vw, 26px)",
            }}
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
                  background: "#E5E5E5",
                  transition: "width 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesMobile;
