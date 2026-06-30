"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/home", icon: "🏠", isActive: (p) => p === "/home" || p === "/" },
  { label: "Discover", href: "/discover", icon: "🔍", isActive: (p) => p === "/discover" },
  { label: "AI", href: "/ai", icon: "🤖", isActive: (p) => p === "/ai" },
  { label: "Library", href: "/library", icon: "📚", isActive: (p) => p === "/library" },
  { label: "You", href: "/you", icon: "👤", isActive: (p) => p === "/you" },
];

export default function SonkeBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sonke-play-settings fixed bottom-0 left-0 right-0 z-50 mx-2 mb-2 rounded-2xl lg:hidden"
      aria-label="Main navigation"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex w-full justify-around gap-1">
        {navItems.map((item) => {
          const isActive = item.isActive(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`sonke-play-setting min-w-0 flex-1 ${isActive ? "" : "sonke-play-setting-off"}`}
            >
              <span className="sonke-play-setting-icon text-base">{item.icon}</span>
              <span className="sonke-play-setting-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
