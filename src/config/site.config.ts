/**
 * Structural configuration for the site.
 *
 * All user-facing TEXT lives in `/src/i18n/en.json` (the single source of truth,
 * ready for future translation). This file composes that text with structural
 * data — hrefs, ids, colours, image URLs, socials — so components keep a single
 * `siteConfig` import. To rebrand: edit `en.json` (copy) and the meta arrays
 * below (assets/links).
 *
 * Accent convention: wrap any word in [brackets] to render it in the accent
 * colour. Example: "at [TruS]" → "at " (white) + "TruS" (brand-accent, bold).
 */
import { en } from "@/i18n";

/** Zips an array of translated text objects with its structural-meta array (by index). */
function merge<T extends object, M extends object>(
  text: readonly T[],
  meta: readonly M[],
): Array<T & M> {
  return text.map((item, i) => ({ ...item, ...meta[i] }));
}

// Structural meta (non-text)
const navHrefs = [
  "#",
  "#about",
  "#portfolio",
  "#templates",
  "#services",
  "#contact",
];

const projectMeta = [
  { id: 1, accent: "#e63946", bg: "#f1f3f5" },
  { id: 2, accent: "#4361ee", bg: "#0f172a" },
  { id: 3, accent: "#06d6a0", bg: "#0d1117" },
  { id: 4, accent: "#9d4edd", bg: "#1a0a2e" },
  { id: 5, accent: "#f72585", bg: "#10002b" },
  { id: 6, accent: "#4cc9f0", bg: "#071520" },
  { id: 7, accent: "#ff6b6b", bg: "#1c1c1c" },
  { id: 8, accent: "#ffd166", bg: "#1a1a2e" },
];

const teamMeta = [
  {
    id: "sara",
    image: "https://picsum.photos/seed/member-sara/400/480",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "daniel",
    image: "https://picsum.photos/seed/member-daniel/400/480",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "lina",
    image: "https://picsum.photos/seed/member-lina/400/480",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "nina",
    image: "https://picsum.photos/seed/member-nina/400/480",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
];

const serviceMeta = [
  { id: "seo" },
  { id: "web-dev" },
  { id: "web-design" },
  { id: "lead-maker" },
  { id: "ai-agent" },
  { id: "content" },
];
const imageMap = {
  law: ["/templates/t1.webp"],
  fit: ["/templates/t2.webp", "/templates/t3.webp", "/templates/t4.webp"],
  re: ["/templates/t5.webp"],
  cl: ["/templates/t6.webp", "/templates/t7.webp"],
  bar: ["/templates/t8.webp", "/templates/t9.webp"],
  all: [
    "/templates/t1.webp",
    "/templates/t2.webp",
    "/templates/t3.webp",
    "/templates/t4.webp",
    "/templates/t5.webp",
    "/templates/t6.webp",
    "/templates/t7.webp",
    "/templates/t8.webp",
    "/templates/t9.webp",
  ],
};

const seedMeta = (prefix: keyof typeof imageMap) =>
  imageMap[prefix].map((img, i) => ({
    id: i + 1,
    image: img,
  }));

const testimonialMeta = [
  { avatar: "https://picsum.photos/seed/tmember-sarah/64/64" },
  { avatar: "https://picsum.photos/seed/tmember-arjun/64/64" },
  { avatar: "https://picsum.photos/seed/tmember-emily/64/64" },
  { avatar: "https://picsum.photos/seed/tmember-daniel/64/64" },
  { avatar: "https://picsum.photos/seed/tmember-julie/64/64" },
];

const contactFieldIds = ["name", "email", "company", "message"];

const footerMainHrefs = [
  "#",
  "#services",
  "#portfolio",
  "#templates",
  "#pricing",
  "#about",
  "#contact",
];
const footerLegalHrefs = ["#", "#"];
const footerSocialHrefs = ["#", "#", "#"];

// Composed config
export const siteConfig = {
  name: "TruS",
  tagline: "Turning Ideas into Products",
  description:
    "TruS is a modern web development studio building premium, interactive, and scalable React websites with advanced motion design and full client ownership.",
  url: "https://trus.dev",

  nav: {
    logo: "TruS",
    links: en.nav.links.map((label, i) => ({ label, href: navHrefs[i] })),
    cta: { label: en.nav.cta, href: "#contact" },
  },

  hero: {
    /** Displayed below CTAs as "We ◉ READY-MADE TEMPLATES" */
    badge: en.hero.badge,
    badgePrefix: en.hero.badgePrefix,
    /**
     * Headline lines. Use [word] to apply accent colour + bold weight to that word.
     * The last line's accent word animates via a type/delete loop in the Hero.
     */
    headline: en.hero.headline,
    body: en.hero.body,
    cta: {
      primary: { label: en.hero.cta.primary, href: "#templates" },
      secondary: { label: en.hero.cta.secondary, href: "#why-us" },
    },
    stats: en.hero.stats,
  },

  about: {
    eyebrow: en.about.eyebrow,
    headline: en.about.headline,
    body: en.about.body,
    stats: en.about.stats,
    image: "/about-team.jpg",
  },

  portfolio: {
    eyebrow: en.portfolio.eyebrow,
    headline: en.portfolio.headline,
    description: en.portfolio.description,
    seeMore: { label: en.portfolio.seeMore, href: "#" },
    projects: merge(en.portfolio.projects, projectMeta),
  },

  whyUs: {
    eyebrow: en.whyUs.eyebrow,
    headline: en.whyUs.headline,
    cards: en.whyUs.cards,
  },

  team: {
    eyebrow: en.team.eyebrow,
    heading: en.team.heading,
    members: merge(en.team.members, teamMeta),
  },

  services: {
    eyebrow: en.services.eyebrow,
    heading: en.services.heading,
    description: en.services.description,
    items: merge(en.services.items, serviceMeta),
  },

  templateCategories: {
    eyebrow: en.templateCategories.eyebrow,
    heading: en.templateCategories.heading,
    description: en.templateCategories.description,
    seeMore: { label: en.templateCategories.seeMore, href: "#" },
    RightWord: en.templateCategories.RightWord,
    LeftWord: en.templateCategories.LeftWord,
    categories: en.templateCategories.categories,
    templates: {
      Lawyers: merge(en.templateCategories.templates.Lawyers, seedMeta("law")),
      Fitness: merge(en.templateCategories.templates.Fitness, seedMeta("fit")),
      "Real Estate": merge(
        en.templateCategories.templates["Real Estate"],
        seedMeta("re"),
      ),
      Clinics: merge(en.templateCategories.templates.Clinics, seedMeta("cl")),
      Barbershops: merge(
        en.templateCategories.templates.Barbershops,
        seedMeta("bar"),
      ),
      All: merge(en.templateCategories.templates.All, seedMeta("all")),
    } as Record<
      string,
      Array<{ id: number; name: string; tag: string; image: string }>
    >,
  },

  contact: {
    eyebrow: en.contact.eyebrow,
    heading: en.contact.heading,
    card: en.contact.card,
    form: {
      fields: en.contact.form.fields.map((f, i) => ({
        id: contactFieldIds[i],
        ...f,
      })),
      submit: en.contact.form.submit,
    },
  },

  testimonials: {
    eyebrow: en.testimonials.eyebrow,
    heading: en.testimonials.heading,
    subtitle: en.testimonials.subtitle,
    items: merge(en.testimonials.items, testimonialMeta),
  },

  footer: {
    tagline: en.footer.tagline,
    mainPages: en.footer.mainPages.map((label, i) => ({
      label,
      href: footerMainHrefs[i],
    })),
    legal: en.footer.legal.map((label, i) => ({
      label,
      href: footerLegalHrefs[i],
    })),
    contact: en.footer.contact,
    socials: en.footer.socials.map((label, i) => ({
      label,
      href: footerSocialHrefs[i],
    })),
  },
};

export type SiteConfig = typeof siteConfig;
