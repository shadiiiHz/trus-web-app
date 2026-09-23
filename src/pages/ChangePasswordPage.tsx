import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth";

export default function ChangePasswordPage() {
  const { isInitialized, isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only for a signed-in user. Wait for AuthProvider's initial
  // sessionStorage read so a hard refresh doesn't bounce a valid session.
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const { card } = siteConfig.contact;
  const { login, changePassword } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* Same left card + right-form layout as the login/forgot-password
              pages, so every auth screen lines up under the navbar identically. */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24 lg:pl-20">
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
                height={610}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              <div className="mx-auto lg:mx-0 lg:max-w-none font-body">
                <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
                  {changePassword.heading}
                </h1>
                <p className="mb-8 text-body font-normal text-[#525252]">
                  {changePassword.subtitle}
                </p>

                <ChangePasswordForm copy={changePassword} />
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
