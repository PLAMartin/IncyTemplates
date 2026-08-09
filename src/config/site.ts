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

// Spec v3 §8.1's recommended 6-item primary nav. "Free templates" and "Bundles" drop out
// of the primary row (still reachable via /templates/free, /bundles and the footer) to make
// room for the new Products/Tools entries without crowding the header.
export const primaryNav: NavLink[] = [
  { label: "Products", href: "/products" },
  { label: "Guides", href: "/guides" },
  { label: "Templates", href: "/templates" },
  { label: "Tools", href: "/tools" },
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
      { label: "All products", href: "/products" },
      { label: "Guides", href: "/guides" },
      { label: "Templates", href: "/templates" },
      { label: "Tools", href: "/tools" },
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
