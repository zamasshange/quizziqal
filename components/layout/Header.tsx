"use client";

import Link from "next/link";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white lg:h-16">
      {/* Mobile header — full width, logo + search + actions */}
      <div className="flex flex-col gap-2 px-3 py-2.5 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#46178f" />
              <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="800" fill="white">
                Q
              </text>
            </svg>
            <span className="text-base font-extrabold text-[var(--kahoot-purple)]">
              Quizziqal
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/ai"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--kahoot-purple)] text-white shadow-md"
              aria-label="Create AI quiz"
            >
              <PlusIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/you"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--kahoot-purple)] text-xs font-bold text-white"
              aria-label="Your profile"
            >
              G
            </Link>
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--kahoot-purple)] focus:bg-white"
          />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden h-16 items-center gap-4 px-4 lg:flex lg:px-8">
        <div className="relative flex-1 max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for quizzes, creators, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm outline-none transition-colors focus:border-[var(--kahoot-purple)] focus:bg-white"
          />
        </div>

        <Link
          href="/ai"
          className="flex items-center gap-2 rounded-full bg-[var(--kahoot-purple)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--kahoot-purple-dark)]"
        >
          <PlusIcon className="h-5 w-5" />
          Create
        </Link>

        <Link
          href="/you"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--kahoot-purple)] text-sm font-bold text-white"
        >
          G
        </Link>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
