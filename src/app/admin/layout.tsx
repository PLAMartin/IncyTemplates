import Link from "next/link";
import { site } from "@/config/site";
import { requireStaffSession } from "@/server/auth/dal";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/frameworks", label: "Frameworks" },
  { href: "/admin/products", label: "Products & visibility" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/visuals", label: "Visuals" },
  { href: "/admin/visual-recipes", label: "Visual recipes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/webhook-events", label: "Webhook queue" },
  { href: "/admin/audit-log", label: "Audit log" },
];

/**
 * Every route under `/admin` goes through this layout, and every route
 * under this layout is gated by `requireStaffSession()` — the secure check
 * (reads `it_profiles.role` from the database), not `src/proxy.ts`'s
 * optimistic cookie check. Individual pages/actions layer stricter
 * `requireRole()` checks on top where the spec's role matrix calls for it
 * (e.g. visibility changes require 'admin', not just any staff role).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-200 bg-paper-raised">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="font-serif text-lg font-semibold text-ink-900">
            {site.name} admin
          </Link>
          <div className="flex items-center gap-4 text-sm text-ink-500">
            <span>
              {session.email} · <span className="capitalize">{session.role}</span>
            </span>
            <Link href="/" className="text-brand-600 hover:text-brand-700">
              View site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <nav aria-label="Admin sections" className="w-48 shrink-0">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
