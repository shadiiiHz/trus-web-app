import { useLayoutEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { FadeIn } from "@/components/motion/FadeIn";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { useBackendText } from "@/i18n/backendText";
import { downloadInvoices } from "@/lib/mock/selectServices";
import type { OrderResult } from "@/lib/mock/orders";
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
  const localize = useBackendText();
  const copy = siteConfig.orderStatusPage;
  const order = (location.state as OrderStatusLocationState | null)?.order;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!order) return <Navigate to="/select-services" replace />;

  const name = order.userName || displayName;
  const serviceNames = order.services.map((s) => localize(s.name)).join(", ");
  const money = (amount: number) => formatMoney(amount, order.currency);

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

      <main className="pt-18">
        <div className="mx-auto w-full max-w-[1100px] px-5 pt-14 pb-20">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <SuccessIcon />
              <h1 className="mt-8 text-[24px] leading-10 font-semibold text-auth-heading">
                {copy.heading}
              </h1>
              <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#525252]">
                {copy.subheading}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
            <div>
              <h2 className="text-[16px] leading-7 font-semibold text-auth-heading">
                {name ? fill(copy.greeting, { name }) : copy.greetingNoName}
              </h2>
              <p className="mt-3 text-[16px] leading-8 text-[#525252]">
                {copy.intro}
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-md bg-[#F4F0FC] px-5 py-4">
                <span className="mt-0.5 shrink-0">
                  <EmailNoticeIcon />
                </span>
                <div>
                  <p className="text-[14px] leading-6 font-semibold text-auth-primary">
                    {copy.emailNotice.title}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-6 text-[#525252]">
                    {copy.emailNotice.description}
                  </p>
                </div>
              </div>

              <h3 className="mt-6 text-[16px] leading-7 font-semibold text-auth-heading">
                {copy.whatsNext}
              </h3>
              <ol className="mt-5 flex flex-col gap-5">
                {steps.map((step) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span className="shrink-0">{step.icon}</span>
                    <div>
                      <p className="text-[14px] leading-6 font-semibold text-auth-heading">
                        {step.title}
                      </p>
                      <p className="text-[14px] leading-6 text-[#525252]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <section className="h-[511px] w-full max-w-[400px] self-start justify-self-end rounded-[16px] border border-auth-border-light bg-white p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <h2 className="text-[16px] leading-7 font-semibold text-auth-heading">
                {copy.summary.heading}
              </h2>

              <ul className="mt-4 flex flex-col gap-2 rounded-md border border-auth-border-light bg-[#FAFAFA] p-4">
                {order.services.map((service) => (
                  <li key={service.id}>
                    <p className="text-[16px] leading-7 font-semibold text-auth-heading">
                      {localize(service.name)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#DDD3F5] bg-[#FAF5FF] px-2.5 py-0.5 text-[12px] font-medium text-auth-primary">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-auth-primary"
                      />
                      {copy.status[service.status]}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 text-[14px] text-[#525252]">
                <div className="flex items-center justify-between border-b border-auth-divider pb-3">
                  <dt>{copy.summary.orderId}</dt>
                  <dd className="font-medium text-auth-heading">
                    {order.orderId}
                  </dd>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <dt>{copy.summary.amount}</dt>
                  <dd className="font-medium text-auth-heading tabular-nums">
                    {money(order.amount)}
                  </dd>
                </div>
                {order.discount > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <dt>{copy.summary.discount}</dt>
                    <dd className="font-medium text-auth-heading tabular-nums">
                      -{money(order.discount)}
                      {order.couponCode
                        ? ` (${copy.summary.couponSuffix})`
                        : ""}
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

              <Link
                to="/"
                className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-auth-primary text-[14px] font-semibold text-white transition-colors hover:bg-auth-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                {copy.summary.viewOrderStatus}
              </Link>
              <button
                type="button"
                onClick={() =>
                  void downloadInvoices(
                    order.invoiceId ? [order.invoiceId] : [],
                  )
                }
                className="mx-auto mt-5 block cursor-pointer text-[14px] font-semibold text-auth-primary underline underline-offset-4 transition-colors hover:text-auth-primary-hover"
              >
                {copy.summary.downloadInvoice}
              </button>
              <p className="mt-6 text-center text-[12px] leading-4 text-[#525252]">
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
