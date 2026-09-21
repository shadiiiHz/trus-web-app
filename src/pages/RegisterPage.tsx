import { useLayoutEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";

export default function RegisterPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const { card } = siteConfig.contact;
  const { login, register } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* Same left card + right-form layout as the login/forgot-password
              pages, so every auth screen lines up under the navbar identically.
              The register form has far more fields than login/forgot-password,
              so the card is taller (688px per design) and the columns are
              top-aligned instead of centered. On success the user is sent to
              /check-your-email, a separate page shared with the
              forgot-password flow. */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-24 lg:pl-20">
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
                height={688}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              <div className="mx-auto lg:mx-0 lg:max-w-none font-body">
                <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
                  {register.heading}
                </h1>
                <p className="mb-8 text-body font-normal text-[#525252]">
                  {register.subtitle}
                </p>

                <RegisterForm
                  copy={register}
                  status={status}
                  onStatusChange={setStatus}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
