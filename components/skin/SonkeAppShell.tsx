"use client";

import type { ReactNode } from "react";
import SonkePage from "./SonkePage";
import SonkeBottomNav from "./SonkeBottomNav";

type SonkeAppShellProps = {
  pageTitle: string;
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
};

export default function SonkeAppShell({
  pageTitle,
  children,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search quizzes…",
}: SonkeAppShellProps) {
  const searchSlot =
    onSearchChange !== undefined ? (
      <div className="sonke-search-bar-wrap">
        <label className="sr-only" htmlFor="sonke-search">
          Search
        </label>
        <input
          id="sonke-search"
          type="search"
          className="sonke-search-input"
          placeholder={searchPlaceholder}
          value={searchQuery ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    ) : null;

  return (
    <div className="sonke-pbs-shell">
      <SonkePage pageTitle={pageTitle} searchSlot={searchSlot}>
        {children}
        <div className="sonke-mobile-nav-spacer" aria-hidden="true" />
      </SonkePage>
      <SonkeBottomNav />
    </div>
  );
}
