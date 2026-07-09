import { useState } from "react";
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
import TemplateSection from "./components/sections/TemplateSection";
import { NavbarMotion } from "./components/motion/NavbarMotion";

export default function App() {
  const [hideNavbar, setHideNavbar] = useState(false);
  // Raw scrollY (pixels) so Hero / About animations fire at fixed pixel offsets
  // regardless of how many sections are added below.
  //
  // Pixel anchors (900 px viewport, Hero = 100 svh = 900 px):
  //   Galaxy fade-out : 0 → 280 px  (galaxy dims as user scrolls away)
  //   About glow ramp : scrollY 630–800 px
  //
  // WhyUsSection and PortfolioSection own their scroll progress internally.
  const { scrollY } = useScroll();

  // Gate the preloader on real hero-video readiness (canplaythrough), so it
  // fades out only when the galaxy is actually playing — not a frozen frame.
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  // Hero galaxy opacity
  // Fades the entire orbital galaxy out as the user scrolls past the hero.
  const heroOrbitOpacity = useTransform(scrollY, [0, 280], [1, 0]);

  // About image border glow
  // Brightens the About section image border as the user scrolls into it.
  const imageGlowIntensity = useTransform(scrollY, [630, 800], [0, 1]);

  return (
    <div className="bg-brand-bg min-h-screen font-body antialiased">
      <Preloader ready={heroVideoReady} />

      <NavbarMotion hidden={hideNavbar}>
        <Navbar />
      </NavbarMotion>

      <HeroSection
        orbitOpacity={heroOrbitOpacity}
        onVideoReady={() => setHeroVideoReady(true)}
      />

      <AboutSection imageGlowIntensity={imageGlowIntensity} />

      {/* Portfolio: self-contained sticky section — horizontal card parallax. */}
      <PortfolioSection />

      {/* Why Us: self-contained sticky section — scroll-split card grid. */}
      <WhyUsSection />

      {/* Template Categories: entrance-triggered card lighting cascade. */}
      <TemplateSection
        onEnter={() => setHideNavbar(true)}
        onLeave={() => setHideNavbar(false)}
      />

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
