import Link from "next/link";
import { site } from "@/config/site";

/**
 * Minimal shell for routes outside the `(marketing)` group (`/admin`,
 * `/sign-in`) — no full header/footer nav (these are stub pages with no
 * real destinations to link to yet), but still a landmark `<main
 * id="main-content">` for the root layout's skip link, and a way back home.
 */
export function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-ink-200 bg-paper-raised">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="font-serif text-lg font-semibold text-ink-900">
            {site.name}
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
