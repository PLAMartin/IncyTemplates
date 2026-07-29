import GithubSlugger from "github-slugger";

export type TocEntry = {
  depth: 2 | 3;
  text: string;
  id: string;
};

/**
 * Extract a table of contents from raw MDX/Markdown by scanning `##`/`###`
 * heading lines. Uses `github-slugger` (the same library `rehype-slug`
 * uses internally to add `id` attributes to rendered headings) so the
 * anchors generated here match the ids the rendered page actually gets —
 * see `MDXRemote`'s `rehypePlugins: [rehypeSlug]` in the guide detail page.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const depth = match[1]!.length as 2 | 3;
    const text = match[2]!.trim();
    entries.push({ depth, text, id: slugger.slug(text) });
  }

  return entries;
}
