import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import checkEmailIcon from "@/assets/auth/check-email-icon.svg";
import {
  getForgotPasswordErrorCode,
  reportApiError,
} from "@/lib/api/authApi";
import { useRequestPasswordReset, useResendVerification } from "@/hooks/auth/useAuthMutations";
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
  /** The address to resend the verification (register / login's EMAIL_NOT_VERIFIED) or password reset (forgotPassword) email to. */
  email?: string;
}

export default function CheckYourEmailPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  const { mutate: requestReset } = useRequestPasswordReset();
  const { mutate: resendVerification } = useResendVerification();
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

    // Without an address (e.g. the page was opened directly) there's
    // nothing to resend to — just flash the loading state.
    if (!email) {
      setResending(true);
      window.setTimeout(() => setResending(false), 700);
      return;
    }

    if (variant === "forgotPassword") {
      setResending(true);
      try {
        await requestReset(email);
        showToast(forgotPassword.resendSuccess, "success");
      } catch (error) {
        const code = getForgotPasswordErrorCode(error);
        if (code) {
          showToast(
            code === "EMAIL_REQUIRED"
              ? forgotPassword.errors.emailRequired
              : forgotPassword.errors.emailInvalid,
            "error",
          );
        } else {
          reportApiError(error, {}, forgotPassword.errors.requestFailed);
        }
      } finally {
        setResending(false);
      }
      return;
    }

    setResending(true);
    try {
      await resendVerification(email);
      showToast(register.resendSuccess, "success");
    } catch (error) {
      reportApiError(
        error,
        { EMAIL_ALREADY_VERIFIED: register.errors.emailAlreadyVerified },
        register.errors.resendFailed,
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-21 bg-[#FAFAFA] lg:pt-18 lg:bg-[#F5F5F7]">
        <div className="mx-auto w-full max-w-330 px-4 py-8 lg:px-5 lg:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24 lg:pl-[80px]">
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
                height={446}
              />
            </FadeIn>

            <FadeIn
              direction="right"
              delay={0.1}
              className="lg:flex-1 max-w-[572px]"
            >
              {/* Mobile: content sits in a bordered white card (Figma);
                  desktop: bare, unchanged. */}
              <div className="mx-auto rounded-2xl border border-[#E5E5E5] bg-white px-4 py-[30px] text-center shadow-sm lg:mx-0 lg:max-w-none lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none font-body">
                <img
                  src={checkEmailIcon}
                  alt=""
                  className="mx-auto mb-5 h-12 w-12"
                />
                <h1 className="mb-3 text-[20px] leading-8 font-semibold text-[#171717] lg:mb-2 lg:text-[28px] lg:leading-normal">
                  {copy.checkEmailHeading}
                </h1>
                <p className="text-[15px] leading-[23px] font-normal text-[#525252] lg:text-body lg:leading-normal">
                  {copy.checkEmailDescription}
                </p>
                <p className="mt-6 mb-4 text-body-sm leading-[17px] font-bold text-[#DC2626] lg:mt-4 lg:mb-8 lg:leading-normal">
                  {copy.checkEmailHint}
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleResend}
                  loading={resending}
                  className="mx-auto h-[38px] rounded-md px-6 !py-0 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
                >
                  {copy.resend}
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
