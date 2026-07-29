import type { MetadataRoute } from "next";
import { serverEnv } from "@/lib/env/server";
import { site } from "@/config/site";

/** Spec §33.4: preview/dev deployments must not be indexed — only APP_ENV=production allows crawling. */
export default function robots(): MetadataRoute.Robots {
  const isProduction = serverEnv.APP_ENV === "production";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
