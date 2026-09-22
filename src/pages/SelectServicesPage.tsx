import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { useAuth } from "@/hooks/useAuth";

/**
 * Placeholder for "Select Services", the post-login destination the
 * backend's `ready: true` login response sends a fully set-up account to
 * (`next_page: "/service"`, resolved to this page's own /select-services
 * route by resolveNextPage()). The real page isn't built yet — this just
 * proves the redirect lands somewhere real instead of a 404, and keeps the
 * same auth/ready gate as /edit-account so a not-yet-`ready` account can't
 * reach it by URL.
 */
export default function SelectServicesPage() {
  const { isInitialized, isAuthenticated, isReady } = useAuth();

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isReady) return <Navigate to="/edit-account" replace />;

  return (
    <div className="bg-auth-page-bg min-h-screen font-body antialiased">
      <Navbar />

      <main className="pt-18" style={{ background: "var(--color-auth-page-surface)" }}>
        <div className="mx-auto flex w-full max-w-330 flex-col items-center gap-2 px-5 py-24 text-center">
          <h1 className="text-[24px] font-semibold text-auth-heading">
            Select Services
          </h1>
          <p className="text-body text-auth-muted">
            You're logged in and your profile is complete — this is just a
            placeholder until the real page is built.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
