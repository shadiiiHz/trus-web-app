import { useEffect, useState } from "react";
import { RailButton, RailColumn } from "@/components/services/RailSquares";
import { SocialRailGlyph, type SocialRailIcon } from "@/components/services/SocialRailIcons";
import { SERVICE_PATHS } from "@/config/serviceDetails.config";
import { siteConfig } from "@/config/site.config";

type Items = typeof siteConfig.nav.servicesMenu.items;

/** The five social agents of the Social Media page: icon, page it links to and title. */
const SOCIAL_ITEMS: readonly { icon: SocialRailIcon; path: string; label: (i: Items) => string }[] = [
  { icon: "telegram", path: SERVICE_PATHS.telegram, label: (i) => i.telegram },
  { icon: "instagram", path: SERVICE_PATHS.instagram, label: (i) => i.instagram },
  { icon: "linkedin", path: SERVICE_PATHS.linkedin, label: (i) => i.linkedin },
  { icon: "x", path: SERVICE_PATHS.x, label: (i) => i.x },
  { icon: "settings", path: SERVICE_PATHS.autoPost, label: (i) => i.autoPost },
];

/** Figma titles drop the "TRUS" prefix the menu uses ("AI Auto Post"). */
const shortLabel = (label: string) => label.replace(/^TRUS\s+/i, "");

/**
 * Desktop-only rail of the Social Media page, from its hero down to the footer (so it stays over the contact form): one square per social agent,
 * all closed until hovered. Clicking a square opens that agent's page in a new tab.
 */
export function SocialServicesRail({ heroId, endId, current }: { heroId: string; endId: string; current?: string }) {
  const items = siteConfig.nav.servicesMenu.items;
  // On an agent's own page the rail lists the other agents.
  const railItems = SOCIAL_ITEMS.filter((item) => item.path !== current);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.getElementById(endId);
    if (!hero) return;

    const update = () => {
      const middle = window.innerHeight / 2;
      const afterHero = hero.getBoundingClientRect().bottom < middle;
      // Gone once the footer reaches the rail (fixed at 55% of the viewport, 296px tall).
      const beforeEnd = !end || end.getBoundingClientRect().top > window.innerHeight * 0.55 + 148;
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
  }, [heroId, endId]);

  return (
    <RailColumn label="Social media services" visible={visible} count={railItems.length}>
      {railItems.map((item, index) => (
        <RailButton
          key={item.path}
          label={shortLabel(item.label(items))}
          icon={<SocialRailGlyph name={item.icon} />}
          index={index}
          revealed={visible}
          onSelect={() => window.open(item.path, "_blank", "noopener,noreferrer")}
        />
      ))}
    </RailColumn>
  );
}

export default SocialServicesRail;
