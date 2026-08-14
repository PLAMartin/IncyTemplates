import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : undefined;

const connectSrc = ["'self'", supabaseHost ? `https://${supabaseHost}` : undefined]
  .filter(Boolean)
  .join(" ");

const imgSrc = ["'self'", "data:", supabaseHost ? `https://${supabaseHost}` : undefined]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${imgSrc}`,
  `font-src 'self'`,
  `connect-src ${connectSrc} https://*.google-analytics.com https://www.googletagmanager.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
]
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // v3: the Copy-Improve-Differentiate method page (formerly "Proven-Better-New") is
      // retired in favour of the Product Idea Assessor guide, which its prose was migrated
      // into (content/guides/product-idea-assessor.mdx). Permanent redirect so any existing
      // internal/external links to the old URL keep working (spec v3 §26.3's slug-redirect
      // requirement) — the `source` path below is the legacy URL and must stay unchanged.
      {
        source: "/methods/proven-better-new",
        destination: "/guides/product-idea-assessor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
