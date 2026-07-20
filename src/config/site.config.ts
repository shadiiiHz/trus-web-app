/**
 * Structural configuration for the site.
 *
 * All user-facing TEXT lives in `/src/i18n/{locale}.json` (`en.json` is the
 * source of truth; other locales mirror its shape). This file composes that
 * text with structural data — hrefs, ids, colours, image URLs, socials — so
 * components keep a single `siteConfig` import. To rebrand: edit the locale
 * JSON files (copy) and the meta arrays below (assets/links).
 *
 * `siteConfig` is a Proxy that rebuilds itself from the active locale on
 * every property access, so switching locale (see `@/i18n`) updates every
 * consumer on their next render without any code changes on their end.
 *
 * Accent convention: wrap any word in [brackets] to render it in the accent
 * colour. Example: "at [TruS]" → "at " (white) + "TruS" (brand-accent, bold).
 */
import { getLocale, locales, type Locale } from "@/i18n";

// Footer social icons — MUST be real `import`s, not string paths.
// A plain string like "@/assets/facebook.svg" is never resolved by the
// bundler (the `@/` alias only applies inside actual `import` statements),
// so using it directly as an <img src> 404s and the icon never renders.
// Importing here lets Vite/webpack process the file and give us the real,
// hashed build URL.
import facebookIcon from "@/assets/facebook.svg";
import instagramIcon from "@/assets/instagram.svg";
import xIcon from "@/assets/x.svg";
import whatsappIcon from "@/assets/whatsapp.svg";
import telegramIcon from "@/assets/telegram.svg";

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

const footerServicesHrefs = [
  "#services",
  "#services",
  "#services",
  "#services",
  "#services",
];
const footerCompanyHrefs = ["#about", "#team", "#portfolio", "#contact"];
const footerSocialHrefs = ["#", "#", "#", "#", "#"];
const footerBottomHrefs = ["#", "#", "#"];
const footerIconLinks = [
  xIcon,
  instagramIcon,
  facebookIcon,
  telegramIcon,
  whatsappIcon,
];

/** Composes the structural config from the text dictionary of a given locale. */
function buildSiteConfig(locale: Locale) {
  const dict = locales[locale];

  return {
    name: "TruS",
    tagline: "Turning Ideas into Products",
    description:
      "TruS is a modern web development studio building premium, interactive, and scalable React websites with advanced motion design and full client ownership.",
    url: "https://trus.dev",

    nav: {
      logo: "TruS",
      links: dict.nav.links.map((label, i) => ({ label, href: navHrefs[i] })),
      cta: { label: dict.nav.cta, href: "#contact" },
    },

    hero: {
      /** Displayed below CTAs as "We ◉ READY-MADE TEMPLATES" */
      badge: dict.hero.badge,
      badgePrefix: dict.hero.badgePrefix,
      /**
       * Headline lines. Use [word] to apply accent colour + bold weight to that word.
       * The last line's accent word animates via a type/delete loop in the Hero.
       */
      headline: dict.hero.headline,
      body: dict.hero.body,
      cta: {
        primary: { label: dict.hero.cta.primary, href: "#templates" },
        secondary: { label: dict.hero.cta.secondary, href: "#why-us" },
      },
    },

    about: {
      eyebrow: dict.about.eyebrow,
      headline: dict.about.headline,
      body: dict.about.body,
      stats: dict.about.stats,
      image: "/about-team.jpg",
    },

    portfolio: {
      eyebrow: dict.portfolio.eyebrow,
      headline: dict.portfolio.headline,
      description: dict.portfolio.description,
      seeMore: { label: dict.portfolio.seeMore, href: "#" },
      projects: merge(dict.portfolio.projects, projectMeta),
    },

    whyUs: {
      eyebrow: dict.whyUs.eyebrow,
      headline: dict.whyUs.headline,
      cards: dict.whyUs.cards,
    },

    team: {
      eyebrow: dict.team.eyebrow,
      heading: dict.team.heading,
      members: merge(dict.team.members, teamMeta),
    },

    services: {
      eyebrow: dict.services.eyebrow,
      heading: dict.services.heading,
      description: dict.services.description,
      items: merge(dict.services.items, serviceMeta),
    },

    templateCategories: {
      eyebrow: dict.templateCategories.eyebrow,
      heading: dict.templateCategories.heading,
      description: dict.templateCategories.description,
      seeMore: { label: dict.templateCategories.seeMore, href: "#" },
      RightWord: dict.templateCategories.RightWord,
      LeftWord: dict.templateCategories.LeftWord,
      tagline: dict.templateCategories.tagline,
      sectionDes: dict.templateCategories.sectionDes,
      categories: dict.templateCategories.categories,
      templates: {
        lawyers: merge(
          dict.templateCategories.templates.lawyers,
          seedMeta("law"),
        ),
        fitness: merge(
          dict.templateCategories.templates.fitness,
          seedMeta("fit"),
        ),
        realEstate: merge(
          dict.templateCategories.templates.realEstate,
          seedMeta("re"),
        ),
        clinics: merge(
          dict.templateCategories.templates.clinics,
          seedMeta("cl"),
        ),
        barbershops: merge(
          dict.templateCategories.templates.barbershops,
          seedMeta("bar"),
        ),
        all: merge(dict.templateCategories.templates.all, seedMeta("all")),
      } as Record<
        string,
        Array<{ id: number; name: string; tag: string; image: string }>
      >,
    },

    contact: {
      eyebrow: dict.contact.eyebrow,
      heading: dict.contact.heading,
      card: dict.contact.card,
      form: {
        fields: dict.contact.form.fields.map((f, i) => ({
          id: contactFieldIds[i],
          ...f,
        })),
        submit: dict.contact.form.submit,
      },
    },

    testimonials: {
      eyebrow: dict.testimonials.eyebrow,
      heading: dict.testimonials.heading,
      subtitle: dict.testimonials.subtitle,
      items: merge(dict.testimonials.items, testimonialMeta),
    },

    footer: {
      firstColumn: dict.footer.firstColumn,
      secondColumn: dict.footer.secondColumn,
      thirdColumn: dict.footer.thirdColumn,
      tagline: dict.footer.tagline,
      services: dict.footer.services.map((label, i) => ({
        label,
        href: footerServicesHrefs[i],
      })),
      company: dict.footer.company.map((label, i) => ({
        label,
        href: footerCompanyHrefs[i],
      })),
      contact: dict.footer.contact,
      socials: dict.footer.socials.map((label, i) => ({
        label,
        href: footerSocialHrefs[i],
        icon: footerIconLinks[i],
      })),
      bottomLinks: dict.footer.bottomLinks.map((label, i) => ({
        label,
        href: footerBottomHrefs[i],
      })),
      copyright: dict.footer.copyright,
    },
  };
}

export type SiteConfig = ReturnType<typeof buildSiteConfig>;

// Memoized per locale (there are only ever as many as `locales` has keys) so
// that `siteConfig.foo` returns the *same* object reference across renders
// as long as the locale hasn't changed. This matters: several components
// (e.g. TemplateGridReveal's scroll-driven crossfade) put nested siteConfig
// values straight into a `useEffect`/`useMemo` dependency array, and a fresh
// object identity on every read — even with identical content — would make
// those effects think something changed on every render, not just on an
// actual locale switch.
const configCache = new Map<Locale, SiteConfig>();
function getCachedSiteConfig(locale: Locale): SiteConfig {
  let config = configCache.get(locale);
  if (!config) {
    config = buildSiteConfig(locale);
    configCache.set(locale, config);
  }
  return config;
}

// `siteConfig` re-derives itself from the active locale, so every consumer
// that reads `siteConfig.xxx` during render (the pattern used throughout
// this codebase) picks up the current locale automatically — no
// consumer-side changes needed when the locale switches.
export const siteConfig: SiteConfig = new Proxy({} as SiteConfig, {
  get(_target, prop: string | symbol) {
    return getCachedSiteConfig(getLocale())[prop as keyof SiteConfig];
  },
});
