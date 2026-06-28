"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/discover", icon: HomeIcon },
  { label: "Discover", href: "/discover", icon: DiscoverIcon },
  { label: "Library", href: "/discover", icon: LibraryIcon },
  { label: "Reports", href: "/discover", icon: ReportsIcon },
  { label: "Groups", href: "/discover", icon: GroupsIcon },
  { label: "Marketplace", href: "/discover", icon: MarketplaceIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full w-[56px] flex-col items-center py-3 lg:w-[220px] lg:items-stretch lg:px-3 lg:py-4"
      style={{ background: "var(--kahoot-sidebar)" }}
    >
      <Link
        href="/discover"
        className="mb-4 flex items-center justify-center lg:mb-6 lg:justify-start lg:px-3"
      >
        <KahootLogo />
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 lg:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href && item.label === "Discover";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-center gap-3 rounded-lg p-2.5 text-sm font-semibold text-white transition-colors lg:justify-start lg:px-3 lg:py-2.5 ${
                isActive
                  ? "bg-white/20"
                  : "active:bg-[var(--kahoot-sidebar-hover)] lg:hover:bg-[var(--kahoot-sidebar-hover)]"
              }`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function KahootLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="lg:hidden">
        <circle cx="20" cy="20" r="20" fill="white" />
        <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="800" fill="#46178f">
          K
        </text>
      </svg>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="hidden lg:block">
        <circle cx="20" cy="20" r="20" fill="white" />
        <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="800" fill="#46178f">
          K
        </text>
      </svg>
      <span className="hidden text-xl font-extrabold text-white lg:inline">Kahoot!</span>
    </div>
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

function ReportsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  );
}

function GroupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function MarketplaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
