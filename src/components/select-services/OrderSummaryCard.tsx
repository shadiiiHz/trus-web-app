import { useId } from "react";
import type { SiteConfig } from "@/config/site.config";
import { formatUsd } from "./pricing";
import { Checkbox } from "./Checkbox";

export interface OrderSummaryCardProps {
  copy: SiteConfig["selectServicesPage"]["summary"];
  servicesTotal: number;
  discount: number;
  autoRenew: boolean;
  onAutoRenewChange: (value: boolean) => void;
  onPay: () => void;
  /** Disables the Pay Now button — e.g. while the account isn't `ready`. */
  disabled?: boolean;
}

export function OrderSummaryCard({
  copy,
  servicesTotal,
  discount,
  autoRenew,
  onAutoRenewChange,
  onPay,
  disabled = false,
}: OrderSummaryCardProps) {
  const autoRenewId = useId();
  const total = Math.max(0, servicesTotal - discount);

  return (
    <section className="flex flex-col rounded-[12px] border border-auth-border-light bg-white p-6 font-body shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <h2 className="text-[16px] leading-6 font-semibold text-auth-heading">{copy.heading}</h2>

      <dl className="mt-7.5 flex flex-col gap-5 border-b border-auth-divider pb-4.5">
        <div className="flex h-7 items-center justify-between">
          <dt className="text-[14px] text-[#525252] font-medium">{copy.totalServices}</dt>
          <dd className="text-[20px] font-semibold text-auth-heading tabular-nums">
            {formatUsd(servicesTotal)}
          </dd>
        </div>
        <div className="flex h-7 items-center justify-between">
          <dt className="text-[14px] text-[#525252] font-medium">{copy.discount}</dt>
          <dd className="text-[20px] font-semibold text-auth-heading tabular-nums">
            -{formatUsd(discount)}
          </dd>
        </div>
      </dl>

      <div className="mt-4.5 flex h-8 items-center justify-between">
        <span className="text-[24px] font-semibold text-auth-heading">{copy.total}</span>
        <span className="text-[24px] font-semibold text-auth-heading tabular-nums">
          {formatUsd(total)}
        </span>
      </div>

      <label
        htmlFor={autoRenewId}
        className="mt-4 flex w-fit cursor-pointer items-center gap-3 text-[16px] font-medium text-auth-text select-none"
      >
        <Checkbox id={autoRenewId} checked={autoRenew} onChange={onAutoRenewChange} size={18} />
        {copy.autoRenew}
      </label>

      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className="mt-7 h-10 cursor-pointer self-end rounded-md bg-auth-primary px-7.5 text-[14px] font-semibold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-auth-primary"
      >
        {copy.payNow}
      </button>
    </section>
  );
}
