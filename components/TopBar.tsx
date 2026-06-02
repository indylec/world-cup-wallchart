"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TimezoneSelector } from "./TimezoneSelector";

const TABS = [
  { href: "/", label: "Wallchart" },
  { href: "/calendar", label: "Calendar" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 bg-[color:var(--color-paper)]/85 backdrop-blur-sm border-b-2 border-[color:var(--color-ink)] no-print">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="heading-block text-xs tracking-[0.22em] text-[color:var(--color-ink)] hover:text-[color:var(--color-red)] transition-colors">
          WC<span className="text-[color:var(--color-red)]">·</span>26
        </Link>

        <nav className="flex items-center gap-6">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`heading-block text-xs tracking-[0.18em] pb-1 transition-colors ${
                  active
                    ? "text-[color:var(--color-navy)] border-b-2 border-[color:var(--color-red)]"
                    : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-navy)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <TimezoneSelector />
      </div>
    </div>
  );
}
