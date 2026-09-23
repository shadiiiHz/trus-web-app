import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";

export default function LoginPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { card } = siteConfig.contact;
  const { login } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main
        className="pt-18"
        style={{ background: "#F5F5F7" }}
      >
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* lg:pl/pr line the row up with the navbar: left edge under the
              logo's last letter (logo width, ~81px), right edge under the
              language switch's right edge (its 136px login button + 20px
              gap = 156px inset from the container edge). */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-24 lg:pl-[80px]">
            {/* Left — dedicated login-page card (contact info reused, image left blank) */}
            <FadeIn direction="left" className="lg:w-[414px] lg:shrink-0">
              <LoginInfoCard
                tagline={card.tagline}
                cta={login.card.cta}
                office={card.office}
                phone={card.phone}
                email={card.email}
                officeLabel={login.card.officeLabel}
                phoneLabel={login.card.phoneLabel}
                emailLabel={login.card.emailLabel}
                height={414}
              />
            </FadeIn>

            {/* Right — login form, fills the remaining width up to the
                language-switch-aligned right edge */}
            <FadeIn direction="right" delay={0.1} className="lg:flex-1 max-w-[572px]">
              <div className="mx-auto lg:mx-0 lg:max-w-none font-body">
                <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
                  {login.heading}
                </h1>
                <p className="mb-8 text-[16px] font-normal text-[#525252]">
                  {login.subtitle}
                </p>

                <LoginForm copy={login} />
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
