import { useLayoutEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { useDownloadInvoices } from "@/hooks/billing/useDownloadInvoices";
import type { OrderResult } from "@/lib/api/checkoutApi";
import { formatMoney } from "@/components/select-services/pricing";
import {
  AccessDetailsIcon,
  CreatingServiceIcon,
  EmailNoticeIcon,
  OrderReceivedIcon,
  SuccessIcon,
} from "@/components/order-status/icons";

interface OrderStatusLocationState {
  order?: OrderResult;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/**
 * Shown after a successful "Pay now" on Select Services. The order comes from
 * the pay-now response, handed over through the router state — opening this
 * URL directly (no order) sends the person back to Select Services.
 */
export default function OrderStatusPage() {
  const { isInitialized, isAuthenticated, displayName } = useAuth();
  const location = useLocation();
  const { download, isLoading: downloading } = useDownloadInvoices();
  const copy = siteConfig.orderStatusPage;
  const order = (location.state as OrderStatusLocationState | null)?.order;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!order) return <Navigate to="/select-services" replace />;

  const name = order.userName || displayName;
  const serviceNames = order.services.map((s) => s.name).join(", ");
  const statusLabels: Record<string, string> = copy.status;
  const money = (amount: number) => formatMoney(amount, order.currency);

  // The checkout response carries a direct-download link (served as an
  // attachment, so navigating to it downloads without leaving the page).
  const handleDownloadInvoice = () => {
    if (order.invoicePdfUrl) {
      const link = document.createElement("a");
      link.href = order.invoicePdfUrl;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else if (order.invoiceId) {
      void download([order.invoiceId]);
    }
  };

  const steps = [
    { icon: <OrderReceivedIcon />, ...copy.steps.received },
    {
      icon: <CreatingServiceIcon />,
      title: copy.steps.creating.title,
      description: fill(copy.steps.creating.description, {
        services: serviceNames,
      }),
    },
    { icon: <AccessDetailsIcon />, ...copy.steps.access },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-body antialiased">
      <Navbar />

      <main className="pt-21 lg:pt-18">
        <div className="mx-auto w-full max-w-[1100px] px-4.5 pt-7 pb-8 sm:px-5 sm:pt-14 sm:pb-20">
          <FadeIn>
            <div className="flex flex-col items-center text-center max-sm:items-stretch max-sm:text-left">
              <div className="flex justify-center">
                <SuccessIcon />
              </div>
              <h1 className="mt-8 text-[24px] leading-10 font-semibold text-auth-heading max-sm:mt-3.5 max-sm:text-[20px] max-sm:leading-7">
                {copy.heading}
              </h1>
              <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#525252] max-sm:mt-2.5 max-sm:text-[14px] max-sm:leading-[19px]">
                {copy.subheading}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-10 max-sm:mt-[18px] max-sm:gap-6 lg:grid-cols-[1fr_400px] lg:gap-14">
            <div>
              <h2 className="text-[16px] leading-7 font-semibold text-auth-heading max-sm:text-[14px] max-sm:leading-6">
                {name ? fill(copy.greeting, { name }) : copy.greetingNoName}
              </h2>
              <p className="mt-1 text-[16px] leading-8 text-[#525252] max-sm:mt-2 max-sm:text-[14px] max-sm:leading-[19px]">
                {copy.intro}
              </p>

              <div className="mt-4 flex items-start gap-3 rounded-md bg-[#F4F0FC] px-5 py-4 max-sm:mt-4.5 max-sm:px-3.5 max-sm:py-3.5">
                <span className="mt-0.5 shrink-0 max-sm:[&_svg]:h-4 max-sm:[&_svg]:w-4">
                  <EmailNoticeIcon />
                </span>
                <div>
                  <p className="text-[14px] leading-6 font-semibold text-auth-primary max-sm:text-[12px] max-sm:leading-[15px]">
                    {copy.emailNotice.title}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-6 text-[#525252] max-sm:mt-2.5 max-sm:text-[12px] max-sm:leading-[15px]">
                    {copy.emailNotice.description}
                  </p>
                </div>
              </div>

              <h3 className="mt-4 text-[16px] leading-7 font-semibold text-auth-heading max-sm:mt-5.5 max-sm:text-[14px] max-sm:leading-5">
                {copy.whatsNext}
              </h3>
              <ol className="mt-4 flex flex-col gap-4 max-sm:gap-5">
                {steps.map((step) => (
                  <li key={step.title} className="flex items-start gap-3 max-sm:gap-2.5">
                    <span className="shrink-0">{step.icon}</span>
                    <div>
                      <p className="text-[14px] leading-6 font-semibold text-auth-heading max-sm:text-[12px] max-sm:leading-5">
                        {step.title}
                      </p>
                      <p className="text-[14px] leading-6 text-[#525252] max-sm:text-[12px] max-sm:leading-4">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <section className="h-[427px] w-full max-w-[400px] self-start justify-self-end rounded-[16px] border border-auth-border-light bg-white p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] max-sm:h-auto max-sm:px-4 max-sm:pt-5 max-sm:pb-4">
              <h2 className="text-[16px] leading-7 font-semibold text-auth-heading max-sm:leading-6">
                {copy.summary.heading}
              </h2>

              <ul className="mt-4 flex flex-col gap-2 rounded-md border border-auth-border-light bg-[#FAFAFA] p-4 max-sm:mt-3 max-sm:p-3.5">
                {order.services.map((service) => (
                  <li key={service.id} className="flex items-center justify-between gap-2">
                    <p className="text-[16px] leading-7 font-semibold text-auth-heading max-sm:text-[15px] max-sm:leading-[22px]">
                      {service.name}
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E5E5] bg-white px-2.5 py-0.5 text-[12px] font-medium text-[#404040] shrink-0 max-sm:h-[21px] max-sm:px-2 max-sm:py-0 max-sm:text-[10px]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[#A855F7]"
                      />
                      {statusLabels[service.status] ?? service.status}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 text-[14px] text-[#525252]">
                <div className="flex items-center justify-between border-b border-auth-divider pb-3 max-sm:pb-3.5">
                  <dt>{copy.summary.orderId}</dt>
                  <dd className="font-medium text-auth-heading">
                    {order.orderId}
                  </dd>
                </div>
                <div className="mt-3 flex items-center justify-between max-sm:mt-3.5">
                  <dt>{copy.summary.amount}</dt>
                  <dd className="font-medium text-auth-heading tabular-nums">
                    {money(order.amount)}
                  </dd>
                </div>
                {order.discount > 0 && (
                  <div className="mt-2 flex items-center justify-between max-sm:mt-4">
                    <dt>{copy.summary.discount}</dt>
                    <dd className="font-medium text-auth-heading tabular-nums">
                      -{money(order.discount)}
                      {order.couponCode ? ` (${order.couponCode})` : ""}
                    </dd>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-auth-divider pt-3">
                  <dt className="text-[16px] font-semibold text-auth-heading">
                    {copy.summary.finalAmount}
                  </dt>
                  <dd className="text-[16px] font-semibold text-auth-heading tabular-nums">
                    {money(order.finalAmount)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={downloading || !(order.invoicePdfUrl || order.invoiceId)}
                onClick={handleDownloadInvoice}
                className="mx-auto mt-6 block max-sm:mt-4 cursor-pointer text-[14px] font-semibold text-auth-primary underline underline-offset-4 transition-colors hover:text-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.summary.downloadInvoice}
              </button>
              <p className="mt-7 text-center text-[12px] leading-4 text-[#525252] max-sm:mt-3.5">
                {copy.summary.invoiceNote}
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
