import { useLayoutEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const { isInitialized, isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only for a signed-in user. Wait for AuthProvider's initial
  // sessionStorage read so a hard refresh doesn't bounce a valid session.
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const { card } = siteConfig.contact;
  const { login, resetPassword } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-21 bg-[#FAFAFA] lg:pt-18 lg:bg-[#F5F5F7]">
        <div className="mx-auto w-full max-w-330 px-5 py-[52px] lg:py-16">
          {/* Same left card + right-form layout as the login/forgot-password/
              change-password pages, so every auth screen lines up under the
              navbar identically. */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24 lg:pl-20">
            <FadeIn direction="left" className="hidden lg:block lg:w-[414px] lg:shrink-0">
              <LoginInfoCard
                tagline={card.tagline}
                cta={login.card.cta}
                office={card.office}
                phone={card.phone}
                email={card.email}
                officeLabel={login.card.officeLabel}
                phoneLabel={login.card.phoneLabel}
                emailLabel={login.card.emailLabel}
                height={490}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              <div className="mx-auto lg:mx-0 lg:max-w-none font-body">
                {/* Mobile: heading sits above the form, inset to line up with
                    the card's content; the form is in a bordered white card
                    (Figma). Desktop: bare, unchanged. */}
                <div className="px-4 lg:px-0">
                  <h1 className="mb-2 text-[20px] leading-7 font-semibold text-[#171717] lg:text-[24px] lg:leading-normal">
                    {resetPassword.heading}
                  </h1>
                  <p className="mb-4 text-body leading-6 font-normal text-[#525252] lg:mb-8 lg:leading-normal">
                    {resetPassword.subtitle}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                  <ResetPasswordForm copy={resetPassword} />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
