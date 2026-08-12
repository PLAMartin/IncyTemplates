import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      {error === "insufficient-role" ? (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Your account doesn&apos;t have permission for that action.
        </p>
      ) : null}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-ink-500">Editorial and catalogue administration for Incy Templates.</p>
      </div>
    </div>
  );
}
