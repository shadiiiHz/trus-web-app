import { useEffect, useLayoutEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordSuccessPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized, isAuthenticated, logout } = useAuth();

  const passwordReset = Boolean(
    (location.state as { passwordReset?: boolean } | null)?.passwordReset,
  );

  // The reset is done — end the session so the "Log in" button starts a
  // fresh sign-in with the new password.
  useEffect(() => {
    if (isInitialized && passwordReset && isAuthenticated) logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, passwordReset, isAuthenticated]);

  // Wait for AuthProvider's initial sessionStorage read before deciding.
  if (!isInitialized) return null;

  // Only reachable right after a successful reset — ResetPasswordForm
  // navigates here with this flag. A direct visit goes back to the form
  // (or to login, when signed out). The user is logged out on arrival, so
  // being signed out here is expected and not redirected.
  if (!passwordReset) {
    return (
      <Navigate to={isAuthenticated ? "/reset-password" : "/login"} replace />
    );
  }

  const { card } = siteConfig.contact;
  const { login, resetPassword } = siteConfig.auth;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
          {/* Same left card + right-content layout as the email-verified
              page, with the shorter card since there's no form here. */}
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
                height={446}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              <div className="mx-auto text-center lg:mx-0 lg:max-w-none font-body">
                <h1 className="mb-2 text-[24px] font-semibold text-[#171717]">
                  {resetPassword.successHeading}
                </h1>
                <p className="mb-6 text-body font-normal text-[#525252]">
                  {resetPassword.successSubtitle}
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate("/login", { replace: true })}
                  className="mx-auto rounded-md px-4 py-2.5 text-body-sm leading-5 font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
                >
                  {resetPassword.continue}
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
