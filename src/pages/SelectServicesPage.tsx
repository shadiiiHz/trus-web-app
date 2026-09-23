import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";
import { fetchSelectableServices, type CouponResult, type SelectableService } from "@/lib/mock/selectServices";
import type { BillingPeriod, ServiceSelection } from "@/components/select-services/types";
import { servicePrice } from "@/components/select-services/pricing";
import { BillingToggle } from "@/components/select-services/BillingToggle";
import { ServicesTable } from "@/components/select-services/ServicesTable";
import { DiscountCodeCard } from "@/components/select-services/DiscountCodeCard";
import { OrderSummaryCard } from "@/components/select-services/OrderSummaryCard";

/**
 * Select Services — the post-login destination the backend's `ready: true`
 * login response sends a fully set-up account to (`next_page: "/service"`,
 * resolved to this page's own /select-services route by resolveNextPage()).
 * Keeps the same auth/ready gate as /edit-account so a not-yet-`ready`
 * account can't reach it by URL.
 *
 * The services list and coupon check are mocked (see `@/lib/mock/selectServices`)
 * until the backend endpoints exist.
 */
export default function SelectServicesPage() {
  const { isInitialized, isAuthenticated, isReady } = useAuth();
  const copy = siteConfig.selectServicesPage;

  const [services, setServices] = useState<SelectableService[]>([]);
  const [selections, setSelections] = useState<Record<string, ServiceSelection>>({});
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSelectableServices().then((list) => {
      if (cancelled) return;
      setServices(list);
      setSelections(
        Object.fromEntries(
          list.map((s) => [
            s.id,
            { selected: s.defaultSelected, quantity: s.defaultQuantity, period: "monthly" },
          ]),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSelection = (id: string, patch: Partial<ServiceSelection>) =>
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const toggleAll = (selected: boolean) =>
    setSelections((prev) =>
      Object.fromEntries(Object.entries(prev).map(([id, s]) => [id, { ...s, selected }])),
    );

  // The header toggle switches every row at once; each row's own radio can
  // still override it afterwards.
  const changeBilling = (period: BillingPeriod) => {
    setBilling(period);
    setSelections((prev) =>
      Object.fromEntries(Object.entries(prev).map(([id, s]) => [id, { ...s, period }])),
    );
  };

  const servicesTotal = useMemo(
    () =>
      services.reduce((sum, service) => {
        const s = selections[service.id];
        return s?.selected ? sum + servicePrice(service, s.quantity, s.period) : sum;
      }, 0),
    [services, selections],
  );
  const discount = coupon ? (servicesTotal * coupon.percentOff) / 100 : 0;

  const handlePay = () => {
    if (servicesTotal === 0) {
      showToast(copy.summary.noServicesSelected, "error");
      return;
    }
    // TODO: hand off to the payment endpoint once the backend ships it.
    showToast(copy.summary.paymentUnavailable, "info");
  };

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isReady) return <Navigate to="/edit-account" replace />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-body antialiased">
      <Navbar />

      <main className="bg-white pt-18">
        <div className="mx-auto w-full max-w-[1380px] px-5 pt-8 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[24px] leading-8 font-semibold text-auth-heading">
                {copy.heading}
              </h1>
              <p className="mt-2 text-[14px] leading-5 text-auth-muted">{copy.subtitle}</p>
            </div>
            <BillingToggle
              value={billing}
              onChange={changeBilling}
              labels={copy.billing}
              ariaLabel={copy.billing.ariaLabel}
            />
          </div>

          <div className="mt-8">
            <ServicesTable
              services={services}
              selections={selections}
              onChange={updateSelection}
              onToggleAll={toggleAll}
              copy={copy.table}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DiscountCodeCard copy={copy.discount} onApply={setCoupon} />
            <OrderSummaryCard
              copy={copy.summary}
              servicesTotal={servicesTotal}
              discount={discount}
              autoRenew={autoRenew}
              onAutoRenewChange={setAutoRenew}
              onPay={handlePay}
            />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
