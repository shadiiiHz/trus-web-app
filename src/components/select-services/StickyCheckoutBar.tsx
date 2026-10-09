import { useId, useState, type ReactNode } from "react";
import type { SiteConfig } from "@/config/site.config";
import { formatMoney } from "./pricing";
import { ButtonSpinner } from "@/components/ui/ButtonSpinner";

export interface StickyCheckoutBarProps {
  copy: SiteConfig["selectServicesPage"]["summary"];
  servicesTotal: number;
  /** ISO currency code from the backend. */
  currency: string;
  discount: number;
  onPay: () => void;
  /** Disables the Pay Now button — e.g. while the account isn't `ready`. */
  disabled?: boolean;
  /** A payment request is in flight. */
  loading?: boolean;
  /** The expandable content (discount code + order summary cards). */
  children: ReactNode;
}

/**
 * Compact floating checkout card pinned to the bottom-right of the viewport (it
 * sticks while the page content is in view and rests above the footer at the end). It shows
 * the running total and Pay now. A pill tab on its top edge (pulsing until
 * first used) expands the discount / order-summary cards above it. The
 * children stay mounted while collapsed so a typed discount code isn't lost.
 */
export function StickyCheckoutBar({
  copy,
  servicesTotal,
  currency,
  discount,
  onPay,
  disabled = false,
  loading = false,
  children,
}: StickyCheckoutBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const panelId = useId();
  const total = Math.max(0, servicesTotal - discount);
  const label = expanded ? copy.collapseDetails : copy.expandDetails;

  const toggle = () => {
    setExpanded((v) => !v);
    setDiscovered(true);
  };

  return (
    <div className="pointer-events-none sticky bottom-0 z-30 flex justify-end px-5 pb-4 font-body max-lg:px-0 max-lg:pb-0">
      {/* Floating card pinned to the bottom-right of the viewport. */}
      <div className="pointer-events-auto relative mt-4 w-full max-w-[420px] max-lg:max-w-none">
        {/* Pill tab centered on the card's top edge — the visible "open me" affordance. */}
        <div className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="pointer-events-auto relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-auth-primary px-4 text-[12px] font-semibold text-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.16)]"
          >
            {!discovered && (
              <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-auth-primary/40" aria-hidden />
            )}
            <span className="relative">{label}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`relative transition-transform duration-300 ${expanded ? "rotate-180" : ""} ${discovered ? "" : "animate-bounce"}`}
            >
              <path d="M4 10l4-4 4 4" />
            </svg>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-auth-border-light bg-white/95 shadow-[0_8px_32px_0_rgba(0,0,0,0.14)] backdrop-blur max-lg:rounded-b-none max-lg:rounded-t-[20px] max-lg:border-x-0 max-lg:border-b-0 max-lg:shadow-[0_-8px_24px_0_rgba(0,0,0,0.10)]">
          {/* Animated expand: grid-rows 0fr -> 1fr; inert while collapsed so it can't take focus. */}
          <div
            id={panelId}
            inert={!expanded}
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`max-h-[calc(100vh-12rem)] overflow-y-auto transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                <div className="flex flex-col gap-3 border-b border-auth-divider bg-[#FAFAFA] px-3 pt-6 pb-3 max-lg:gap-6 max-lg:px-5 max-lg:pb-4">
                  {children}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-16 items-center justify-between gap-3 px-4 pt-1 max-lg:h-auto max-lg:px-5 max-lg:pt-4 max-lg:pb-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={label}
              tabIndex={-1}
              className="flex min-w-0 cursor-pointer flex-col text-left max-lg:flex-row max-lg:items-baseline max-lg:gap-2"
            >
              <span className="text-[12px] leading-4 font-medium text-[#525252] max-lg:text-[14px] max-lg:leading-5 max-lg:font-normal">{copy.total}</span>
              <span className="flex items-baseline gap-2">
                <span className="truncate text-[20px] leading-6 font-semibold text-auth-heading tabular-nums">
                  {formatMoney(total, currency)}
                </span>
                {discount > 0 && (
                  <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[12px] font-semibold text-[#16A34A] tabular-nums">
                    -{formatMoney(discount, currency)}
                  </span>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={onPay}
              disabled={disabled || loading}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-auth-primary px-6 max-lg:h-[38px] max-lg:px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-auth-primary"
            >
              {loading && <ButtonSpinner size={16} />}
              {copy.payNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
