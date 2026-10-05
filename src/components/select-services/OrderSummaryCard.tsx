import { useId } from "react";
import type { SiteConfig } from "@/config/site.config";
import { formatMoney } from "./pricing";
import { Checkbox } from "./Checkbox";

export interface OrderSummaryCardProps {
  copy: SiteConfig["selectServicesPage"]["summary"];
  servicesTotal: number;
  /** ISO currency code from the backend. */
  currency: string;
  discount: number;
  autoRenew: boolean;
  onAutoRenewChange: (value: boolean) => void;
}

export function OrderSummaryCard({
  copy,
  servicesTotal,
  currency,
  discount,
  autoRenew,
  onAutoRenewChange,
}: OrderSummaryCardProps) {
  const autoRenewId = useId();
  const total = Math.max(0, servicesTotal - discount);

  return (
    <section className="flex flex-col rounded-xl border border-auth-border-light bg-white p-4 font-body shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <h2 className="text-[14px] leading-5 font-semibold text-auth-heading">{copy.heading}</h2>

      <dl className="mt-3 flex flex-col gap-1.5 border-b border-auth-divider pb-3">
        <div className="flex items-center justify-between">
          <dt className="text-[13px] font-medium text-[#525252]">{copy.totalServices}</dt>
          <dd className="text-[14px] font-semibold text-auth-heading tabular-nums">
            {formatMoney(servicesTotal, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[13px] font-medium text-[#525252]">{copy.discount}</dt>
          <dd className="text-[14px] font-semibold text-auth-heading tabular-nums">
            -{formatMoney(discount, currency)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[16px] font-semibold text-auth-heading">{copy.total}</span>
        <span className="text-[18px] font-semibold text-auth-heading tabular-nums">
          {formatMoney(total, currency)}
        </span>
      </div>

      <label
        htmlFor={autoRenewId}
        className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 text-[13px] font-medium text-auth-text select-none"
      >
        <Checkbox id={autoRenewId} checked={autoRenew} onChange={onAutoRenewChange} size={16} />
        {copy.autoRenew}
      </label>
    </section>
  );
}
