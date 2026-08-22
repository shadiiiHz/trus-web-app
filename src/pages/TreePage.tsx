import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/sections/FooterSection";
import ServicesTree from "@/components/services/ServicesTree";
import { useLayoutEffect } from "react";

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
      <ServicesTree/>
      <FooterSection />
    </div>
  );
}
