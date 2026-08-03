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
  { id: 1, image: "/portfolio/p1.webp", link: "https://validway.webflow.io/" },
  { id: 2, image: "/portfolio/p2.webp", link: "https://zesty-template.webflow.io/" },
  { id: 3, image: "/portfolio/p3.webp", link: "https://inkpierce.webflow.io/" },
  { id: 4, image: "/portfolio/p4.webp", link: "https://housent.webflow.io/" },
  { id: 5, image: "/portfolio/p5.webp", link: "https://recover-x.webflow.io/" },
  { id: 6, image: "/portfolio/p6.webp", link: "https://urbanrestaurant.webflow.io/" },
  { id: 7, image: "/portfolio/p7.webp", link: "https://figaro-salon.webflow.io/" },
  { id: 8, image: "/portfolio/p8.webp", link: "https://salonas.webflow.io/" },
  { id: 9, image: "/portfolio/p9.webp", link: "https://law-office-webflow-template.webflow.io/" },
  { id: 10, image: "/portfolio/p10.webp", link: "https://epidermis.webflow.io/" },
];

const teamMeta = [
  {
    id: "sara",
    image: "/team/member1.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "daniel",
    image: "/team/member2.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "lina",
    image: "/team/member3.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "nina",
    image: "/team/member4.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "omar",
    image: "/team/member4.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "elena",
    image: "/team/member3.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "marcus",
    image: "/team/member2.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "aisha",
    image: "/team/member1.png",
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
];

const serviceMeta = [
  { id: "seo" },
  { id: "web-dev" },
  { id: "web-design" },
  { id: "branding" },
  { id: "social-media" },
  { id: "lead-maker" },
  { id: "ai-agent" },
  { id: "content" },
  { id: "email-marketing" },
  { id: "analytics" },
];
// Per-category screenshots + the live site each template card links out to
// (opened in a new tab on click). `all` is derived below by concatenating
// these in the same order (lawyers, fitness, realEstate, clinics,
// restaurant, barbershops). A blank `link` means the card isn't clickable.
const categoryTemplates = {
  law: [
    { image: "/templates/t7.webp", link: "https://advorus.webflow.io/" },
    {
      image: "/templates/t8.webp",
      link: "https://inloy-128.webflow.io/home-1",
    },
    { image: "/templates/t9.webp", link: "https://trustlegal.webflow.io/" },
  ],
  fit: [
    {
      image: "/templates/t5.webp",
      link: "https://flexova-fitness-gym-website-template.webflow.io/",
    },
    { image: "/templates/t6.webp", link: "https://fitcore-ttm.webflow.io/" },
  ],
  re: [
    { image: "/templates/t10.webp", link: "https://andalash.webflow.io/" },
    {
      image: "/templates/t11.webp",
      link: "https://hampton-template.webflow.io/",
    },
  ],
  cl: [
    { image: "/templates/t3.webp", link: "https://oralix.webflow.io/" },
    {
      image: "/templates/t4.webp",
      link: "https://pawfect-webflipin.webflow.io/",
    },
  ],
  restaurant: [
    { image: "/templates/t12.webp", link: "https://thyme-965261.webflow.io/" },
    { image: "/templates/t13.webp", link: "https://airbrick.webflow.io/" },
    { image: "/templates/t14.webp", link: "https://brixsa.webflow.io/" },
    { image: "/templates/t15.webp", link: "https://taverna-cms.webflow.io/" },
  ],
  bar: [
    { image: "/templates/t1.webp", link: "https://glamory.webflow.io/" },
  ],
  all: [
    { image: "/templates/t7.webp", link: "https://advorus.webflow.io/" },
    {
      image: "/templates/t11.webp",
      link: "https://hampton-template.webflow.io/",
    },
    { image: "/templates/t3.webp", link: "https://oralix.webflow.io/" },
    { image: "/templates/t1.webp", link: "https://glamory.webflow.io/" },
    {
      image: "/templates/t5.webp",
      link: "https://flexova-fitness-gym-website-template.webflow.io/",
    },
    { image: "/templates/t10.webp", link: "https://andalash.webflow.io/" },
    { image: "/templates/t13.webp", link: "https://airbrick.webflow.io/" },
    { image: "/templates/t9.webp", link: "https://trustlegal.webflow.io/" },
    { image: "/templates/t12.webp", link: "https://thyme-965261.webflow.io/" },
  ],
};

const templateMap = {
  ...categoryTemplates,
};

const seedTemplates = (prefix: keyof typeof templateMap) =>
  templateMap[prefix].map((tpl, i) => ({
    id: i + 1,
    image: tpl.image,
    link: tpl.link,
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
      // No per-project text — projectMeta is structural-only (image + link)
      projects: projectMeta,
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
        lawyers: seedTemplates("law"),
        fitness: seedTemplates("fit"),
        realEstate: seedTemplates("re"),
        clinics: seedTemplates("cl"),
        restaurant: seedTemplates("restaurant"),
        barbershops: seedTemplates("bar"),
        all: seedTemplates("all"),
      } as Record<string, Array<{ id: number; image: string; link: string }>>,
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
