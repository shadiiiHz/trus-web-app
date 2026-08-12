import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import TemplatesBanner from "@/components/templates/TemplateBanner";
import TemplatesGallery from "@/components/templates/TemplateGallery";

export default function TemplatesPage() {
  // Client-side navigation keeps whatever scroll position Home was at
  // (e.g. deep in the page) — always land at the top of this page instead.
  // useLayoutEffect (not useEffect) so this runs before the browser paints —
  // otherwise the first frame briefly renders at Home's old scrollY (often
  // past this page's shorter content, flashing blank space) before snapping
  // to the top on the next frame, which reads as a flicker.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-white min-h-screen font-body antialiased">
      <Navbar />

      {/* pt-18 clears the fixed Navbar (h-18) — the banner itself starts
          right below it, full-bleed edge to edge. */}
      <div className="pt-18">
        <TemplatesBanner />
      </div>

      <TemplatesGallery />

      <FooterSection />
    </div>
  );
}
