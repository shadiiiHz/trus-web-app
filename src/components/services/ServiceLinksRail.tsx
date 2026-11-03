import { useEffect, useState } from "react";
import { RailButton, RailColumn } from "@/components/services/RailSquares";
import { ICON_MARKUP } from "@/components/services/serviceIcons";
import { SERVICE_PATHS, type ServiceKey } from "@/config/serviceDetails.config";
import { siteConfig } from "@/config/site.config";

type Menu = typeof siteConfig.nav.servicesMenu;

/** The main services a detail-page rail can link to: page, icon id and title (same order as the services list rail). */
const LINKS: readonly { key: ServiceKey; icon: string; label: (m: Menu) => string }[] = [
  { key: "growth", icon: "business-growth", label: (m) => m.growth },
  { key: "multilingual", icon: "multilingual", label: (m) => m.multilingual },
  { key: "webDesign", icon: "web-design", label: (m) => m.web },
  { key: "brand", icon: "branding", label: (m) => m.brand },
  { key: "seo", icon: "seo", label: (m) => m.seo },
  { key: "social", icon: "social-media", label: (m) => m.social },
  { key: "email", icon: "lead-email", label: (m) => m.email },
  { key: "youtube", icon: "youtube", label: (m) => m.youtube },
];

/**
 * Desktop-only rail of a service detail page, from its hero down to the footer: one square per *other* main service,
 * all closed until hovered. Clicking a square opens that service's page in a new tab.
 */
export function ServiceLinksRail({ current, heroId, endId }: { current: ServiceKey; heroId: string; endId: string }) {
  const menu = siteConfig.nav.servicesMenu;
  const [visible, setVisible] = useState(false);
  const links = LINKS.filter((link) => link.key !== current);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.getElementById(endId);
    if (!hero) return;

    const update = () => {
      const afterHero = hero.getBoundingClientRect().bottom < window.innerHeight / 2;
      // Gone once the footer reaches the rail (fixed at 55% of the viewport, half its height ≈ 4 squares + gaps).
      const beforeEnd = !end || end.getBoundingClientRect().top > window.innerHeight * 0.55 + (links.length * 60) / 2;
      setVisible(afterHero && beforeEnd);
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [heroId, endId, links.length]);

  return (
    <RailColumn label="Services" visible={visible} count={links.length}>
      {links.map((link, index) => (
        <RailButton
          key={link.key}
          label={link.label(menu)}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 43 43"
              fill="none"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICON_MARKUP[link.icon] ?? "" }}
            />
          }
          index={index}
          revealed={visible}
          onSelect={() => window.open(SERVICE_PATHS[link.key], "_blank", "noopener,noreferrer")}
        />
      ))}
    </RailColumn>
  );
}

export default ServiceLinksRail;
