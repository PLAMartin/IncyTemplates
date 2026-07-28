import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { guideFrontmatterSchema } from "./schema";
import type { Guide } from "@/types/catalogue";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

function readGuideFile(filename: string): Guide {
  const filePath = path.join(GUIDES_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const parsed = guideFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`).join("\n");
    // Spec §23.2/build-plan: malformed guide front matter is a build-time
    // error, not a silently skipped file.
    throw new Error(`Invalid guide front matter in content/guides/${filename}:\n${issues}`);
  }

  const stats = readingTime(content);

  return {
    ...parsed.data,
    readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
    content: content.trim(),
  };
}

// Module-level cache: guide files don't change within a running process
// (they're only edited by redeploying), so re-parsing on every call would
// be wasted filesystem + Zod work across a single request or build.
let cachedGuides: Guide[] | null = null;

function loadAllGuideFiles(): Guide[] {
  if (cachedGuides) return cachedGuides;
  if (!fs.existsSync(GUIDES_DIR)) {
    cachedGuides = [];
    return cachedGuides;
  }
  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".mdx"));
  cachedGuides = files.map(readGuideFile);
  return cachedGuides;
}

/** Published guides only, newest first — matches the visibility rule the catalogue source applies to products. */
export async function getAllGuides(): Promise<Guide[]> {
  return loadAllGuideFiles()
    .filter((guide) => guide.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const guide = loadAllGuideFiles().find((g) => g.slug === slug && g.status === "published");
  return guide ?? null;
}
