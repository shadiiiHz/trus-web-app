import AccountFormPage from "@/components/auth/AccountFormPage";
import { siteConfig } from "@/config/site.config";

// Same form as the register page — only the heading/subtitle differ, sourced
// from `editAccount` while the field copy still comes from `register`.
export default function EditAccountPage() {
  const { register, editAccount } = siteConfig.auth;

  return (
    <AccountFormPage
      heading={editAccount.heading}
      subtitle={editAccount.subtitle}
      copy={register}
    />
  );
}
