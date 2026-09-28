import { useCallback, useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { useBackendText } from "@/i18n/backendText";
import type { SelectableService } from "@/lib/mock/selectServices";
import type { BillingPeriod, ServiceSelection } from "./types";
import { Checkbox } from "./Checkbox";
import { formatUsd, servicePrice } from "./pricing";
import { QuantityStepper } from "./QuantityStepper";
import { InvoiceIcon, InvoiceModal } from "./InvoiceModal";

export interface ServicesTableProps {
  services: SelectableService[];
  selections: Record<string, ServiceSelection>;
  onChange: (id: string, patch: Partial<ServiceSelection>) => void;
  onToggleAll: (selected: boolean) => void;
  /** The header billing toggle; rows can't pick the other period. */
  billing: BillingPeriod;
  /** "Monthly" / "Yearly" wording for the Billing column. */
  billingLabels: Record<BillingPeriod, string>;
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
      className="h-10 w-10 shrink-0 rounded-md border border-auth-border-light bg-auth-surface"
    />
  );
}

function StatusBadge({ purchased, label }: { purchased: boolean; label: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-[#D4D4D4] bg-white px-2 text-[12px] font-medium text-[#404040]">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${purchased ? "bg-[#22C55E]" : "bg-[#737373]"}`}
      />
      {label}
    </span>
  );
}

const emptyCell = <span className="text-[14px] text-auth-muted">–</span>;

function PriceOption({
  checked,
  label,
  onSelect,
  name,
  disabled = false,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
  name: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex h-5 items-center gap-2 select-none ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onSelect}
          disabled={disabled}
          className="peer h-full w-full cursor-pointer appearance-none disabled:cursor-not-allowed disabled:bg-auth-surface rounded-full border border-auth-border bg-white transition-colors duration-150 checked:border-auth-primary checked:bg-auth-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
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
  billing,
  billingLabels,
  copy,
}: ServicesTableProps) {
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [invoiceFor, setInvoiceFor] = useState<SelectableService | null>(null);

  const rows = useMemo(() => {
    if (sortDir === "none") return services;
    const sorted = [...services].sort((a, b) => a.name.localeCompare(b.name));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [services, sortDir]);

  const allSelected =
    services.length > 0 && services.every((s) => selections[s.id]?.selected);

  const localize = useBackendText();

  const closeInvoice = useCallback(() => setInvoiceFor(null), []);

  const cycleSort = () =>
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-auth-border-light bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[1280px] table-fixed border-collapse font-body">
          <colgroup>
            <col style={{ width: "19.8%" }} />
            <col style={{ width: "18.4%" }} />
            <col style={{ width: "11.2%" }} />
            <col style={{ width: "15.4%" }} />
            <col style={{ width: "10.6%" }} />
            <col style={{ width: "11.2%" }} />
            <col style={{ width: "7.3%" }} />
            <col style={{ width: "6.1%" }} />
          </colgroup>
          <thead>
            <tr className="h-[70px] border-b border-auth-divider bg-[#FAFAFA]">
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
              <th className={headCellClass} scope="col">{copy.total}</th>
              <th className={headCellClass} scope="col">{copy.status}</th>
              <th className={headCellClass} scope="col">{copy.billing}</th>
              <th className={`${headCellClass} pr-6 text-center`} scope="col">{copy.invoice}</th>
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
                        <span className="min-w-0 break-words text-[14px] leading-5.5 font-medium text-auth-heading">
                          {service.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="pr-4 text-[14px] leading-5.5 text-auth-muted">
                    <p>{localize(service.description)}</p>
                    <p>{localize(service.includedAmount)}</p>
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
                    <p className="text-[14px] font-normal text-auth-muted">{localize(service.unitLabel)}</p>
                  </td>
                  <td className="pr-4">
                    <div className="flex flex-col gap-0.5">
                      <PriceOption
                        name={`period-${service.id}`}
                        checked={period === "monthly"}
                        onSelect={() => setPeriod("monthly")}
                        disabled={billing !== "monthly"}
                        label={`${formatUsd(servicePrice(service, quantity, "monthly"))}${copy.perMonth}`}
                      />
                      <PriceOption
                        name={`period-${service.id}`}
                        checked={period === "yearly"}
                        onSelect={() => setPeriod("yearly")}
                        disabled={billing !== "yearly"}
                        label={`${formatUsd(servicePrice(service, quantity, "yearly"))}${copy.perYear}`}
                      />
                    </div>
                  </td>
                  <td className="pr-4">
                    <StatusBadge
                      purchased={service.purchased}
                      label={service.purchased ? copy.purchased : copy.notPurchased}
                    />
                  </td>
                  <td className="pr-4 text-[14px] text-[#525252] font-body">
                    {service.purchasedBilling ? billingLabels[service.purchasedBilling] : emptyCell}
                  </td>
                  <td className="pr-6 text-center">
                    {service.invoiceId ? (
                      <button
                        type="button"
                        onClick={() => setInvoiceFor(service)}
                        aria-label={`${copy.invoiceAria}: ${service.name}`}
                        className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors hover:bg-auth-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                      >
                        <InvoiceIcon />
                      </button>
                    ) : (
                      emptyCell
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {invoiceFor?.invoiceId && (
        <InvoiceModal
          service={invoiceFor}
          purchasedLabel={copy.purchased}
          onClose={closeInvoice}
          copy={copy.invoiceModal}
        />
      )}
    </>
  );
}
