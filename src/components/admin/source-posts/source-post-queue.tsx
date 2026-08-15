"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { AdminSourcePostRow } from "@/server/admin/source-posts";

const STATUS_LABELS: Record<string, string> = {
  unreviewed: "Unreviewed",
  accepted: "Accepted",
  adjusted: "Adjusted",
  dismissed: "Dismissed",
};

const STATUS_STYLES: Record<string, string> = {
  unreviewed: "bg-ink-100 text-ink-700",
  accepted: "bg-brand-100 text-brand-700",
  adjusted: "bg-amber-100 text-amber-700",
  dismissed: "bg-ink-100 text-ink-500",
};

const USE_STYLES: Record<string, string> = {
  source_only: "bg-ink-100 text-ink-700",
  guide: "bg-blue-100 text-blue-700",
  template: "bg-amber-100 text-amber-700",
  tool: "bg-brand-100 text-brand-700",
};

function scoreBandClassName(score: number): string {
  if (score >= 9) return "bg-brand-100 text-brand-700";
  if (score >= 7) return "bg-amber-100 text-amber-700";
  if (score >= 5) return "bg-blue-100 text-blue-700";
  return "bg-ink-100 text-ink-500";
}

export function SourcePostQueue({ posts }: { posts: AdminSourcePostRow[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [useType, setUseType] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.sourceCategory).filter((c): c is string => Boolean(c)))).sort(),
    [posts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (q && !post.title.toLowerCase().includes(q)) return false;
      if (category !== "all" && post.sourceCategory !== category) return false;
      if (status !== "all" && (post.review?.status ?? "unreviewed") !== status) return false;
      if (useType !== "all" && !(post.latestAssessment?.suggestedUses ?? []).includes(useType)) return false;
      return true;
    });
  }, [posts, search, category, status, useType]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          Search title
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-56" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          Category
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto min-w-40">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          Review status
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-40">
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          Suggested use
          <Select value={useType} onChange={(e) => setUseType(e.target.value)} className="w-auto min-w-40">
            <option value="all">All uses</option>
            <option value="source_only">Source-only</option>
            <option value="guide">Guide</option>
            <option value="template">Template</option>
            <option value="tool">Tool</option>
          </Select>
        </label>
        <span className="text-sm text-ink-500">
          {filtered.length} of {posts.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Title
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Suggested uses
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Score
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Frameworks
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/source-posts/review/${post.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-700">{post.sourceCategory ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(post.latestAssessment?.suggestedUses ?? []).map((use) => (
                      <span key={use} className={`rounded-full px-2 py-0.5 text-xs font-medium ${USE_STYLES[use] ?? "bg-ink-100"}`}>
                        {use.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {post.latestAssessment ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreBandClassName(post.latestAssessment.reuseScore)}`}
                    >
                      {post.latestAssessment.reuseScore}/10
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-ink-700">{post.frameworkLinkCount || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[post.review?.status ?? "unreviewed"]
                    }`}
                  >
                    {STATUS_LABELS[post.review?.status ?? "unreviewed"]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
