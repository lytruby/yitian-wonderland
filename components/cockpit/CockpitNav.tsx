"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/tools/today-compass", label: "Compass" },
  { href: "/cards", label: "Cards" },
  { href: "/routine", label: "Routine" },
  { href: "/history", label: "History" },
];

export function CockpitNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Personal cockpit"
      className="flex gap-2 overflow-x-auto border-y border-ink/10 py-3"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-ink text-paper"
                : "text-muted hover:bg-white/50 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
