import { useEffect, useState } from "react";
import { RailButton, RailColumn } from "@/components/services/RailSquares";
import { ICON_MARKUP } from "@/components/services/serviceIcons";
import { SERVICE_PATHS } from "@/config/serviceDetails.config";
import { siteConfig } from "@/config/site.config";

type Menu = typeof siteConfig.nav.servicesMenu;

/** The eight main services of the rail: list row id, page it links to, icon id and title. */
const RAIL_ITEMS = [
  { id: "growth-intelligence", path: SERVICE_PATHS.growth, icon: "business-growth", label: (m: Menu) => m.growth },
  { id: "multilingual", path: SERVICE_PATHS.multilingual, icon: "multilingual", label: (m: Menu) => m.multilingual },
  { id: "web-design", path: SERVICE_PATHS.webDesign, icon: "web-design", label: (m: Menu) => m.web },
  { id: "brand-identity", path: SERVICE_PATHS.brand, icon: "branding", label: (m: Menu) => m.brand },
  { id: "seo", path: SERVICE_PATHS.seo, icon: "seo", label: (m: Menu) => m.seo },
  { id: "social-media", path: SERVICE_PATHS.social, icon: "social-media", label: (m: Menu) => m.social },
  { id: "email-marketing", path: SERVICE_PATHS.email, icon: "lead-email", label: (m: Menu) => m.email },
  { id: "youtube", path: SERVICE_PATHS.youtube, icon: "youtube", label: (m: Menu) => m.youtube },
] as const;

/** The social agents' rows belong to the Social Media square. */
const SOCIAL_AGENT_ROWS = ["telegram", "instagram", "linkedin", "x-content", "auto-post"];
const ROW_IDS = [...RAIL_ITEMS.map((item) => item.id), ...SOCIAL_AGENT_ROWS];

/**
 * Desktop-only rail docked to the right edge while the "TRUS AI Services" list is on screen: one square per main
 * service, all closed until hovered (the one being read keeps the purple tint). Clicking a square opens that
 * service's page in a new tab.
 */
export function ServicesRail({ sectionId }: { sectionId: string }) {
  const menu = siteConfig.nav.servicesMenu;
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string>(RAIL_ITEMS[0].id);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const middle = window.innerHeight / 2;
      // Only while the list fills the viewport, so the rail never sits over the hero or the footer.
      setVisible(rect.top < middle && rect.bottom > middle);

      let best: { id: string; distance: number } | null = null;
      for (const id of ROW_IDS) {
        const row = document.getElementById(id);
        if (!row) continue;
        const r = row.getBoundingClientRect();
        const distance = r.top <= middle && r.bottom >= middle ? 0 : Math.min(Math.abs(r.top - middle), Math.abs(r.bottom - middle));
        if (!best || distance < best.distance) best = { id, distance };
      }
      if (best) setActiveId(SOCIAL_AGENT_ROWS.includes(best.id) ? "social-media" : best.id);
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
  }, [sectionId]);

  return (
    <RailColumn label="Services" visible={visible} count={RAIL_ITEMS.length}>
      {RAIL_ITEMS.map((item, index) => (
        <RailButton
          key={item.id}
          label={item.label(menu)}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 43 43"
              fill="none"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICON_MARKUP[item.icon] ?? "" }}
            />
          }
          isActive={item.id === activeId}
          index={index}
          revealed={visible}
          onSelect={() => window.open(item.path, "_blank", "noopener,noreferrer")}
        />
      ))}
    </RailColumn>
  );
}

export default ServicesRail;
