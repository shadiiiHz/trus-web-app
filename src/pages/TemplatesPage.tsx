import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";

// Placeholder — design pending. Header/footer are wired up so the page is
// reachable and navigable; the body content will be replaced once the
// layout is specified.
export default function TemplatesPage() {
  // Client-side navigation keeps whatever scroll position Home was at
  // (e.g. deep in the page) — always land at the top of this page instead.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-bg min-h-screen font-body antialiased">
      <Navbar />

      <main className="flex min-h-screen items-center justify-center px-5 pt-18">
        <h1
          className="text-display-md font-display font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #875dd9 0%, #5328a8 100%)",
          }}
        >
          Templates page is under construction
        </h1>
      </main>

      <FooterSection />
    </div>
  );
}
