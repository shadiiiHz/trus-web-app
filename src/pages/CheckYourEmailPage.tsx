import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import checkEmailIcon from "@/assets/auth/check-email-icon.svg";
import { resendVerificationEmail, reportApiError } from "@/lib/api/authApi";
import { showToast } from "@/lib/toast";

/**
 * Which flow sent the user here — picks the right copy (register's
 * "verify your account" text vs. forgotPassword's "reset your password"
 * text). Login's EMAIL_NOT_VERIFIED redirect reuses "register" since it's
 * the same verify-your-email message.
 */
type CheckEmailVariant = "register" | "forgotPassword";

interface CheckYourEmailLocationState {
  variant?: CheckEmailVariant;
  /** The address to resend the verification email to (register / login's EMAIL_NOT_VERIFIED flows). */
  email?: string;
}

export default function CheckYourEmailPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  const [resending, setResending] = useState(false);

  const state = location.state as CheckYourEmailLocationState | null;
  const variant: CheckEmailVariant =
    state?.variant === "forgotPassword" ? "forgotPassword" : "register";
  const email = state?.email;

  const { card } = siteConfig.contact;
  const { login, register, forgotPassword } = siteConfig.auth;
  const copy = variant === "forgotPassword" ? forgotPassword : register;

  const handleResend = async () => {
    if (resending) return;

    // Only the "register" variant (account verification, including login's
    // EMAIL_NOT_VERIFIED redirect) has a real resend endpoint wired up.
    // "forgotPassword" has no backend yet — see ForgotPasswordForm.
    if (variant !== "register" || !email) {
      setResending(true);
      window.setTimeout(() => setResending(false), 700);
      return;
    }

    setResending(true);
    try {
      await resendVerificationEmail(email);
      showToast(register.resendSuccess, "success");
    } catch (error) {
      reportApiError(error, {}, register.errors.resendFailed);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto w-full max-w-330 px-5 py-16">
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
                  src={checkEmailIcon}
                  alt=""
                  className="mx-auto mb-5 h-12 w-12"
                />
                <h1 className="mb-2 text-[28px] font-semibold text-[#171717]">
                  {copy.checkEmailHeading}
                </h1>
                <p className="text-body font-normal text-[#525252]">
                  {copy.checkEmailDescription}
                </p>
                <p className="mt-4 mb-8 text-body-sm text-[#DC2626]">
                  {copy.checkEmailHint}
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleResend}
                  disabled={resending}
                  className="mx-auto rounded-md px-6 py-2.5 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
                >
                  {resending ? copy.resending : copy.resend}
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
