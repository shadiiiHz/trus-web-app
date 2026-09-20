import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { dismissToast, useToasts, type ToastVariant } from "@/lib/toast";

const variantClasses: Record<ToastVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-auth-border bg-white text-auth-text",
};

const variantIcons: Record<ToastVariant, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

/** Fixed at the top of the viewport, above any page content — mounted once in App.tsx. */
export function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = variantIcons[toast.variant];
          const [primary, ...details] = toast.message.split("\n");
          return (
            <motion.div
              key={toast.id}
              role="alert"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-md border px-4 py-3 text-[13px] shadow-lg ${variantClasses[toast.variant]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{primary}</p>
                {details.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {details.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
