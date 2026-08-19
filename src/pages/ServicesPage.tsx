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

      <FooterSection />
    </div>
  );
}
