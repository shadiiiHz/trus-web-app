import { Navigate } from "react-router-dom";
import EditAccountFormPage from "@/components/auth/EditAccountFormPage";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";

export default function EditAccountPage() {
  const { editAccount } = siteConfig.auth;
  const { isInitialized, isAuthenticated } = useAuth();

  // This page is the complete-profile step the register/login flow sends a
  // not-yet-`ready` account to — reachable only with the session token that
  // step issues, not as a standalone URL. Wait for AuthProvider's initial
  // sessionStorage read before deciding, so a hard refresh here doesn't
  // bounce a valid session back to /register.
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/register" replace />;

  return (
    <EditAccountFormPage
      heading={editAccount.heading}
      subtitle={editAccount.subtitle}
      copy={editAccount}
    />
  );
}
