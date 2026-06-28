"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/discover", icon: HomeIcon, match: "home" },
  { label: "Discover", href: "/discover", icon: DiscoverIcon, match: "discover" },
  { label: "Library", href: "/discover", icon: LibraryIcon, match: "library" },
  { label: "You", href: "/discover", icon: ProfileIcon, match: "profile" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isDiscover = pathname === "/discover" || pathname.startsWith("/discover");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden"
      style={{
        background: "linear-gradient(180deg, rgba(51,52,142,0.97) 0%, rgba(42,10,94,0.98) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.match === "discover" ? isDiscover : false;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${
                isActive ? "text-white" : "text-white/55 active:text-white/80"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  isActive ? "bg-white/20 scale-110" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function DiscoverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
