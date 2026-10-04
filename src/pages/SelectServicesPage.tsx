import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";
import { fetchBillingOptions } from "@/lib/mock/selectServices";
import {
  applyCoupon,
  couponDiscount,
  couponErrorKind,
  type CouponResult,
} from "@/lib/api/couponApi";
import { createOrder } from "@/lib/mock/orders";
import {
  fetchSelectableServices,
  isSessionError,
  type SelectableService,
} from "@/lib/api/servicesApi";
import { AuthApiError } from "@/lib/api/authApi";
import type { BillingPeriod, ServiceSelection } from "@/components/select-services/types";
import { servicePrice } from "@/components/select-services/pricing";
import { BillingToggle } from "@/components/select-services/BillingToggle";
import { ServicesTable } from "@/components/select-services/ServicesTable";
import { DiscountCodeCard } from "@/components/select-services/DiscountCodeCard";
import { OrderSummaryCard } from "@/components/select-services/OrderSummaryCard";
import { AccountLockedNotice } from "@/components/select-services/AccountLockedNotice";

/**
 * Select Services — the post-login destination the backend's `ready: true`
 * login response sends a fully set-up account to (`next_page: "/service"`,
 * resolved to this page's own /select-services route by resolveNextPage()).
 * A not-yet-`ready` account can still pick services and see prices, but the
 * discount and payment buttons stay disabled until the profile is complete.
 *
 * The services list comes from `GET /billing/services`; the coupon check is
 * still mocked (see `@/lib/mock/selectServices`) until that endpoint exists.
 */
export default function SelectServicesPage() {
  const { isInitialized, isAuthenticated, isReady, logout } = useAuth();
  const navigate = useNavigate();
  const copy = siteConfig.selectServicesPage;

  const [services, setServices] = useState<SelectableService[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selections, setSelections] = useState<Record<string, ServiceSelection>>({});
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [appliedCoupon, setAppliedCoupon] = useState<{ result: CouponResult; cartKey: string } | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [yearlySavePercent, setYearlySavePercent] = useState<number | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    const controller = new AbortController();
    fetchSelectableServices(controller.signal)
      .then(({ services: list, currency }) => {
        setServices(list);
        setCurrency(currency);
        setLoading(false);
        setSelections(
          Object.fromEntries(
            list.map((s) => [
              s.id,
              { selected: s.purchased, quantity: s.baseQuantity, period: "yearly" },
            ]),
          ),
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoading(false);
        if (isSessionError(error)) {
          showToast(
            error.code === "ACCOUNT_DISABLED"
              ? copy.errors.accountDisabled
              : copy.errors.sessionExpired,
            "error",
          );
          logout();
          navigate("/login", { replace: true });
          return;
        }
        showToast(
          error instanceof AuthApiError && error.code !== "NETWORK_ERROR"
            ? error.message
            : copy.errors.loadFailed,
          "error",
        );
      });
    fetchBillingOptions().then((options) => {
      if (!controller.signal.aborted) setYearlySavePercent(options.yearlySavePercent);
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  const updateSelection = (id: string, patch: Partial<ServiceSelection>) =>
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const toggleAll = (selected: boolean) =>
    setSelections((prev) =>
      Object.fromEntries(Object.entries(prev).map(([id, s]) => [id, { ...s, selected }])),
    );

  // The header toggle switches every row at once; the rows' radios for the
  // other period are disabled, so a row can't diverge from it.
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
  // The backend calculates a coupon for exactly the cart it was applied to,
  // so any change to the selection, quantities or billing period drops it:
  // the code has to be applied again.
  const cartKey = useMemo(
    () =>
      `${billing}|${services
        .filter((s) => selections[s.id]?.selected)
        .map((s) => `${s.id}:${selections[s.id].quantity}`)
        .join(",")}`,
    [billing, services, selections],
  );
  const coupon = appliedCoupon?.cartKey === cartKey ? appliedCoupon.result : null;
  const discount = couponDiscount(coupon, servicesTotal);

  const handleSessionError = (error: unknown): boolean => {
    if (!isSessionError(error)) return false;
    showToast(
      error.code === "ACCOUNT_DISABLED" ? copy.errors.accountDisabled : copy.errors.sessionExpired,
      "error",
    );
    logout();
    navigate("/login", { replace: true });
    return true;
  };

  const handleApplyCoupon = async (
    code: string,
  ): Promise<"applied" | "handled" | { error: keyof typeof copy.discount.errors }> => {
    const chosen = services.filter((s) => selections[s.id]?.selected);
    if (chosen.length === 0) {
      showToast(copy.summary.noServicesSelected, "error");
      return "handled";
    }
    try {
      const result = await applyCoupon(
        code,
        billing,
        chosen.map((s) => ({ workflowId: s.id, quantity: selections[s.id].quantity })),
      );
      setAppliedCoupon({ result, cartKey });
      return "applied";
    } catch (error) {
      if (handleSessionError(error)) return "handled";
      if (error instanceof AuthApiError && error.code !== "NETWORK_ERROR") {
        const kind = couponErrorKind(error);
        if (kind === "noServices") {
          showToast(copy.summary.noServicesSelected, "error");
          return "handled";
        }
        return { error: kind === "other" ? "applyFailed" : kind };
      }
      throw error;
    }
  };

  const handlePay = async () => {
    if (paying) return;
    const chosen = services.filter((s) => selections[s.id]?.selected);
    if (chosen.length === 0) {
      showToast(copy.summary.noServicesSelected, "error");
      return;
    }
    setPaying(true);
    try {
      // TODO: the real pay-now endpoint replaces this mock once the backend ships it.
      const order = await createOrder({
        services: chosen.map((s) => ({
          id: s.id,
          name: s.name,
          quantity: selections[s.id].quantity,
          period: selections[s.id].period,
        })),
        couponCode: coupon?.code ?? null,
        autoRenew,
        currency,
        amount: servicesTotal,
        discount,
      });
      navigate("/order-status", { state: { order } });
    } catch {
      showToast(copy.summary.paymentFailed, "error");
      setPaying(false);
    }
  };

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-body antialiased">
      <Navbar />

      <main className="bg-white pt-18">
        <div className="mx-auto w-full max-w-[1380px] px-5 pt-8 pb-8">
          {!isReady && (
            <div className="mb-8">
              <AccountLockedNotice copy={copy.locked} href="/edit-account" />
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[24px] leading-8 font-semibold text-auth-heading">
                {copy.heading}
              </h1>
              <p className="mt-2 text-body font-body font-semibold text-[#DC2626]">{copy.notice}</p>
            </div>
            <BillingToggle
              value={billing}
              onChange={changeBilling}
              labels={copy.billing}
              ariaLabel={copy.billing.ariaLabel}
              yearlySavePercent={yearlySavePercent}
              saveLabel={copy.billing.savePercent}
            />
          </div>

          <div className="mt-8">
            <ServicesTable
              services={services}
              currency={currency}
              loading={loading}
              selections={selections}
              onChange={updateSelection}
              onToggleAll={toggleAll}
              billing={billing}
              billingLabels={copy.billing}
              copy={copy.table}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DiscountCodeCard copy={copy.discount} onApply={handleApplyCoupon} disabled={!isReady} />
            <OrderSummaryCard
              copy={copy.summary}
              servicesTotal={servicesTotal}
              currency={currency}
              discount={discount}
              autoRenew={autoRenew}
              onAutoRenewChange={setAutoRenew}
              onPay={handlePay}
              loading={paying}
              disabled={!isReady}
            />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
