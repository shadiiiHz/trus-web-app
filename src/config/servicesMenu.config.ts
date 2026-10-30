/**
 * Structure of the navbar "Services" hover menu: the eight main services and the AI agents grouped under them.
 * Labels live in the locale files (`nav.servicesMenu`); this file only holds the routes. A sub-service either has its
 * own page or points at the section of its parent page that describes it (`#hash`, resolved by the service page).
 */
import { siteConfig } from "@/config/site.config";
import { serviceDetailPath } from "@/config/serviceDetails.config";

export interface ServicesMenuItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}

export function getServicesMenu(): { root: ServicesMenuItem; items: readonly ServicesMenuItem[] } {
  const m = siteConfig.nav.servicesMenu;
  const sub = m.items;
  const brand = serviceDetailPath("brand-identity-logo-design");
  const social = serviceDetailPath("social-media-content-creation-publishing");
  const growth = serviceDetailPath("business-growth-intelligence-solver");
  const email = serviceDetailPath("lead-to-customer-email-growth");
  const youtube = serviceDetailPath("youtube-growth-broadcaster");

  return {
    root: { label: m.root, href: "/services" },
    items: [
      { label: m.seo, href: serviceDetailPath("seo-content-optimization") },
      { label: m.web, href: serviceDetailPath("web-design-development") },
      { label: m.multilingual, href: serviceDetailPath("multilingual-localized-growth-strategy") },
      { label: m.brand, href: brand, children: [{ label: sub.logoDesigner, href: brand }] },
      {
        label: m.social,
        href: social,
        children: [
          { label: sub.autoPost, href: serviceDetailPath("auto-post-creator-publisher") },
          { label: sub.instagram, href: serviceDetailPath("instagram-content-creator-publisher") },
          { label: sub.linkedin, href: serviceDetailPath("linkedin-content-creator-publisher") },
          { label: sub.x, href: serviceDetailPath("x-content-creator-publisher") },
          { label: sub.telegram, href: serviceDetailPath("telegram-channel-content-creator-publisher") },
        ],
      },
      { label: m.growth, href: growth, children: [{ label: sub.meetingBooking, href: `${growth}#how-it-works` }] },
      {
        label: m.email,
        href: email,
        children: [
          { label: sub.leadFinder, href: `${email}#how-it-works` },
          { label: sub.newsletterCreatorSender, href: `${email}#newsletter-services` },
          { label: sub.newsletterCreator, href: `${email}#newsletter-services` },
          { label: sub.emailSender, href: `${email}#newsletter-services` },
          { label: sub.audienceTargeting, href: `${email}#how-it-works` },
        ],
      },
      { label: m.youtube, href: youtube, children: [{ label: sub.youtubeBroadcaster, href: youtube }] },
    ],
  };
}
