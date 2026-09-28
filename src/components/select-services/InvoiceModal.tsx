import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { useLocale, type Locale } from "@/i18n";
import {
  downloadInvoices,
  fetchServiceInvoices,
  type SelectableService,
  type ServiceInvoice,
  type ServiceInvoices,
} from "@/lib/mock/selectServices";
import { Checkbox } from "./Checkbox";
import { ButtonSpinner } from "@/components/ui/ButtonSpinner";

/** Receipt-with-download icon used by the table's Invoice column. */
export function InvoiceIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M13.3346 8.33337V4.53337C13.3346 3.41327 13.3346 2.85322 13.1166 2.42539C12.9249 2.04907 12.6189 1.74311 12.2426 1.55136C11.8148 1.33337 11.2547 1.33337 10.1346 1.33337H5.86797C4.74786 1.33337 4.18781 1.33337 3.75999 1.55136C3.38366 1.74311 3.0777 2.04907 2.88596 2.42539C2.66797 2.85322 2.66797 3.41327 2.66797 4.53337V11.4667C2.66797 12.5868 2.66797 13.1469 2.88596 13.5747C3.0777 13.951 3.38366 14.257 3.75999 14.4487C4.18781 14.6667 4.74783 14.6667 5.86787 14.6667H8.33464M9.33464 7.33337H5.33464M6.66797 10H5.33464M10.668 4.66671H5.33464M14.0013 12.6667L12.0013 14.6667L10.0013 12.6667M12.0013 14.6667V10.6667"
        stroke="#5B2BB9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type InvoiceModalCopy = SiteConfig["selectServicesPage"]["table"]["invoiceModal"];

export interface InvoiceModalProps {
  /** Purchased service whose invoices are listed. */
  service: SelectableService;
  /** "Purchased" badge wording, shared with the table's Status column. */
  purchasedLabel: string;
  onClose: () => void;
  copy: InvoiceModalCopy;
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const countLabel = (copy: InvoiceModalCopy, count: number) =>
  fill(count === 1 ? copy.countOne : copy.countOther, { count });

const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

const parseIsoDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** "Jan 1–31, 2026" / "Jan 1–Dec 31, 2026" (locale-aware outside English). */
function formatPeriod(startIso: string, endIso: string, locale: Locale): string {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (locale !== "en") {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).formatRange(start, end);
  }
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const from = `${month.format(start)} ${start.getUTCDate()}`;
  const to =
    start.getUTCMonth() === end.getUTCMonth()
      ? `${end.getUTCDate()}`
      : `${month.format(end)} ${end.getUTCDate()}`;
  return `${from}–${to}, ${end.getUTCFullYear()}`;
}

/** Shared column template of the header row and invoice rows. */
const gridClass =
  "grid grid-cols-[repeat(3,minmax(0,1fr))] sm:grid-cols-[236px_236px_minmax(0,1fr)] items-center";

function ServiceBadgeIcon({ src }: { src: string | null }) {
  if (src) {
    return <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-auth-border-light bg-auth-surface"
    />
  );
}
function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-[16px] leading-6 font-semibold text-auth-heading">{title}</h3>
        <p className="mt-0.5 text-[14px] leading-5 text-auth-muted">{subtitle}</p>
      </div>
      <span className="inline-flex h-[22px] shrink-0 items-center rounded-[999px] border border-auth-border-light bg-auth-page-bg px-2 text-[12px] text-auth-text font-medium">
        {count}
      </span>
    </div>
  );
}

function InvoiceRow({
  invoice,
  label,
  periodLabel,
  locale,
  selected,
  onToggle,
  tall = false,
  currentLabel,
}: {
  invoice: ServiceInvoice;
  label: string;
  periodLabel: string;
  locale: Locale;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  tall?: boolean;
  /** Set on the service's latest invoice (per its Billing column): shows the "current" pill and border. */
  currentLabel?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center rounded-md border pl-3 transition-colors duration-150 ${
        tall ? "h-[70px]" : "h-16"
      } ${
        selected
          ? "border-auth-primary bg-auth-surface-hover"
          : currentLabel
            ? "border-auth-primary bg-white hover:bg-auth-page-bg"
            : "border-auth-border-light bg-white hover:bg-auth-page-bg"
      }`}
    >
      <Checkbox checked={selected} onChange={onToggle} size={20} aria-label={label} />
      <div className={`ml-4 min-w-0 flex-1 ${gridClass}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
              selected
                ? "border-auth-primary bg-auth-primary text-white"
                : "border-auth-border-light bg-auth-surface-hover text-auth-primary"
            }`}
          >
            <FileText size={18} strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[16px] leading-6 font-semibold text-auth-heading">
                {label}
              </span>
              {currentLabel && (
                <span className="inline-flex h-[22px] shrink-0 items-center rounded-[6px] bg-[#F5F3FF] px-2 text-[12px] font-medium text-[#6E43C1]">
                  {currentLabel}
                </span>
              )}
            </span>
            <span className="block truncate text-[14px] leading-5 text-auth-placeholder">
              {invoice.number}
            </span>
          </span>
        </div>
        <div className="min-w-0 pr-2 text-[14px] leading-5">
          <p className="truncate font-medium text-auth-heading">
            {formatPeriod(invoice.periodStart, invoice.periodEnd, locale)}
          </p>
          <p className="truncate text-auth-muted">{periodLabel}</p>
        </div>
        <p className="text-[14px] leading-5 font-medium text-auth-heading tabular-nums">
          {formatAmount(invoice.amount)}
        </p>
      </div>
    </label>
  );
}

/** "Download invoice" popup opened from a purchased row's invoice icon. */
export function InvoiceModal({ service, purchasedLabel, onClose, copy }: InvoiceModalProps) {
  const locale = useLocale();
  const [invoices, setInvoices] = useState<ServiceInvoices | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchServiceInvoices(service.id).then((result) => {
      if (!cancelled) setInvoices(result);
    });
    return () => {
      cancelled = true;
    };
  }, [service.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const monthly = invoices?.monthly ?? [];
  const annual = invoices?.annual ?? [];
  // The latest invoice of the kind the Billing column shows is the current one.
  const currentId =
    service.purchasedBilling === "yearly"
      ? annual.at(-1)?.id
      : service.purchasedBilling === "monthly"
        ? monthly.at(-1)?.id
        : undefined;
  const allMonthlySelected = monthly.length > 0 && monthly.every((inv) => selected.has(inv.id));

  const toggleAllMonthly = (checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      monthly.forEach((inv) => (checked ? next.add(inv.id) : next.delete(inv.id)));
      return next;
    });

  const handleDownload = async () => {
    if (selected.size === 0 || downloading) return;
    setDownloading(true);
    try {
      await downloadInvoices([...selected]);
      onClose();
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 p-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-full w-full max-w-[800px] flex-col overflow-hidden rounded-[12px] bg-white font-body shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6">
          <div className="flex h-7 items-center justify-between gap-4">
            <h2
              id="invoice-modal-title"
              className="text-[20px] leading-7 font-semibold text-auth-heading"
            >
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.close}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-auth-muted transition-colors hover:bg-auth-surface hover:text-auth-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-lg border border-auth-border-light bg-auth-page-bg px-[11px] py-[11px]">
            <ServiceBadgeIcon src={service.icon} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-4 text-auth-placeholder uppercase">
                {copy.serviceLabel}
              </p>
              <p className="mt-1 truncate text-[16px] leading-6 font-semibold text-auth-heading">
                {service.name}
              </p>
            </div>
            <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[999px] border border-[#ABEFC6] bg-[#ECFDF3] px-[11px] text-[12px] font-medium text-[#067647]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#17B26A]" />
              {purchasedLabel}
            </span>
          </div>

          {invoices && monthly.length === 0 && annual.length === 0 && (
            <p className="mt-5 text-[14px] leading-5 text-auth-muted">{copy.empty}</p>
          )}

          {monthly.length > 0 && (
            <section className="mt-5">
              <SectionHeader
                title={copy.monthlyTitle}
                subtitle={fill(copy.monthlySubtitle, { count: monthly.length })}
                count={countLabel(copy, monthly.length)}
              />
              <div
                className={`mt-2 flex h-[38px] items-center rounded-md border border-auth-border-light bg-auth-page-bg pl-3`}
              >
                <Checkbox
                  checked={allMonthlySelected}
                  onChange={toggleAllMonthly}
                  size={20}
                  aria-label={copy.selectAllAria}
                />
                <div
                  className={`ml-4 min-w-0 flex-1 text-[12px] leading-4 font-semibold text-auth-text ${gridClass}`}
                >
                  <span>{copy.colInvoice}</span>
                  <span>{copy.colPeriod}</span>
                  <span>{copy.colAmount}</span>
                </div>
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {monthly.map((invoice) => (
                  <li key={invoice.id}>
                    <InvoiceRow
                      invoice={invoice}
                      label={fill(copy.monthLabel, { n: invoice.sequence })}
                      periodLabel={copy.monthlyPeriod}
                      locale={locale}
                      selected={selected.has(invoice.id)}
                      onToggle={(checked) => toggle(invoice.id, checked)}
                      currentLabel={invoice.id === currentId ? copy.currentTag : undefined}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {annual.length > 0 && (
            <section className={monthly.length > 0 ? "mt-6" : "mt-5"}>
              <SectionHeader
                title={copy.annualTitle}
                subtitle={copy.annualSubtitle}
                count={countLabel(copy, annual.length)}
              />
              <ul className="mt-2 flex flex-col gap-2">
                {annual.map((invoice) => (
                  <li key={invoice.id}>
                    <InvoiceRow
                      invoice={invoice}
                      label={fill(copy.yearLabel, { n: invoice.sequence })}
                      periodLabel={copy.annualPeriod}
                      locale={locale}
                      selected={selected.has(invoice.id)}
                      onToggle={(checked) => toggle(invoice.id, checked)}
                      currentLabel={invoice.id === currentId ? copy.currentTag : undefined}
                      tall
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-auth-border-light bg-auth-page-bg px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] cursor-pointer rounded-md border border-auth-border bg-white px-3.5 text-[14px] font-semibold text-auth-text transition-colors hover:bg-auth-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={selected.size === 0 || downloading}
            aria-busy={downloading || undefined}
            className={`${downloading ? "btn-loading" : ""} relative inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-md bg-auth-primary px-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-auth-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className={`inline-flex items-center gap-2 transition-opacity duration-200 ${downloading ? "opacity-0" : ""}`}>
              {copy.download}
            </span>
            {downloading && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <ButtonSpinner size={18} />
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
