/**
 * Site-wide, non-secret configuration. Spec §2.2: legal/footer/company
 * details must be configuration-driven rather than hard-coded throughout
 * the app — every page should import from here, not restate these values.
 */

export const company = {
  legalName: "Incyworks Ltd",
  tradingName: "Incy Templates",
  country: "United Kingdom",
  supportEmail: "phil@incytemplates.com",
  ordersEmail: "phil@incytemplates.com",
} as const;

export const site = {
  name: "Incy Templates",
  tagline: "Practical tools for turning ideas into products.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://incytemplates.com",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

// Spec v9 §8.1: the curated-launch primary nav leads with the Core Collection journey rather
// than giving Guide/Template/Tool catalogue routes equal top-level billing — those remain
// reachable via family pages, the Products destination, search and the footer, just not the
// header. Supersedes v3 §8.1's 6-item nav (Products/Guides/Templates/Tools/How it works/About).
export const primaryNav: NavLink[] = [
  { label: "Start here", href: "/collections/start-a-product" },
  { label: "Products", href: "/products" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

/** Journey-stage links for the header/footer "Product journey" navigation (spec v3 §7/§8.3). */
export const JOURNEY_STAGE_LINKS: NavLink[] = [
  { label: "Idea", href: "/journey/idea" },
  { label: "Validate", href: "/journey/validate" },
  { label: "Decide", href: "/journey/decide" },
  { label: "Design", href: "/journey/design" },
  { label: "Build", href: "/journey/build" },
  { label: "Launch", href: "/journey/launch" },
  { label: "Improve", href: "/journey/improve" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Product journey",
    links: JOURNEY_STAGE_LINKS,
  },
  {
    heading: "Browse",
    links: [
      { label: "Start a Product", href: "/collections/start-a-product" },
      { label: "All products", href: "/products" },
      { label: "Guides", href: "/guides" },
      { label: "Templates", href: "/templates" },
      { label: "Tools", href: "/tools" },
      { label: "Not sure where to start?", href: "/finder" },
      { label: "Bundles", href: "/bundles" },
      { label: "Source: A Bit Gamey", href: "/about#source" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "About Incy Templates", href: "/about" },
      { label: "Help", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Licences", href: "/legal/licences" },
      { label: "Refund policy", href: "/legal/refunds" },
    ],
  },
];
