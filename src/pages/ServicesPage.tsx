import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import ServicesHeroSection from "@/components/services/ServicesHeroSection";
import ServicesListSection from "@/components/services/ServicesListSection";

export default function ServicesPage() {
  // Client-side navigation keeps whatever scroll position the previous page
  // was at — always land at the top of this page instead. useLayoutEffect
  // (not useEffect) so this runs before paint, matching TemplatesPage.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-white min-h-screen font-body antialiased">
      <Navbar />

      <ServicesHeroSection />

      <ServicesListSection />

      {/* Further sections (one per branch on the tree diagram above) land here. */}

      {/* Divider above the footer — specific to this page (the list section's
          last row no longer carries its own trailing border-bottom, see
          ServicesListSection), not part of the shared FooterSection. */}
      <div
        aria-hidden="true"
        style={{ borderTop: "1px solid rgba(255,255,255,0.3)", background: "var(--color-brand-bg)" }}
      />

      <FooterSection />
    </div>
  );
}
