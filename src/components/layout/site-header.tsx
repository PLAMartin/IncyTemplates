import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { primaryNav, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-paper-raised">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900">
          <Image
            src="/logo/incy-templates-logo.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
          {site.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/templates?focus=search"
            aria-label="Search templates"
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-ink-100 lg:flex"
          >
            <Search aria-hidden className="size-5" />
          </Link>
          <Link
            href="/account"
            className="hidden text-sm font-medium text-ink-700 hover:text-ink-900 lg:block"
          >
            Sign in
          </Link>
          <ButtonLink href="/tools/product-idea-assessor" className="hidden lg:inline-flex">
            Assess an idea
          </ButtonLink>
          <MobileNav links={primaryNav} />
        </div>
      </div>
    </header>
  );
}
