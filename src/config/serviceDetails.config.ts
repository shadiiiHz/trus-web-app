/**
 * Service detail pages — one SEO-friendly URL per service (`/services/<slug>`).
 *
 * TEMPORARY: these service names/slugs are working titles and are separate on
 * purpose from the service names used elsewhere (home-page cards, the
 * /services diagram, the footer), which stay untouched until the final names
 * are agreed. When they are, update `slug` here (and the copy under
 * `serviceDetail.pages` in the locale JSON files) — and keep old slugs
 * redirecting if a page was already live.
 *
 * This file holds only structure (slugs, images, layout tweaks). Every
 * user-facing string lives in the locale JSON files under `serviceDetail`
 * (`{locale}.json`), keyed by `textKey`, and is merged in by
 * `getServiceContent()`.
 *
 * A service without `images` is listed here but its URL renders the 404 page
 * (content not designed yet).
 */
import { t } from "@/i18n";

/** Keys of `serviceDetail.pages` in the locale JSON files. */
export type ServiceTextKey = "seo" | "webDesign" | "brand" | "social" | "autoPost";

/** Optional "how it works" section (numbered step cards). */
export interface ServiceDetailProcess {
  eyebrow: string;
  heading: string;
  description: string;
  steps: readonly { title: string; description: string }[];
}

/** Optional scroll-stacked card section (cards slide over each other). */
export interface ServiceDetailAutomation {
  eyebrow: string;
  heading: string;
  imageAlt: string;
  /** `description` supports `\n` line breaks. */
  items: readonly { title: string; description: string }[];
}

/** Optional dark "modes + localization" section. */
export interface ServiceDetailFlexible {
  eyebrow: string;
  heading: string;
  modes: readonly { title: string; description: string }[];
  scheduleImageAlt: string;
  multilingual: { heading: string; intro: string; items: readonly string[]; outro: string; imageAlt: string };
}

/** Shape of one page's copy in the locale JSON files. */
export interface ServiceDetailText {
  name: string;
  /** Large hero subtitle, one string per line. */
  tagline: readonly string[];
  /** Mobile line breaks when they differ from `tagline`'s. */
  taglineMobile?: readonly string[];
  /** <title> / og:title for the page. */
  metaTitle: string;
  /** <meta name="description"> (aim for ≤ 160 chars). */
  metaDescription: string;
  /** About / gain / highlights / contact are omitted while a page is only partly designed (e.g. hero only). */
  /** `heading` may contain `\n` (desktop line breaks); `headingMobile` gives the mobile lines when they differ. */
  about?: { heading: string; headingMobile?: readonly string[]; description: string; imageAlt: string };
  gain?: { heading: string; items: readonly string[] };
  highlights?: { heading: string; items: readonly string[]; imageAlt: string };
  /** Rendered between About and Contact when present. */
  process?: ServiceDetailProcess;
  /** Rendered after `process` when present. */
  automation?: ServiceDetailAutomation;
  /** Rendered after `automation` when present. */
  flexible?: ServiceDetailFlexible;
  /** `description` supports `\n` line breaks. */
  contact?: { heading: string; description: string };
}

/** Labels shared by every service page. */
export interface ServiceDetailCommon {
  aboutEyebrow: string;
  subjectLabel: string;
}

export interface ServiceDetailContent extends ServiceDetailText {
  about?: NonNullable<ServiceDetailText["about"]> & { image: string };
  highlights?: NonNullable<ServiceDetailText["highlights"]> & { image: string };
  contact?: NonNullable<ServiceDetailText["contact"]> & {
    /** Description spans the full container width instead of 700px max. */
    wide?: boolean;
  };
}

export interface ServiceDetail {
  /** URL segment — lowercase, hyphenated, keyword-first. */
  slug: string;
  textKey: ServiceTextKey;
  /** Full-width hero photo. */
  heroImage: string;
  /** Desktop hero: vertical center of the title block, % of hero height (default 50). */
  heroTextY?: number;
  /** Desktop hero: white left-to-right fade (70% → 0%) behind the title. */
  heroDesktopFade?: boolean;
  /** Desktop hero: allow the title block up to 700px wide (default 620px). */
  heroWideTitle?: boolean;
  /** Mobile hero: text position over the photo (default "bottom"), the photo's crop x (default "93%") and title max width. */
  heroMobile?: { align?: "top" | "bottom"; imageX?: string; titleWidth?: number };
  /** Render only the hero (page not fully designed yet). Without this or `images`, the URL renders the 404 page. */
  heroOnly?: boolean;
  /** About-section images; omit while the page isn't designed yet. */
  images?: { about: string; highlights: string };
  /** Purple radial glow behind the About section (Figma background). */
  aboutGlow?: boolean;
  /** Desktop size (px) of the centered About image, default 414×212. */
  aboutImageSize?: { width: number; height: number };
  /** Desktop size (px) of the Highlights image, default 414×212. */
  highlightsImageSize?: { width: number; height: number };
  /** Contact description spans the full container width. */
  contactWide?: boolean;
  /** Image beside the scroll-stacked cards (only for pages with `automation` copy). */
  stackImage?: string;
  /** Images of the `flexible` section (only for pages with `flexible` copy). */
  flexibleImages?: { schedule: string; multilingual: string };
}

export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  {
    slug: "seo-content-optimization",
    textKey: "seo",
    heroImage: "/services/SEO & Content Optimization.png",
    heroMobile: { titleWidth: 240 },
    aboutGlow: true,
    aboutImageSize: { width: 414, height: 212 },
    highlightsImageSize: { width: 414, height: 212 },
    contactWide: true,
    images: {
      about: "/services/seo-laptop-analytics.png",
      highlights: "/services/seo-growth-dashboard.png",
    },
  },
  {
    slug: "web-design-development",
    textKey: "webDesign",
    heroImage: "/services/Web Design & Development.png",
    heroTextY: 33,
    heroMobile: { imageX: "59%" },
    aboutGlow: true,
    aboutImageSize: { width: 420, height: 212 },
    highlightsImageSize: { width: 314, height: 226 },
    contactWide: true,
    images: {
      about: "/services/web-team-wireframes.png",
      highlights: "/services/web-responsive-devices.png",
    },
  },
  {
    slug: "brand-identity-logo-design",
    textKey: "brand",
    heroImage: "/services/Brand Identity & Logo Design.png",
    heroTextY: 34,
    heroMobile: { align: "top", imageX: "67%", titleWidth: 240 },
    aboutGlow: true,
    aboutImageSize: { width: 414, height: 212 },
    highlightsImageSize: { width: 414, height: 212 },
    contactWide: true,
    images: {
      about: "/services/brand-team-collaboration.png",
      highlights: "/services/brand-guidelines-mockup.png",
    },
  },
  {
    slug: "social-media-content-creation-publishing",
    textKey: "social",
    heroImage: "/services/Social Media Content Creation & Publishing.png",
    heroTextY: 30,
    heroDesktopFade: true,
    heroMobile: { imageX: "79%", titleWidth: 300 },
    contactWide: true,
    // TODO: replace with the Figma export of the automation image.
    stackImage: "/services/social-team-brainstorm.jpg",
    flexibleImages: {
      schedule: "/services/social-schedule-publish.png",
      multilingual: "/services/social-multilingual-content.png",
    },
    images: {
      about: "/services/social-team-brainstorm.jpg",
      highlights: "/services/social-analytics-phone.jpg",
    },
  },
  {
    slug: "auto-post-creator-publisher",
    textKey: "autoPost",
    heroImage: "/services/auto-post-hero.png",
    heroTextY: 72,
    heroDesktopFade: true,
    heroWideTitle: true,
    heroMobile: { imageX: "41%", titleWidth: 300 },
    contactWide: true,
    images: {
      about: "/services/auto-post-team-collaboration.png",
      highlights: "/services/auto-post-multi-platform.png",
    },
  },
];

export function getServiceDetail(slug: string | undefined): ServiceDetail | undefined {
  return SERVICE_DETAILS.find((s) => s.slug === slug);
}

export const serviceDetailPath = (slug: string) => `/services/${slug}`;

/** Copy shared by every service page, in the active locale. */
export function getServiceDetailCommon(): ServiceDetailCommon {
  return t.serviceDetail.common;
}

/** Service name in the active locale. */
export function getServiceName(service: ServiceDetail): string {
  return (t.serviceDetail.pages as Record<ServiceTextKey, ServiceDetailText>)[service.textKey].name;
}

/** Full page content (active-locale copy + structural images), or undefined if the page isn't designed yet. */
export function getServiceContent(service: ServiceDetail): ServiceDetailContent | undefined {
  if (!service.images && !service.heroOnly) return undefined;
  const text = (t.serviceDetail.pages as Record<ServiceTextKey, ServiceDetailText>)[service.textKey];
  const { images } = service;
  return {
    ...text,
    about: text.about && images ? { ...text.about, image: images.about } : undefined,
    highlights: text.highlights && images ? { ...text.highlights, image: images.highlights } : undefined,
    contact: text.contact ? { ...text.contact, wide: service.contactWide } : undefined,
  };
}
