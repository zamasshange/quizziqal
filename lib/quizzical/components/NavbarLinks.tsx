"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show } from "@clerk/nextjs";

const PUBLIC_LINKS = [
  { label: "Browse", href: "/" },
  { label: "Pictures", href: "/#picture-games" },
  { label: "Ranks", href: "/leaderboard" },
] as const;

const MEMBER_LINKS = [
  { label: "Atlas", href: "/knowledge-atlas" },
  { label: "Hall of Fame", shortLabel: "Hall", href: "/hall-of-fame" },
] as const;

function NavLink({
  href,
  label,
  shortLabel,
  active,
}: {
  href: string;
  label: string;
  shortLabel?: string;
  active: boolean;
}) {
  const className = `rounded-full px-2.5 py-1.5 text-xs font-extrabold transition-colors hover:bg-black/5 hover:text-ink md:px-3 md:text-sm ${
    active ? "text-ink" : "text-ink/65"
  }`;

  return (
    <Link href={href} className={className}>
      {shortLabel ? (
        <>
          <span className="xl:hidden">{shortLabel}</span>
          <span className="hidden xl:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </Link>
  );
}

export default function NavbarLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <ul className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 sm:flex md:gap-1">
      {PUBLIC_LINKS.map((link) => (
        <li key={link.href}>
          <NavLink href={link.href} label={link.label} active={isActive(link.href)} />
        </li>
      ))}

      <Show when="signed-in">
        <li aria-hidden className="mx-0.5 hidden h-4 w-px bg-ink/15 sm:block" />
        {MEMBER_LINKS.map((link) => (
          <li key={link.href}>
            <NavLink
              href={link.href}
              label={link.label}
              shortLabel={"shortLabel" in link ? link.shortLabel : undefined}
              active={isActive(link.href)}
            />
          </li>
        ))}
      </Show>

      <Show when="signed-out">
        <li aria-hidden className="mx-0.5 hidden h-4 w-px bg-ink/15 sm:block" />
        <li>
          <NavLink href="/signup" label="Sign up" active={false} />
        </li>
      </Show>
    </ul>
  );
}
