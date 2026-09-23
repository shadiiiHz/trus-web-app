import { Route, Routes } from "react-router-dom";
import { useLocale } from "@/i18n";
import { ToastContainer } from "@/components/ui/Toast";
import HomePage from "@/pages/HomePage";
import TemplatesPage from "@/pages/TemplatesPage";
import ServicesPage from "@/pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ChangePasswordSuccessPage from "./pages/ChangePasswordSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordSuccessPage from "./pages/ResetPasswordSuccessPage";
import RegisterPage from "./pages/RegisterPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";
import EditAccountPage from "./pages/EditAccountPage";
import CheckYourEmailPage from "./pages/CheckYourEmailPage";
import SelectServicesPage from "./pages/SelectServicesPage";

export default function App() {
  // Subscribing here re-renders the whole tree (siteConfig re-derives itself
  // per-locale on read) whenever the navbar's language switch fires — kept at
  // this level (above the routes) so it applies no matter which page is active.
  useLocale();

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route
          path="/change-password/success"
          element={<ChangePasswordSuccessPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/reset-password/success"
          element={<ResetPasswordSuccessPage />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/check-your-email" element={<CheckYourEmailPage />} />
        {/* Serves the backend's `next_page: "/complete-profile"` — resolved
            to this route by resolveNextPage() rather than routed directly,
            so the URL bar always reads /edit-account. */}
        <Route path="/edit-account" element={<EditAccountPage />} />
        {/* Serves the backend's `next_page: "/service"` (a `ready: true`
            login response) — resolved to this route by resolveNextPage(). */}
        <Route path="/select-services" element={<SelectServicesPage />} />
      </Routes>
    </>
  );
}
