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
import type { FigmaHeroOptions } from "@/components/service-detail/ServiceDetailHero";
import type { ServiceStackIcon } from "@/components/service-detail/socialIcons";

/** Keys of `serviceDetail.pages` in the locale JSON files. */
export type ServiceTextKey = "seo" | "webDesign" | "brand" | "social" | "autoPost" | "instagram" | "localizedGrowth" | "linkedin" | "x" | "telegram" | "growthIntelligence";

/** Optional "how it works" section (numbered step cards). */
export interface ServiceDetailProcess {
  eyebrow: string;
  heading: string;
  description: string;
  steps: readonly { title: string; description: string }[];
}

/** Optional dark "strategy" section (image + example list + second list). Example `description` supports **bold**. */
export interface ServiceDetailStrategy {
  heading: string;
  /** Supports \n line breaks. */
  intro: string;
  exampleHeading: string;
  examples: readonly { title: string; description: string }[];
  includeHeading: string;
  includeItems: readonly string[];
  imageAlt: string;
}

/** Optional light "insights" section (heading + intro, image, bullet list, closing paragraph). `intro` supports **bold** and line breaks. */
export interface ServiceDetailIntelligence {
  heading: string;
  intro: string;
  imageAlt: string;
  listHeading: string;
  items: readonly string[];
  outro: string;
}

/** Optional scroll-stacked card section (cards slide over each other). */
export interface ServiceDetailAutomation {
  eyebrow: string;
  heading: string;
  imageAlt: string;
  /** `description` supports `\n` line breaks. */
  items: readonly { title: string; description: string }[];
}

/** Optional dark "publishing" section (heading + intro, centred image, icon list, closing paragraph). `outro` supports `
` line breaks. */
export interface ServiceDetailPublishing {
  heading: string;
  subheading: string;
  description: string;
  imageAlt: string;
  listHeading: string;
  items: readonly string[];
  outro: string;
}

/** Optional light text-only "timing" section. `intro` / `insightsIntro` support **bold** and `\n` line breaks. */
export interface ServiceDetailTiming {
  heading: string;
  intro: string;
  insightsHeading: string;
  insightsIntro: string;
  listHeading: string;
  items: readonly string[];
  outro: string;
}

/** Optional dark "growth + workflow" section. `intro` supports **bold**, `\n` line breaks and `- ` bullet lines; `platforms` supports **bold** and `\n`. */
export interface ServiceDetailWorkflow {
  heading: string;
  intro: string;
  growthImageAlt: string;
  workflowHeading: string;
  workflowIntro: string;
  platforms: string;
  highlightsHeading: string;
  highlights: readonly string[];
  workflowImageAlt: string;
}

/** Optional dark "connected growth" section (heading, intro + list, image beside a highlights list). */
export interface ServiceDetailGrowth {
  eyebrow: string;
  heading: string;
  description: string;
  listIntro: string;
  listItems: readonly string[];
  outro: string;
  highlightsHeading: string;
  highlights: readonly string[];
  imageAlt: string;
}

/** Optional light "modes" section. Mode `description` supports **bold** and line breaks. */
export interface ServiceDetailFlexible {
  heading: string;
  description: string;
  modes: readonly { title: string; description: string }[];
}

/**
 * Optional dark "service" section: about block + image, then a service block (`body` supports **bold**, `\n` line
 * breaks, `- ` bullet lines and `\n\n` paragraph gaps), an image beside a "gain" list, and a closing "best for" note.
 */
export interface ServiceDetailCreator {
  aboutHeading: string;
  aboutDescription: string;
  aboutImageAlt: string;
  heading: string;
  subheading: string;
  body: string;
  gainHeading: string;
  gainItems: readonly string[];
  gainImageAlt: string;
  bestForHeading: string;
  bestFor: string;
}

/** Optional light grey "focus" section (heading, description, image beside "gain" list, "best for" note). `body` / `bestFor` support **bold** and `\n` line breaks. */
export interface ServiceDetailFocus {
  heading: string;
  subheading: string;
  body: string;
  imageAlt: string;
  gainHeading: string;
  gainItems: readonly string[];
  bestForHeading: string;
  bestFor: string;
}

/** Optional light grey text-only "multilingual strategy" section. `intro` supports `\n` line breaks and `- ` bullet lines; `outro` supports `\n` line breaks. */
export interface ServiceDetailMultilingual {
  heading: string;
  subheading: string;
  intro: string;
  exampleIntro: string;
  examples: readonly { title: string; description: string }[];
  outro: string;
}

/** Optional dark "localization" section (heading, image beside text, second heading + text). `body` / `publishBody` support **bold**, `\n` line breaks and `- ` bullet lines. */
export interface ServiceDetailLocalization {
  heading: string;
  imageAlt: string;
  body: string;
  publishHeading: string;
  publishBody: string;
}

/** Optional light grey "market insights" section (heading, two bullet-list texts, centred image). Texts support **bold**, `\n` line breaks and `- ` bullet lines. */
export interface ServiceDetailMarketInsights {
  heading: string;
  imageAlt: string;
  intro: string;
  example: string;
}

/** Optional dark "focused growth" section: intro + step pills, workflow options, "gain" list beside an image, highlights beside an image. `intro` supports **bold** and `\n` line breaks. */
export interface ServiceDetailFocusedGrowth {
  heading: string;
  intro: string;
  /** Pills of the cycle (a row on desktop, a column on mobile). */
  steps: readonly string[];
  closing: string;
  workflowHeading: string;
  workflows: readonly { title: string; description: string }[];
  gainHeading: string;
  gainItems: readonly string[];
  gainImageAlt: string;
  highlightsHeading: string;
  highlightItems: readonly string[];
  highlightsImageAlt: string;
}

/** Optional dark "publisher" section — same copy shape as `focus`. */
export type ServiceDetailPublisher = ServiceDetailFocus;

/** Optional dark "benefits" section: a "gain" list beside an image, then an image beside a "highlights" list. `imageAlt` is shared by both images. */
export interface ServiceDetailBenefits {
  heading: string;
  items: readonly string[];
  imageAlt: string;
  highlightsHeading: string;
  highlightItems: readonly string[];
}

/** Optional light grey "journey" section: image, heading + intro with a connected pill workflow (`steps`), closing text, and a workflow-choice block (`workflow` supports **bold** and `
`). */
export interface ServiceDetailJourney {
  heading: string;
  imageAlt: string;
  intro: string;
  /** Bold line below the intro. */
  introLead: string;
  steps: readonly string[];
  outro: string;
  workflowHeading: string;
  workflow: string;
}

/** Optional dark "responses" section: image beside heading, intro and a comparison list, then a "decide where to" list. `lead` / `nextLead` support **bold**. */
export interface ServiceDetailResponses {
  heading: string;
  intro: string;
  lead: string;
  items: readonly string[];
  outro: string;
  imageAlt: string;
  nextLead: string;
  nextItems: readonly string[];
  nextOutro: string;
}

/** Optional light grey "audience" section: intro, an image beside a target-audience list (`text` supports `
` line breaks), then a "publish by market" block. */
export interface ServiceDetailAudience {
  heading: string;
  intro: string;
  imageAlt: string;
  lead: string;
  items: readonly string[];
  text: string;
  publishHeading: string;
  publishIntro: string;
  publishLead: string;
  publishItems: readonly string[];
  publishText: string;
}

/** Optional dark "market strategy" section: intro (supports **bold**, `
`) + adaptable factors beside an image, then a markets example (`marketsExample` supports **bold**, `
`). */
export interface ServiceDetailMarketStrategy {
  heading: string;
  intro: string;
  adjustHeading: string;
  adjustItems: readonly string[];
  outro: string;
  imageAlt: string;
  marketsHeading: string;
  marketsIntro: string;
  marketsExample: string;
}

/** Optional light grey "publisher" section: lead + text, an example block (supports **bold** and `
`), image beside "gain", "best for". `text` supports `
` line breaks. */
export interface ServiceDetailPublisherLight {
  heading: string;
  /** Bold first line. */
  lead: string;
  text: string;
  example: string;
  /** Optional closing sentence after the example (Telegram page). */
  closing?: string;
  imageAlt: string;
  gainHeading: string;
  gainItems: readonly string[];
  bestForHeading: string;
  bestFor: string;
}

/** Optional dark "content creator" section: intro, adjustable options, image beside "gain", "best for". `multilingual` supports `
` line breaks, `bestFor` supports **bold**. */
export interface ServiceDetailContentCreator {
  heading: string;
  /** Bold first line. */
  lead: string;
  text: string;
  adjustHeading: string;
  adjustItems: readonly string[];
  multilingual: string;
  imageAlt: string;
  gainHeading: string;
  gainItems: readonly string[];
  bestForHeading: string;
  bestFor: string;
}

/** Optional light grey "overview" section: intro with bullets, image beside a refine list, "gain" list, "best for" note. `text` supports `
` line breaks, `bestFor` supports **bold**. */
export interface ServiceDetailOverview {
  heading: string;
  /** Bold first line. */
  lead: string;
  text: string;
  items: readonly string[];
  outro: string;
  imageAlt: string;
  refineHeading: string;
  refineItems: readonly string[];
  refineOutro: string;
  gainHeading: string;
  gainItems: readonly string[];
  bestForHeading: string;
  bestFor: string;
}

/** Optional dark "about the service" block right after the hero (heading, description, centred image). `body` supports **bold** and `
` line breaks. */
export interface ServiceDetailIntro {
  heading: string;
  body: string;
  imageAlt: string;
}

/** Optional dark "about the service" block: eyebrow, heading and description, then an image beside a second heading, bold lead and list. `body` / `text` support **bold** and line breaks. */
export interface ServiceDetailAboutService {
  heading: string;
  body: string;
  imageAlt: string;
  subHeading: string;
  /** Bold first line(s). */
  lead: string;
  text: string;
  items: readonly string[];
}

/** Optional light block: two list columns, a "What You Gain" list beside an image, and a "Best For" note. `bestFor` supports **bold**. */
export interface ServiceDetailCreatorOverview {
  intro: string;
  items: readonly string[];
  outro: string;
  adjustLead: string;
  adjustItems: readonly string[];
  adjustOutro: string;
  gainHeading: string;
  gainItems: readonly string[];
  imageAlt: string;
  bestForHeading: string;
  bestFor: string;
}

/** Optional dark multilingual-strategy block: adaptation list, separate accounts with examples, then an image beside a "short post or thread?" text. `text` / `examples` support **bold** and line breaks. */
export interface ServiceDetailMarketAccounts {
  heading: string;
  /** Bold first line(s). */
  lead: string;
  intro: string;
  adaptHeading: string;
  adaptItems: readonly string[];
  adaptOutro: string;
  accountsHeading: string;
  accountsIntro: string;
  accountsExamples: string;
  accountsOutro: string;
  imageAlt: string;
  formatHeading: string;
  formatText: string;
  formatItems: readonly string[];
  formatOutro: string;
}

/** Optional light block: a timing text, then a "learn which markets perform better" text beside an image. `intro` / `insightsLead` support **bold** and line breaks. */
export interface ServiceDetailTimingPerformance {
  heading: string;
  intro: string;
  items: readonly string[];
  outro: string;
  insightsHeading: string;
  insightsLead: string;
  insightsItems: readonly string[];
  insightsOutro: string;
  decideLead: string;
  decideItems: readonly string[];
  imageAlt: string;
}

/** Optional light "creator guide" block: heading, a "based on" list, an image beside purposes, a refine list, a "What You Gain" list beside an image and a "Best For" note. `bestFor` supports **bold**. */
export interface ServiceDetailCreatorGuide {
  heading: string;
  tagline: string;
  basedLead: string;
  basedItems: readonly string[];
  imageAlt: string;
  purposesLead: string;
  purposesItems: readonly string[];
  purposesOutro: string;
  refineLead: string;
  refineItems: readonly string[];
  refineOutro: string;
  gainHeading: string;
  gainItems: readonly string[];
  gainImageAlt: string;
  bestForHeading: string;
  bestFor: string;
}

/** Optional dark "channel creator" block: heading and intro, an image beside a refine list, a closing text, a "What You Gain" list beside an image and a "Best For" note. `intro` / `closing` support line breaks. */
export interface ServiceDetailChannelCreator {
  heading: string;
  tagline: string;
  intro: string;
  refineImageAlt: string;
  refineLead: string;
  refineItems: readonly string[];
  closing: string;
  gainHeading: string;
  gainItems: readonly string[];
  gainImageAlt: string;
  bestForHeading: string;
  bestFor: string;
}

/** Optional dark "multilingual channel strategy" block: heading, intro, labelled examples, then a list beside an image (image above the list on phones). */
export interface ServiceDetailChannelStrategy {
  heading: string;
  tagline: string;
  intro: string;
  exampleLead: string;
  examples: readonly { label: string; text: string }[];
  listLead: string;
  listItems: readonly string[];
  listOutro: string;
  imageAlt: string;
}

/** Optional light "local channel" block: heading and intro, an image beside an adapt list, then an "ongoing relationship" text with a scheduled-content list. `ongoingText` supports **bold**. */
export interface ServiceDetailChannelLocal {
  heading: string;
  intro: string;
  imageAlt: string;
  adaptLead: string;
  adaptItems: readonly string[];
  adaptOutro: string;
  ongoingHeading: string;
  ongoingText: string;
  exampleLead: string;
  exampleItems: readonly string[];
  closing: string;
}

/** Optional dark "channel market" block: heading and tagline, an image beside a publish-by list (image above on phones), then a "learn which channels respond better" list. */
export interface ServiceDetailChannelMarket {
  heading: string;
  tagline: string;
  imageAlt: string;
  publishLead: string;
  publishItems: readonly string[];
  publishOutro: string;
  insightHeading: string;
  insightText: string;
  compareLead: string;
  compareItems: readonly string[];
}

/** Optional light "channel growth" block: an "over time you can identify" list, an image, then a heading with intro and a pill process chain. `intro` supports **bold**. */
export interface ServiceDetailChannelGrowth {
  listLead: string;
  listItems: readonly string[];
  listOutro: string;
  imageAlt: string;
  heading: string;
  intro: string;
  processLead: string;
  steps: readonly string[];
  closing: string;
}

/** Optional dark "channel workflow" block: a workflow-choice list with bold labels, a "What You Gain" list, then an image beside a highlights list. */
export interface ServiceDetailChannelWorkflow {
  workflowHeading: string;
  workflows: readonly { title: string; description: string }[];
  gainHeading: string;
  gainItems: readonly string[];
  imageAlt: string;
  highlightsHeading: string;
  highlightItems: readonly string[];
}

/** Optional dark "mission" block: eyebrow, heading, an image beside a paragraph list, then a "clear path" pill chain. A `""` paragraph is a spacer line. */
export interface ServiceDetailMission {
  heading: string;
  paragraphs: readonly { text: string; bold?: boolean; justifyLast?: boolean }[];
  imageAlt: string;
  pathLead: string;
  steps: readonly string[];
}

/** Optional dark "ecosystem" block: heading and intro, a short pill chain, an image beside a "What You Gain" list, then a mission header with a summary. `intro` supports **bold** and `
` lines (a non-breaking-space line is a spacer). */
export interface ServiceDetailEcosystem {
  heading: string;
  intro: string;
  steps: readonly string[];
  imageAlt: string;
  gainHeading: string;
  gainItems: readonly string[];
  missionLabel: string;
  missionHeading: string;
  missionIntro: string;
  missionQuestions: readonly string[];
  missionConnect: string;
  missionGoal: string;
}

/** Optional dark "why this matters" section (heading + paragraph, image beside a highlights list). */
export interface ServiceDetailMatters {
  heading: string;
  body: string;
  imageAlt: string;
  highlightsHeading: string;
  items: readonly string[];
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
  publishing?: ServiceDetailPublishing;
  /** Rendered after `publishing` when present. */
  timing?: ServiceDetailTiming;
  /** Rendered after `timing` when present. */
  workflow?: ServiceDetailWorkflow;
  /** Rendered after `workflow` when present. */
  strategy?: ServiceDetailStrategy;
  /** Rendered after `strategy` when present. */
  intelligence?: ServiceDetailIntelligence;
  /** Rendered after `intelligence` when present. */
  automation?: ServiceDetailAutomation;
  /** Rendered after `automation` when present. */
  flexible?: ServiceDetailFlexible;
  /** Rendered after `flexible` when present. */
  growth?: ServiceDetailGrowth;
  /** Rendered right after the hero when present. */
  intro?: ServiceDetailIntro;
  /** Rendered right after the hero when present. */
  aboutService?: ServiceDetailAboutService;
  /** Rendered after `aboutService` when present. */
  creatorOverview?: ServiceDetailCreatorOverview;
  /** Rendered after `intro` when present. */
  creatorGuide?: ServiceDetailCreatorGuide;
  /** Rendered right after the hero when present. */
  mission?: ServiceDetailMission;
  /** Rendered after `process` when present. */
  ecosystem?: ServiceDetailEcosystem;
  /** Rendered after `creatorGuide` when present. */
  channelCreator?: ServiceDetailChannelCreator;
  /** Rendered after `publisherLight` when present. */
  channelStrategy?: ServiceDetailChannelStrategy;
  /** Rendered after `channelStrategy` when present. */
  channelLocal?: ServiceDetailChannelLocal;
  /** Rendered after `channelLocal` when present. */
  channelMarket?: ServiceDetailChannelMarket;
  /** Rendered after `channelMarket` when present. */
  channelGrowth?: ServiceDetailChannelGrowth;
  /** Rendered after `channelGrowth` when present. */
  channelWorkflow?: ServiceDetailChannelWorkflow;
  /** Rendered after `marketStrategy` when present. */
  marketAccounts?: ServiceDetailMarketAccounts;
  /** Rendered after `marketAccounts` when present. */
  timingPerformance?: ServiceDetailTimingPerformance;
  /** Rendered after `intro` when present. */
  overview?: ServiceDetailOverview;
  /** Rendered after `overview` when present. */
  contentCreator?: ServiceDetailContentCreator;
  /** Rendered after `contentCreator` when present. */
  publisherLight?: ServiceDetailPublisherLight;
  /** Rendered after `publisherLight` when present. */
  marketStrategy?: ServiceDetailMarketStrategy;
  /** Rendered after `marketStrategy` when present. */
  audience?: ServiceDetailAudience;
  /** Rendered after `audience` when present. */
  responses?: ServiceDetailResponses;
  /** Rendered after `responses` when present. */
  journey?: ServiceDetailJourney;
  /** Rendered after `journey` when present. */
  benefits?: ServiceDetailBenefits;
  /** Rendered after `process` (and the other About-area sections) when present. */
  matters?: ServiceDetailMatters;
  /** Rendered right after the hero when present. */
  creator?: ServiceDetailCreator;
  /** Rendered after `creator` when present. */
  focus?: ServiceDetailFocus;
  /** Rendered after `focus` when present. */
  publisher?: ServiceDetailPublisher;
  /** Rendered after `publisher` when present. */
  multilingual?: ServiceDetailMultilingual;
  /** Rendered after `multilingual` when present. */
  localization?: ServiceDetailLocalization;
  /** Rendered after `localization` when present. */
  marketInsights?: ServiceDetailMarketInsights;
  /** Rendered after `marketInsights` when present. */
  focusedGrowth?: ServiceDetailFocusedGrowth;
  /** `description` supports `\n` line breaks. */
  contact?: { heading: string; description: string; /** Replaces `description` from the lg breakpoint up. */ descriptionDesktop?: string };
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
  /** Hero laid out in Figma's 1440×822 / 390×613 frames, scaling proportionally (no clamp()s, 0 tracking, Figma gradients). */
  heroFigma?: boolean | FigmaHeroOptions;
  /** Render only the hero (page not fully designed yet). Without this or `images`, the URL renders the 404 page. */
  heroOnly?: boolean;
  /** About-section images; omit while the page isn't designed yet. */
  images?: { about: string; highlights?: string };
  /** Purple radial glow behind the About section (Figma background). */
  aboutGlow?: boolean;
  /** Figma 22px leading, 20px mobile gutters and 40px block gaps (pages without a Highlights block). */
  aboutTight?: boolean;
  /** About image sits after "What You Gain" (right on desktop, below on mobile) with the Figma 420×393 sizing and 32px headings. */
  aboutImageEnd?: boolean;
  /** "How it works" cards render as an accordion (first open) with Figma sizing. */
  processAccordion?: boolean;
  /** With `processAccordion`: Figma-exact "process" section (32px heading, centred intro, 486px divider pattern). */
  processFigma?: boolean;
  /** With `processAccordion`: the Business Growth page's single column of closed cards (see `ServiceDetailProcess`). */
  processGrid?: boolean;
  /** Image + per-item icons of the `publishing` section. */
  publishingImage?: string;
  publishingIcons?: readonly ServiceStackIcon[];
  /** Images of the `workflow` section: the centred growth image and the one beside Highlights. */
  workflowImages?: { growth: string; workflow: string };
  /** Desktop line-height (px) of the About description on pages with a Highlights block (default 20). */
  aboutTextLeading?: number;
  /** Desktop size (px) of the centered About image, default 414×212. */
  aboutImageSize?: { width: number; height: number };
  /** Desktop size (px) of the Highlights image, default 414×212. */
  highlightsImageSize?: { width: number; height: number };
  /** Contact description spans the full container width. */
  contactWide?: boolean;
  /** Contact description uses plain tracking and is justified on desktop (that page's Figma). */
  contactPlainText?: boolean;
  /** Contact block follows the Business Growth Figma (120.5px top, 32/42 heading, mobile card/form sizes). */
  contactCompact?: boolean;
  /** Image of the `strategy` section (only for pages with `strategy` copy). */
  strategyImage?: string;
  /** Image of the `intelligence` section (only for pages with `intelligence` copy). */
  intelligenceImage?: string;
  /** Glyphs shown before each scroll-stacked card title, in item order. */
  stackIcons?: readonly ServiceStackIcon[];
  /** Image of the `growth` section (only for pages with `growth` copy). */
  growthImage?: string;
  /** Image beside the scroll-stacked cards (only for pages with `automation` copy). */
  stackImage?: string;
  /** Images of the `creator` section: beside the about text, and beside the "gain" list. */
  creatorImages?: { about: string; gain: string };
  /** Image of the `aboutService` section (only for pages with `aboutService` copy). */
  aboutServiceImage?: string;
  /** Image of the `creatorOverview` section (only for pages with `creatorOverview` copy). */
  creatorOverviewImage?: string;
  /** Images of the `creatorGuide` section: beside the purposes list, and beside "What You Gain". */
  creatorGuideImages?: { purposes: string; gain: string };
  /** Image of the `mission` section (only for pages with `mission` copy). */
  missionImage?: string;
  /** Image of the `ecosystem` section (only for pages with `ecosystem` copy). */
  ecosystemImage?: string;
  /** Images of the `channelCreator` section: beside the refine list, and beside "What You Gain". */
  channelCreatorImages?: { refine: string; gain: string };
  /** Image of the `channelStrategy` section (only for pages with `channelStrategy` copy). */
  channelStrategyImage?: string;
  /** Image of the `channelLocal` section (only for pages with `channelLocal` copy). */
  channelLocalImage?: string;
  /** Image of the `channelMarket` section (only for pages with `channelMarket` copy). */
  channelMarketImage?: string;
  /** Image of the `channelGrowth` section (only for pages with `channelGrowth` copy). */
  channelGrowthImage?: string;
  /** Image of the `channelWorkflow` section (only for pages with `channelWorkflow` copy). */
  channelWorkflowImage?: string;
  /** Image of the `marketAccounts` section (only for pages with `marketAccounts` copy). */
  marketAccountsImage?: string;
  /** Image of the `timingPerformance` section (only for pages with `timingPerformance` copy). */
  timingPerformanceImage?: string;
  /** Image of the `intro` section (only for pages with `intro` copy). */
  introImage?: string;
  /** `intro` in the Telegram page's Figma style (see `ServiceDetailIntro`). */
  introFigma?: boolean;
  /** Image of the `overview` section (only for pages with `overview` copy). */
  overviewImage?: string;
  /** Image of the `contentCreator` section (only for pages with `contentCreator` copy). */
  contentCreatorImage?: string;
  /** `contentCreator` in the X page's Figma style: 20px lead, regular adjust heading, 414px image, purple haze. */
  contentCreatorX?: boolean;
  /** Image of the `publisherLight` section (only for pages with `publisherLight` copy). */
  publisherLightImage?: string;
  /** `publisherLight` in the X page's Figma style: 414px image, 24px list indent, 16/19 desktop "Best For" with **bold**. */
  publisherLightX?: boolean;
  /** `publisherLight` in the Telegram page's Figma style (see `ServiceDetailPublisherLight`). */
  publisherLightChannel?: boolean;
  /** Image of the `marketStrategy` section (only for pages with `marketStrategy` copy). */
  marketStrategyImage?: string;
  /** Image of the `audience` section (only for pages with `audience` copy). */
  audienceImage?: string;
  /** Image of the `responses` section (only for pages with `responses` copy). */
  responsesImage?: string;
  /** Image of the `journey` section (only for pages with `journey` copy). */
  journeyImage?: string;
  /** Images of the `benefits` section: beside the "gain" list, and beside the highlights. */
  benefitsImages?: { gain: string; highlights: string };
  /** Image of the `matters` section (only for pages with `matters` copy). */
  mattersImage?: string;
  /** Image of the `focus` section (only for pages with `focus` copy). */
  focusImage?: string;
  /** Image of the `publisher` section (only for pages with `publisher` copy). */
  publisherImage?: string;
  /** Image of the `localization` section (only for pages with `localization` copy). */
  localizationImage?: string;
  /** Image of the `marketInsights` section (only for pages with `marketInsights` copy). */
  marketInsightsImage?: string;
  /** Images of the `focusedGrowth` section: beside the "gain" list, and beside the highlights. */
  focusedGrowthImages?: { gain: string; highlights: string };
  /** `focusedGrowth` in the X page's Figma style (see `ServiceDetailFocusedGrowth`). */
  focusedGrowthX?: boolean;
}

export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  {
    slug: "seo-content-optimization",
    textKey: "seo",
    heroImage: "/services/seo-hero.png",
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
    heroImage: "/services/web-design-hero.png",
    heroTextY: 33,
    heroMobile: { imageX: "59%" },
    aboutGlow: true,
    aboutTextLeading: 22,
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
    heroImage: "/services/brand-hero.png",
    heroTextY: 34,
    heroMobile: { align: "top", imageX: "67%", titleWidth: 240 },
    aboutGlow: true,
    aboutTextLeading: 22,
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
    heroImage: "/services/social-hero.png",
    heroTextY: 30,
    heroDesktopFade: true,
    heroMobile: { imageX: "79%", titleWidth: 300 },
    aboutGlow: true,
    aboutImageSize: { width: 420, height: 267 },
    contactWide: true,
    strategyImage: "/services/social-multilingual-strategy.png",
    intelligenceImage: "/services/social-market-intelligence.png",
    stackImage: "/services/social-automation-workspace.png",
    growthImage: "/services/social-connected-growth.png",
    stackIcons: ["settings", "instagram", "linkedin", "x", "telegram"],
    images: {
      about: "/services/social-team-brainstorm.jpg",
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
    aboutGlow: true,
    aboutTight: true,
    processAccordion: true,
    publishingImage: "/services/auto-post-multi-platform.png",
    publishingIcons: ["instagram", "linkedin", "x", "telegram"],
    workflowImages: {
      growth: "/services/auto-post-growth-dashboard.png",
      workflow: "/services/auto-post-workflow-presentation.png",
    },
    aboutImageSize: { width: 420, height: 326 },
    contactWide: true,
    images: {
      about: "/services/auto-post-team-collaboration.png",
    },
  },
  {
    slug: "instagram-content-creator-publisher",
    textKey: "instagram",
    heroImage: "/services/instagram-hero.png",
    heroTextY: 31,
    heroMobile: { imageX: "60%", titleWidth: 329 },
    heroOnly: true,
    contactWide: true,
    creatorImages: {
      about: "/services/instagram-creator-workspace.png",
      gain: "/services/instagram-creator-filming.png",
    },
    focusImage: "/services/instagram-hero.png",
    publisherImage: "/services/instagram-publisher-team.png",
    localizationImage: "/services/instagram-market-content.png",
    marketInsightsImage: "/services/instagram-market-insights.png",
    focusedGrowthImages: {
      gain: "/services/instagram-growth-desk.png",
      highlights: "/services/instagram-growth-phone.png",
    },
  },
  {
    slug: "multilingual-localized-growth-strategy",
    textKey: "localizedGrowth",
    heroImage: "/services/localized-growth-hero.png",
    heroFigma: true,
    heroMobile: { imageX: "59%", titleWidth: 329 },
    aboutGlow: true,
    aboutTight: true,
    aboutImageEnd: true,
    processAccordion: true,
    processFigma: true,
    mattersImage: "/services/localized-growth-notebook.png",
    aboutImageSize: { width: 420, height: 393 },
    contactWide: true,
    images: {
      about: "/services/localized-growth-dashboard.png",
    },
  },
  {
    slug: "linkedin-content-creator-publisher",
    textKey: "linkedin",
    heroImage: "/services/linkedin-hero.png",
    heroFigma: {
      bottom: true,
      gradient: "linear-gradient(76.15deg, rgba(255,255,255,0.72) 31.92%, rgba(255,255,255,0) 47.83%)",
    },
    heroMobile: { imageX: "23%", titleWidth: 329 },
    contactPlainText: true,
    introImage: "/services/linkedin-strategy.png",
    overviewImage: "/services/linkedin-creator.png",
    contentCreatorImage: "/services/linkedin-content-cards.png",
    publisherLightImage: "/services/linkedin-publisher.png",
    marketStrategyImage: "/services/linkedin-multilingual.png",
    audienceImage: "/services/linkedin-audience.png",
    responsesImage: "/services/linkedin-responses.png",
    journeyImage: "/services/linkedin-journey.png",
    benefitsImages: {
      gain: "/services/linkedin-benefits-gain.png",
      highlights: "/services/linkedin-benefits-highlights.png",
    },
    heroOnly: true,
    contactWide: true,
  },
  {
    slug: "x-content-creator-publisher",
    textKey: "x",
    heroImage: "/services/x-hero.png",
    heroFigma: {
      bottom: true,
      dark: true,
      gradient:
        "linear-gradient(11.31deg, rgba(0,0,0,0.792) 7.6%, rgba(0,0,0,0.64116) 24.37%, rgba(0,0,0,0.54) 35.62%, rgba(0,0,0,0) 45.39%)",
    },
    heroMobile: { imageX: "50%", titleWidth: 329 },
    aboutServiceImage: "/services/x-about.png",
    creatorOverviewImage: "/services/x-workspace.png",
    contentCreatorImage: "/services/x-creator.png",
    contentCreatorX: true,
    publisherLightImage: "/services/x-publisher.png",
    publisherLightX: true,
    contactPlainText: true,
    marketAccountsImage: "/services/x-strategy.png",
    timingPerformanceImage: "/services/x-timing.png",
    focusedGrowthImages: {
      gain: "/services/x-growth-gain.png",
      highlights: "/services/x-growth-highlights.png",
    },
    focusedGrowthX: true,
    heroOnly: true,
    contactWide: true,
  },
  {
    slug: "telegram-channel-content-creator-publisher",
    textKey: "telegram",
    heroImage: "/services/telegram-hero.png",
    heroFigma: {
      bottom: true,
      dark: true,
      gradient: "linear-gradient(15.38deg, rgba(0,0,0,0.8) 9.39%, rgba(0,0,0,0) 66.43%)",
    },
    heroMobile: { imageX: "53%", titleWidth: 329 },
    introImage: "/services/telegram-about.png",
    introFigma: true,
    creatorGuideImages: {
      purposes: "/services/telegram-creator.png",
      gain: "/services/telegram-gain.png",
    },
    publisherLightImage: "/services/telegram-publisher.png",
    publisherLightChannel: true,
    channelStrategyImage: "/services/telegram-multilingual.png",
    channelLocalImage: "/services/telegram-local.png",
    channelMarketImage: "/services/telegram-schedule.png",
    channelGrowthImage: "/services/telegram-insights.png",
    channelWorkflowImage: "/services/telegram-workshop.png",
    channelCreatorImages: {
      refine: "/services/telegram-refine.png",
      gain: "/services/telegram-growth.png",
    },
    heroOnly: true,
    contactWide: true,
    contactPlainText: true,
  },
  {
    slug: "business-growth-intelligence-solver",
    textKey: "growthIntelligence",
    heroImage: "/services/growth-hero.png",
    heroFigma: {
      bottom: true,
      ink: "#0A0A0A",
      titleLeading: 64,
      titleTracking: -0.044,
      titleWidth: 650,
      gradient:
        "linear-gradient(36.6deg, rgba(255,255,255,0.64) 24.87%, rgba(255,255,255,0.558431) 39.75%, rgba(255,255,255,0) 56.54%)",
      mobileGradient: "linear-gradient(0.2deg, rgba(255,255,255,0.898039) 18.46%, rgba(255,255,255,0) 58.32%)",
    },
    heroMobile: { imageX: "50%", titleWidth: 329 },
    missionImage: "/services/growth-about.png",
    processAccordion: true,
    processGrid: true,
    ecosystemImage: "/services/growth-ecosystem.png",
    heroOnly: true,
    contactWide: true,
    contactCompact: true,
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
    highlights: text.highlights && images?.highlights ? { ...text.highlights, image: images.highlights } : undefined,
    contact: text.contact ? { ...text.contact, wide: service.contactWide } : undefined,
  };
}
