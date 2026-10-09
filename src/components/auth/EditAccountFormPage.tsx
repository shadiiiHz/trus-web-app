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
  isReady: boolean;
}

export function EditAccountFormPage({
  heading,
  subtitle,
  copy,
  isReady
}: EditAccountFormPageProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-auth-page-bg min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-21 bg-auth-page-bg lg:pt-18 lg:bg-auth-page-surface">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-[1344px]">
            <FadeIn direction="up" className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-[20px] leading-7 font-body font-semibold text-auth-heading sm:text-[24px] sm:leading-normal">
                {heading}
              </h1>
              {!isReady && (
                <p className="text-body leading-6 font-body font-semibold text-[#DC2626] sm:leading-normal">
                  {subtitle}
                </p>
              )}
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
