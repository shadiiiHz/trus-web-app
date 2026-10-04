import { useNavigate } from "react-router-dom";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";
import { AuthApiError } from "@/lib/api/authApi";
import { isSessionError } from "@/lib/api/servicesApi";
import { invoiceErrorKind } from "@/lib/api/invoiceApi";

/**
 * Reports a failed invoice call: a dead session logs the user out and goes
 * to login, anything else becomes the toast for its error code.
 */
export function useInvoiceErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { errors, summary } = siteConfig.selectServicesPage;

  return (error: unknown): void => {
    if (isSessionError(error)) {
      showToast(error.code === "ACCOUNT_DISABLED" ? errors.accountDisabled : errors.sessionExpired, "error");
      logout();
      navigate("/login", { replace: true });
      return;
    }
    const kind = error instanceof AuthApiError && error.code !== "NETWORK_ERROR" ? invoiceErrorKind(error) : "other";
    const message = {
      notFound: summary.errors.invoiceNotFound,
      notReady: summary.errors.invoiceNotReady,
      serviceNotFound: summary.errors.invoiceServiceNotFound,
      other: summary.errors.invoiceFailed,
    }[kind];
    showToast(message, "error");
  };
}
