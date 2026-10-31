/**
 * Structure of the navbar "Services" hover menu: the eight main services and the AI agents grouped under them.
 * Labels live in the locale files (`nav.servicesMenu`); this file only holds the routes. A sub-service either has its
 * own page or points at the section of its parent page that describes it (`#hash`, resolved by the service page).
 */
import { siteConfig } from "@/config/site.config";
import { SERVICE_PATHS } from "@/config/serviceDetails.config";

export interface ServicesMenuItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}

export function getServicesMenu(): { root: ServicesMenuItem; items: readonly ServicesMenuItem[] } {
  const m = siteConfig.nav.servicesMenu;
  const sub = m.items;
  const brand = SERVICE_PATHS.brand;
  const social = SERVICE_PATHS.social;
  const growth = SERVICE_PATHS.growth;
  const email = SERVICE_PATHS.email;
  const youtube = SERVICE_PATHS.youtube;

  return {
    root: { label: m.root, href: "/services" },
    items: [
      { label: m.seo, href: SERVICE_PATHS.seo },
      { label: m.web, href: SERVICE_PATHS.webDesign },
      { label: m.multilingual, href: SERVICE_PATHS.multilingual },
      { label: m.brand, href: brand, children: [{ label: sub.logoDesigner, href: `${brand}#about-service` }] },
      {
        label: m.social,
        href: social,
        children: [
          { label: sub.autoPost, href: SERVICE_PATHS.autoPost },
          { label: sub.instagram, href: SERVICE_PATHS.instagram },
          { label: sub.linkedin, href: SERVICE_PATHS.linkedin },
          { label: sub.x, href: SERVICE_PATHS.x },
          { label: sub.telegram, href: SERVICE_PATHS.telegram },
        ],
      },
      { label: m.growth, href: growth, children: [{ label: sub.meetingBooking, href: `${growth}#process-step-5` }] },
      {
        label: m.email,
        href: email,
        children: [
          { label: sub.leadFinder, href: `${email}#process-step-2` },
          { label: sub.newsletterCreatorSender, href: `${email}#newsletter-creator-sender` },
          { label: sub.newsletterCreator, href: `${email}#newsletter-creator` },
          { label: sub.emailSender, href: `${email}#newsletter-sender` },
          { label: sub.audienceTargeting, href: `${email}#process-step-1` },
        ],
      },
      { label: m.youtube, href: youtube, children: [{ label: sub.youtubeBroadcaster, href: `${youtube}#process-step-4` }] },
    ],
  };
}
