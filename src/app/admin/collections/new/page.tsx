import type { Metadata } from "next";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata: Metadata = {
  title: "New collection — Admin",
  robots: { index: false, follow: false },
};

export default function NewAdminCollectionPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">New collection</h1>
        <p className="mt-1 text-sm text-ink-500">
          Members are added on the next screen once the collection itself is created.
        </p>
      </div>
      <CollectionForm mode="create" />
    </div>
  );
}
