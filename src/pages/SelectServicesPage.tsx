import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";
import { fetchBillingOptions } from "@/lib/mock/selectServices";
import {
  couponDiscount,
  couponErrorKind,
  type CouponResult,
} from "@/lib/api/couponApi";
import { checkoutErrorKind } from "@/lib/api/checkoutApi";
import { isSessionError } from "@/lib/api/servicesApi";
import { useSelectableServices } from "@/hooks/queries/useSelectableServices";
import { useApplyCoupon } from "@/hooks/billing/useApplyCoupon";
import { useCheckout } from "@/hooks/billing/useCheckout";
import { AuthApiError } from "@/lib/api/authApi";
import type {
  BillingPeriod,
  ServiceSelection,
} from "@/components/select-services/types";
import { servicePrice } from "@/components/select-services/pricing";
import { BillingToggle } from "@/components/select-services/BillingToggle";
import { ServicesTable } from "@/components/select-services/ServicesTable";
import { DiscountCodeCard } from "@/components/select-services/DiscountCodeCard";
import { OrderSummaryCard } from "@/components/select-services/OrderSummaryCard";
import { StickyCheckoutBar } from "@/components/select-services/StickyCheckoutBar";
import { AccountLockedNotice } from "@/components/select-services/AccountLockedNotice";

const SERVICE_COUNT_KEY = "trus:services-count";

/** Last known number of services, so the skeleton matches the real table. */
function readCachedServiceCount(): number | undefined {
  try {
    const n = Number(localStorage.getItem(SERVICE_COUNT_KEY));
    return Number.isInteger(n) && n > 0 ? Math.min(n, 30) : undefined;
  } catch {
    return undefined;
  }
}

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

  const servicesQuery = useSelectableServices(isInitialized && isAuthenticated);
  const { mutate: applyCouponCode } = useApplyCoupon();
  const { mutate: submitCheckout } = useCheckout();
  const services = useMemo(
    () => servicesQuery.data?.services ?? [],
    [servicesQuery.data],
  );
  const currency = servicesQuery.data?.currency ?? "USD";
  const loading = servicesQuery.isPending;
  const [skeletonRows] = useState(readCachedServiceCount);
  const [paying, setPaying] = useState(false);
  const [selections, setSelections] = useState<
    Record<string, ServiceSelection>
  >({});
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    result: CouponResult;
    cartKey: string;
  } | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [yearlySavePercent, setYearlySavePercent] = useState<number | null>(
    null,
  );

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset the per-row selections whenever a fresh list arrives (adjusting
  // state during render rather than in an effect).
  const [selectionsFor, setSelectionsFor] =
    useState<typeof servicesQuery.data>();
  if (servicesQuery.data && servicesQuery.data !== selectionsFor) {
    setSelectionsFor(servicesQuery.data);
    setSelections(
      Object.fromEntries(
        servicesQuery.data.services.map((s) => [
          s.id,
          { selected: false, quantity: s.baseQuantity, period: "yearly" },
        ]),
      ),
    );
  }

  useEffect(() => {
    if (!servicesQuery.data) return;
    try {
      localStorage.setItem(
        SERVICE_COUNT_KEY,
        String(servicesQuery.data.services.length),
      );
    } catch {
      /* storage unavailable — skeleton falls back to the default count */
    }
  }, [servicesQuery.data]);

  useEffect(() => {
    const error = servicesQuery.error;
    if (!error) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesQuery.error]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    let cancelled = false;
    fetchBillingOptions().then((options) => {
      if (!cancelled) setYearlySavePercent(options.yearlySavePercent);
    });
    return () => {
      cancelled = true;
    };
  }, [isInitialized, isAuthenticated]);

  const updateSelection = (id: string, patch: Partial<ServiceSelection>) =>
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const toggleAll = (selected: boolean) =>
    setSelections((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, s]) => [id, { ...s, selected }]),
      ),
    );

  // The header toggle switches every row at once; the rows' radios for the
  // other period are disabled, so a row can't diverge from it.
  const changeBilling = (period: BillingPeriod) => {
    setBilling(period);
    setSelections((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, s]) => [id, { ...s, period }]),
      ),
    );
  };

  const servicesTotal = useMemo(
    () =>
      services.reduce((sum, service) => {
        const s = selections[service.id];
        return s?.selected
          ? sum + servicePrice(service, s.quantity, s.period)
          : sum;
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
  const coupon =
    appliedCoupon?.cartKey === cartKey ? appliedCoupon.result : null;
  const discount = couponDiscount(coupon, servicesTotal);

  const handleSessionError = (error: unknown): boolean => {
    if (!isSessionError(error)) return false;
    showToast(
      error.code === "ACCOUNT_DISABLED"
        ? copy.errors.accountDisabled
        : copy.errors.sessionExpired,
      "error",
    );
    logout();
    navigate("/login", { replace: true });
    return true;
  };

  const handleApplyCoupon = async (
    code: string,
  ): Promise<
    "applied" | "handled" | { error: keyof typeof copy.discount.errors }
  > => {
    const chosen = services.filter((s) => selections[s.id]?.selected);
    if (chosen.length === 0) {
      showToast(copy.summary.noServicesSelected, "error");
      return "handled";
    }
    try {
      const result = await applyCouponCode({
        code,
        billing,
        items: chosen.map((s) => ({
          workflowId: s.id,
          quantity: selections[s.id].quantity,
        })),
      });
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
      const order = await submitCheckout({
        billing,
        items: chosen.map((s) => ({
          workflowId: s.id,
          quantity: selections[s.id].quantity,
        })),
        couponCode: coupon?.code ?? null,
      });
      navigate("/order-status", { state: { order } });
    } catch (error) {
      setPaying(false);
      if (handleSessionError(error)) return;
      const kind =
        error instanceof AuthApiError && error.code !== "NETWORK_ERROR"
          ? checkoutErrorKind(error)
          : "other";
      if (kind !== "other") {
        showToast(copy.summary.errors[kind], "error");
        return;
      }
      // An undocumented backend code: show the backend's own message rather than a blind retry hint.
      console.error("Checkout failed", error);
      showToast(
        error instanceof AuthApiError && error.code !== "NETWORK_ERROR"
          ? error.message
          : copy.summary.paymentFailed,
        "error",
      );
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
              {!isReady && (
                <p className="mt-2 text-body font-body font-semibold text-[#DC2626]">
                  {copy.notice}
                </p>
              )}
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
              skeletonRows={skeletonRows}
              selections={selections}
              onChange={updateSelection}
              onToggleAll={toggleAll}
              billing={billing}
              billingLabels={copy.billing}
              copy={copy.table}
            />
          </div>
        </div>

        <StickyCheckoutBar
          copy={copy.summary}
          servicesTotal={servicesTotal}
          currency={currency}
          discount={discount}
          onPay={handlePay}
          loading={paying}
          disabled={!isReady}
        >
          <DiscountCodeCard
            copy={copy.discount}
            onApply={handleApplyCoupon}
            disabled={!isReady}
          />
          <OrderSummaryCard
            copy={copy.summary}
            servicesTotal={servicesTotal}
            currency={currency}
            discount={discount}
            autoRenew={autoRenew}
            onAutoRenewChange={setAutoRenew}
          />
        </StickyCheckoutBar>
      </main>

      <FooterSection />
    </div>
  );
}
