import AccountFormPage from "@/components/auth/AccountFormPage";
import { siteConfig } from "@/config/site.config";

export default function RegisterPage() {
  const { register } = siteConfig.auth;

  return (
    <AccountFormPage
      heading={register.heading}
      subtitle={register.subtitle}
      copy={register}
    />
  );
}
