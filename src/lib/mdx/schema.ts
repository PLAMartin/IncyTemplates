import { z } from "zod";

/**
 * Zod schema for guide front matter (spec §23.2). Mirrors `GuideFrontmatter`
 * in `src/types/catalogue.ts` field-for-field — keep the two in sync.
 */
export const guideFrontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z
    .string()
    .min(1, "slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase and URL-safe, e.g. 'test-a-product-idea'"),
  summary: z.string().min(1, "summary is required"),
  author: z.string().min(1, "author is required"),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "publishedAt must be an ISO date, e.g. '2026-07-10'"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "updatedAt must be an ISO date, e.g. '2026-07-10'"),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  relatedProducts: z.array(z.string()).optional(),
});

export type GuideFrontmatterInput = z.infer<typeof guideFrontmatterSchema>;
