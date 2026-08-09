import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import TemplatesBanner from "@/components/templates/TemplateBanner";

// Body below the banner is still placeholder — design pending. Header/banner/
// footer are wired up so the page is reachable and navigable; the rest of
// the layout will be replaced once specified.
export default function TemplatesPage() {
  // Client-side navigation keeps whatever scroll position Home was at
  // (e.g. deep in the page) — always land at the top of this page instead.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen font-body antialiased">
      <Navbar />

      {/* pt-18 clears the fixed Navbar (h-18) — the banner itself starts
          right below it, full-bleed edge to edge. */}
      <div className="pt-18">
        <TemplatesBanner />
      </div>

      <main className="flex min-h-[60vh] items-center justify-center px-5">
        <h2
          className="text-display-md font-display font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #875dd9 0%, #5328a8 100%)",
          }}
        >
          Templates page is under construction
        </h2>
      </main>

      <FooterSection />
    </div>
  );
}
