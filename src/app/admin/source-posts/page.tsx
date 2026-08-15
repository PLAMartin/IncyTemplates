import type { Metadata } from "next";
import { listSourcePostsForAdmin } from "@/server/admin/source-posts";
import { SourcePostQueue } from "@/components/admin/source-posts/source-post-queue";

export const metadata: Metadata = {
  title: "Source posts — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSourcePostsPage() {
  const posts = await listSourcePostsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Source posts</h1>
        <p className="mt-1 text-ink-500">
          {posts.length} A Bit Gamey post{posts.length === 1 ? "" : "s"} with a Reuse Taxonomy v1 assessment.
          Suggested uses and framework mappings are advisory — accept, adjust or dismiss them from a post&apos;s
          review page. Nothing here publishes a Guide, Template or Tool automatically.
        </p>
      </div>
      <SourcePostQueue posts={posts} />
    </div>
  );
}
