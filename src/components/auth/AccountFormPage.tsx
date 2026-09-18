import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { FadeIn } from "@/components/motion/FadeIn";
import type { SiteConfig } from "@/config/site.config";
import RegisterForm from "@/components/auth/RegisterForm";

export interface AccountFormPageProps {
  heading: string;
  subtitle: string;
  copy: SiteConfig["auth"]["register"];
}

// Shared shell for the Register and Edit Account pages — they render the
// exact same form, only the heading/subtitle text differs between the two.
export function AccountFormPage({ heading, subtitle, copy }: AccountFormPageProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-[1600px] px-6 py-10 sm:px-10">
          <FadeIn direction="up" className="mb-8">
            <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
              {heading}
            </h1>
            <p className="text-body font-normal text-[#525252]">{subtitle}</p>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <RegisterForm copy={copy} />
          </FadeIn>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

export default AccountFormPage;
