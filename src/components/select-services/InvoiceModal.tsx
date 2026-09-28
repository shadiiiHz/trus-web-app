import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";

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

export interface InvoiceModalProps {
  /** Service whose invoice is shown (for the title). */
  serviceName: string;
  /** Backend invoice id — the content will be fetched with it once the design and endpoint exist. */
  invoiceId: string;
  onClose: () => void;
  copy: SiteConfig["selectServicesPage"]["table"]["invoiceModal"];
}

/**
 * Invoice popup opened from a purchased row's invoice icon.
 * TODO: placeholder shell until the invoice design (and endpoint) is ready.
 */
export function InvoiceModal({ serviceName, invoiceId, onClose, copy }: InvoiceModalProps) {
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

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        data-invoice-id={invoiceId}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-[480px] rounded-[12px] bg-white p-6 font-body shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="invoice-modal-title"
            className="text-[16px] leading-6 font-semibold text-auth-heading"
          >
            {copy.title} — {serviceName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="cursor-pointer rounded-md p-1 text-auth-muted transition-colors hover:text-auth-heading"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-4 text-[14px] text-auth-muted">{copy.body}</p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
