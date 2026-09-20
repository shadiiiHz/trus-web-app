import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import emailVerifiedIcon from "@/assets/auth/email-verified-icon.svg";

export default function EmailVerifiedPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const { card } = siteConfig.contact;
  const { login, emailVerified } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* Same left card + right-content layout as the other auth screens,
              so this page lines up under the navbar identically. The card
              uses the shorter login/forgot-password height since there's no
              form here to stretch it. */}
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
              <div className="mx-auto text-center lg:mx-0 lg:max-w-none font-body">
                <img
                  src={emailVerifiedIcon}
                  alt=""
                  className="mx-auto mb-5 h-12 w-12"
                />
                <h1 className="mb-2 text-[28px] font-semibold text-[#171717]">
                  {emailVerified.heading}
                </h1>
                <p className="mb-8 text-body font-normal text-[#525252]">
                  {emailVerified.subtitle}
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate("/login")}
                  className="mx-auto rounded-md px-6 py-2.5 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
                >
                  {emailVerified.login}
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
