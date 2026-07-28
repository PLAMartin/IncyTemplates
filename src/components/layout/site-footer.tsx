import Link from "next/link";
import { company, footerNav, site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-paper-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerNav.map((group) => (
            <div key={group.heading}>
              <h2 className="text-sm font-semibold text-ink-900">{group.heading}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-500 hover:text-ink-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-ink-200 pt-6 text-xs text-ink-500">
          <p>
            {company.legalName} · {company.country} · {" "}
            <a href={`mailto:${company.supportEmail}`} className="hover:text-ink-900">
              {company.supportEmail}
            </a>
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
