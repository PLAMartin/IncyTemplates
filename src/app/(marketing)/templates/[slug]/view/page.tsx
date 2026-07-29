import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { serverEnv } from "@/lib/env/server";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { getProductBySlug } from "@/server/queries";
import { resolveFreeTemplateFile } from "@/server/downloads/resolve-free-template-file";
import { verifyViewGrant } from "@/server/downloads/view-grant";
import { Breadcrumbs } from "@/components/product/breadcrumbs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function TemplateViewPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const templateFile = product.files.find((f) => f.file_role === "template");
  if (product.access_type !== "free" || !templateFile) notFound();

  if (!hasServiceRoleConfig() || !serverEnv.DOWNLOAD_HASH_SECRET) {
    redirect(`/templates/${slug}`);
  }

  const cookieStore = await cookies();
  const grant = cookieStore.get(`it_view_grant_${product.id}`)?.value;
  const hasValidGrant = verifyViewGrant(grant, serverEnv.DOWNLOAD_HASH_SECRET, {
    productId: product.id,
    fileId: templateFile.id,
  });
  if (!hasValidGrant) {
    redirect(`/templates/${slug}`);
  }

  const path = `/templates/${slug}/view`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: product.name, path: `/templates/${slug}` },
    { name: "View", path },
  ];

  if (templateFile.file_format !== "markdown") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />
        <h1 className="mt-6 font-serif text-2xl font-semibold text-ink-900">Can&apos;t view this template online yet</h1>
        <p className="mt-3 text-ink-700">
          This template isn&apos;t in a format we can display on the site yet.{" "}
          <a href={`/templates/${slug}`} className="underline hover:text-ink-900">
            Back to the template
          </a>
          .
        </p>
      </div>
    );
  }

  const supabase = getSupabaseServiceRoleClient();
  const resolved = await resolveFreeTemplateFile(supabase, { productId: product.id, fileId: templateFile.id });
  if (!resolved.ok) {
    redirect(`/templates/${slug}`);
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("it-free-files")
    .download(resolved.storagePath);

  if (downloadError || !fileBlob) {
    console.error("Failed to download template file for viewing:", downloadError?.message);
    redirect(`/templates/${slug}`);
  }

  const source = await fileBlob.text();

  let renderedContent: React.ReactNode;
  try {
    const { content } = await compileMDX({
      source,
      options: { mdxOptions: { format: "md", rehypePlugins: [rehypeSlug] } },
    });
    renderedContent = content;
  } catch (err) {
    console.error("Template content failed to compile:", err);
    renderedContent = (
      <p className="text-ink-700">
        We couldn&apos;t display this template right now. Please try again shortly, or{" "}
        <a href={`/templates/${slug}`} className="underline hover:text-ink-900">
          go back to the template page
        </a>
        .
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <header className="mt-6">
        <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{product.name}</h1>
        {product.outcome_statement ? <p className="mt-3 text-lg text-ink-700">{product.outcome_statement}</p> : null}
      </header>

      <div className="guide-prose mt-8">{renderedContent}</div>

      <p className="mt-12 text-sm text-ink-500">
        <a href={`/templates/${slug}`} className="underline hover:text-ink-900">
          Back to template details
        </a>
      </p>
    </div>
  );
}
