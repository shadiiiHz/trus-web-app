import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { FadeIn } from "@/components/motion/FadeIn";
import type { SiteConfig } from "@/config/site.config";
import EditAccountForm from "@/components/auth/EditAccountForm";

export interface EditAccountFormPageProps {
  heading: string;
  subtitle: string;
  copy: SiteConfig["auth"]["editAccount"];
}

export function EditAccountFormPage({ heading, subtitle, copy }: EditAccountFormPageProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-auth-page-bg min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "var(--color-auth-page-surface)" }}>
        <div className="mx-auto w-full max-w-[1600px] px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-[1344px]">
            <FadeIn direction="up" className="mb-8">
              <h1 className="mb-2 text-[24px] font-body font-semibold text-auth-heading">
                {heading}
              </h1>
              <p className="text-body font-body font-semibold text-[#DC2626]">{subtitle}</p>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <EditAccountForm copy={copy} />
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

export default EditAccountFormPage;
