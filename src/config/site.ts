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
  tagline: "Practical, field-tested templates that help founders make the next important decision.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://incytemplates.com",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Templates", href: "/templates" },
  { label: "Free templates", href: "/templates/free" },
  { label: "Bundles", href: "/bundles" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Templates",
    links: [
      { label: "All templates", href: "/templates" },
      { label: "Free templates", href: "/templates/free" },
      { label: "Bundles", href: "/bundles" },
      { label: "Categories", href: "/templates/categories" },
      { label: "Journey stages", href: "/templates/stages" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Proven–Better–New method", href: "/methods/proven-better-new" },
      { label: "About Incy Templates", href: "/about" },
    ],
  },
  {
    heading: "Support",
    links: [
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
