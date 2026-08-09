"use client";

import { useRef } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { type NavLink } from "@/config/site";

export function MobileNav({ links }: { links: NavLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-ink-100"
        aria-label="Open menu"
      >
        <Menu aria-hidden className="size-6" />
      </button>

      {/* Native <dialog> gives us a focus trap, Escape-to-close and a
          backdrop for free — this is the "accessible dialog" primitive
          referenced in the spec's design-direction section. */}
      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="m-0 h-full max-h-none w-full max-w-none bg-paper p-0 backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-ink-200 p-4">
          <span className="font-serif text-lg font-semibold">Menu</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-ink-100"
            aria-label="Close menu"
          >
            <X aria-hidden className="size-6" />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
          <Link
            href="/templates?focus=search"
            onClick={() => dialogRef.current?.close()}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-base font-medium hover:bg-ink-100"
          >
            <Search aria-hidden className="size-4" />
            Search templates
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => dialogRef.current?.close()}
              className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-ink-100"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => dialogRef.current?.close()}
            className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-ink-100"
          >
            Sign in
          </Link>
          <Link
            href="/tools/product-idea-assessor"
            onClick={() => dialogRef.current?.close()}
            className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-4 text-base font-medium text-white hover:bg-brand-700"
          >
            Assess an idea
          </Link>
        </nav>
      </dialog>
    </div>
  );
}
