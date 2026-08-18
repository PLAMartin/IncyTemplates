import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { requireCustomerSession } from "@/server/auth/customer-dal";
import { signOutCustomer } from "@/server/actions/customer-auth";

/**
 * Every `/account` route is session-gated and must never be statically prerendered — same
 * reasoning as `src/app/admin/layout.tsx`'s identical directive, see its doc comment.
 */
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/account/library", label: "Library" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/work", label: "Work" },
];

/**
 * Every route under /account is gated by requireCustomerSession() — any signed-in user, no role
 * check (unlike /admin's requireStaffSession()). Reuses SiteHeader/SiteFooter for visual
 * continuity with the public site, unlike admin's own bespoke chrome — this is a customer-facing
 * area, not an internal tool.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerSession();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:flex-row sm:px-6">
          <nav aria-label="Account sections" className="w-full shrink-0 sm:w-48">
            <p className="mb-3 truncate text-sm text-ink-500">{session.email}</p>
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
            <form action={signOutCustomer} className="mt-4">
              <button
                type="submit"
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              >
                Sign out
              </button>
            </form>
          </nav>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
