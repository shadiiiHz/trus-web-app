import { useEffect, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { Preloader } from "@/components/loader/Preloader";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { WhyUsSection } from "@/components/sections/WhyUsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FooterSection } from "@/components/sections/FooterSection";
import TemplateSection from "@/components/sections/TemplateSection";

export default function HomePage() {
  // Raw scrollY (pixels) so Hero / About animations fire at fixed pixel offsets
  // regardless of how many sections are added below.
  //
  // Pixel anchors (900 px viewport, Hero = 100 svh = 900 px):
  //   Galaxy fade-out : 0 → 280 px  (galaxy dims as user scrolls away)
  //
  // WhyUsSection and PortfolioSection own their scroll progress internally.
  const { scrollY } = useScroll();

  // Gate the preloader on real hero-video readiness (canplaythrough), so it
  // fades out only when the galaxy is actually playing — not a frozen frame.
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [templateReady, setTemplateReady] = useState(false);

  // Hero galaxy opacity
  // Fades the entire orbital galaxy out as the user scrolls past the hero.
  const heroOrbitOpacity = useTransform(scrollY, [0, 280], [1, 0]);

  // Arriving here with a hash (e.g. from the Templates page's "About" nav
  // link, which routes to "/#about") should land on that section — but the
  // Preloader locks body scroll (`overflow: hidden`) until it's ready, so a
  // scrollIntoView before then would silently no-op. Poll each frame until
  // the lock lifts, then scroll once.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) {
      // Client-side navigation here (e.g. the navbar logo from Templates)
      // doesn't reset scroll the way a full page load would — without
      // this, landing on Home keeps whatever scrollY the previous page had.
      window.scrollTo(0, 0);
      return;
    }
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      if (document.body.style.overflow === "hidden") {
        requestAnimationFrame(tryScroll);
        return;
      }
      document.getElementById(id)?.scrollIntoView();
    };
    tryScroll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen font-body antialiased">
      <Preloader ready={heroVideoReady && templateReady} />

      <Navbar />

      <HeroSection
        orbitOpacity={heroOrbitOpacity}
        onVideoReady={() => setHeroVideoReady(true)}
      />

      <AboutSection />

      {/* Portfolio: self-contained sticky section — horizontal card parallax. */}
      <PortfolioSection />

      {/* Why Us: self-contained sticky section — scroll-split card grid. */}
      <WhyUsSection />

      {/* Template Categories: entrance-triggered card lighting cascade. */}
      <TemplateSection onReady={() => setTemplateReady(true)} />

      {/* Services: scroll-driven two-row card parallax. */}
      <ServicesSection />

      {/* Team: editorial grid with grayscale→colour hover + animated info panel. */}
      <TeamSection />

      {/* Testimonials: sticky 350vh section — globe fades out as cards rise. */}
      <TestimonialsSection />

      {/* Contact Us: white section — info card border lights on scroll entry. */}
      <ContactSection />

      {/* Footer: TRUS background word fades in on scroll. */}
      <FooterSection />
    </div>
  );
}
