import { useLayoutEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const { card } = siteConfig.contact;
  const { login, forgotPassword } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* Same left card + right-form layout as the login page, so the
              two auth screens line up under the navbar identically. The
              form is shorter than the card, so it's vertically centered
              against the card instead of stretching/top-aligning. */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24 lg:pl-[80px]">
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
                height={446}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              <div className="mx-auto lg:mx-0 lg:max-w-none font-body">
                <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
                  {forgotPassword.heading}
                </h1>
                <p className="mb-8 text-body font-normal text-[#525252]">
                  {forgotPassword.subtitle}
                </p>

                <ForgotPasswordForm
                  copy={forgotPassword}
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
