import { Route, Routes } from "react-router-dom";
import { useLocale } from "@/i18n";
import HomePage from "@/pages/HomePage";
import TemplatesPage from "@/pages/TemplatesPage";

export default function App() {
  // Subscribing here re-renders the whole tree (siteConfig re-derives itself
  // per-locale on read) whenever the navbar's language switch fires — kept at
  // this level (above the routes) so it applies no matter which page is active.
  useLocale();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/templates" element={<TemplatesPage />} />
    </Routes>
  );
}
