import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import type { SelectableService } from "@/lib/mock/selectServices";
import type { BillingPeriod, ServiceSelection } from "./types";
import { Checkbox } from "./Checkbox";
import { formatUsd, servicePrice } from "./pricing";
import { QuantityStepper } from "./QuantityStepper";

export interface ServicesTableProps {
  services: SelectableService[];
  selections: Record<string, ServiceSelection>;
  onChange: (id: string, patch: Partial<ServiceSelection>) => void;
  onToggleAll: (selected: boolean) => void;
  copy: SiteConfig["selectServicesPage"]["table"];
}

type SortDir = "none" | "asc" | "desc";

const headCellClass = "px-0 font-body text-left text-[14px] font-semibold text-[#737373]";

/** Placeholder until the backend serves real service icons. */
function ServiceIcon({ src }: { src: string | null }) {
  if (src) {
    return <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />;
  }
  return (
    <span
      aria-hidden="true"
      className="h-10 w-10 shrink-0 rounded-lg border border-auth-border-light bg-auth-surface"
    />
  );
}

function PriceOption({
  checked,
  label,
  onSelect,
  name,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
  name: string;
}) {
  return (
    <label className="flex h-5 cursor-pointer items-center gap-2 select-none">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onSelect}
          className="peer h-full w-full cursor-pointer appearance-none rounded-full border border-auth-border bg-white transition-colors duration-150 checked:border-auth-primary checked:bg-auth-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        />
        <span className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span
        className={`text-[14px] font-medium tabular-nums ${
          checked ? "text-auth-heading" : "text-[#B3B3B3]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function ServicesTable({
  services,
  selections,
  onChange,
  onToggleAll,
  copy,
}: ServicesTableProps) {
  const [sortDir, setSortDir] = useState<SortDir>("none");

  const rows = useMemo(() => {
    if (sortDir === "none") return services;
    const sorted = [...services].sort((a, b) => a.name.localeCompare(b.name));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [services, sortDir]);

  const allSelected =
    services.length > 0 && services.every((s) => selections[s.id]?.selected);

  const cycleSort = () =>
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <div className="overflow-x-auto rounded-[12px] border border-auth-border-light bg-white">
      <table className="w-full min-w-[1100px] table-fixed border-collapse font-body">
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "27.2%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "19.2%" }} />
          <col style={{ width: "10.6%" }} />
        </colgroup>
        <thead>
          <tr className="h-[70px] border-b border-auth-divider">
            <th className={`${headCellClass} pl-6`} scope="col">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label={copy.selectAllAria}
                />
                <button
                  type="button"
                  onClick={cycleSort}
                  aria-label={copy.sortAria}
                  className="flex cursor-pointer items-center gap-1 transition-colors hover:text-auth-heading"
                >
                  {copy.service}
                  <ArrowDown
                    size={12}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${
                      sortDir === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </th>
            <th className={headCellClass} scope="col">{copy.description}</th>
            <th className={headCellClass} scope="col">{copy.quantity}</th>
            <th className={headCellClass} scope="col">{copy.unitPrice}</th>
            <th className={`${headCellClass} pr-6`} scope="col">{copy.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((service) => {
            const selection = selections[service.id];
            if (!selection) return null;
            const { selected, quantity, period } = selection;
            const setPeriod = (p: BillingPeriod) => onChange(service.id, { period: p });

            return (
              <tr
                key={service.id}
                className="h-18 border-b border-auth-divider last:border-b-0"
              >
                <td className="pl-6">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selected}
                      onChange={(checked) => onChange(service.id, { selected: checked })}
                      aria-label={service.name}
                    />
                    <div className="flex min-w-0 items-center gap-3">
                      <ServiceIcon src={service.icon} />
                      <span className="truncate text-[14px] font-medium text-auth-heading">
                        {service.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="pr-4 text-[14px] leading-5.5 text-auth-muted">
                  <p>{service.description}</p>
                  <p>{service.includedAmount}</p>
                </td>
                <td>
                  <QuantityStepper
                    value={quantity}
                    min={service.minQuantity}
                    max={service.maxQuantity}
                    onChange={(q) => onChange(service.id, { quantity: q })}
                    decreaseAria={copy.decreaseAria}
                    increaseAria={copy.increaseAria}
                  />
                </td>
                <td className="pr-4 leading-5.5">
                  <p className="text-[14px] font-medium text-auth-heading tabular-nums">
                    {formatUsd(service.unitPrice)}
                  </p>
                  <p className="text-[14px] font-normal text-auth-muted">{service.unitLabel}</p>
                </td>
                <td className="pr-6">
                  <div className="flex flex-col gap-0.5">
                    <PriceOption
                      name={`period-${service.id}`}
                      checked={period === "monthly"}
                      onSelect={() => setPeriod("monthly")}
                      label={`${formatUsd(servicePrice(service, quantity, "monthly"))}${copy.perMonth}`}
                    />
                    <PriceOption
                      name={`period-${service.id}`}
                      checked={period === "yearly"}
                      onSelect={() => setPeriod("yearly")}
                      label={`${formatUsd(servicePrice(service, quantity, "yearly"))}${copy.perYear}`}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
