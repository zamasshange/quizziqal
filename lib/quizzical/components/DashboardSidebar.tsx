"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/dashboard", emoji: "📊", exact: true },
  {
    label: "Image Questions Manager",
    href: "/dashboard/image-questions",
    emoji: "🖼️",
    exact: false,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="md:w-64 md:shrink-0">
      <div className="flex flex-col gap-4 border-b-4 border-ink bg-white p-4 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Quizzical home"
        >
          <Image
            src="/logo.png"
            alt="Quizzical"
            width={48}
            height={48}
            className="h-11 w-11 object-contain"
          />
          <span className="font-display text-lg font-extrabold">Quizzical</span>
        </Link>
        <span className="rounded-full border-2 border-ink bg-lime px-3 py-0.5 text-center text-xs font-extrabold uppercase tracking-wide">
          Admin dashboard
        </span>

        <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-transparent text-ink/70 hover:bg-black/5 hover:text-ink"
                }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mt-auto hidden text-sm font-bold text-ink/50 hover:text-ink md:block"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
