"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeCategoryShortcut() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <Link
      href="/#browse-categories"
      className="flex h-9 shrink-0 items-center rounded-full border-2 border-ink/15 px-3 text-xs font-extrabold text-ink/75 transition-colors hover:border-ink/30 hover:text-ink md:hidden"
    >
      Categories
    </Link>
  );
}
