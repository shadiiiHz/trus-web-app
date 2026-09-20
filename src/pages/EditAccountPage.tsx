import EditAccountFormPage from "@/components/auth/EditAccountFormPage";
import { siteConfig } from "@/config/site.config";

export default function EditAccountPage() {
  const { editAccount } = siteConfig.auth;

  return (
    <EditAccountFormPage
      heading={editAccount.heading}
      subtitle={editAccount.subtitle}
      copy={editAccount}
    />
  );
}
