"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { quizzes, getCategory } from "@/lib/quizzes";
import { getExcluded, playHistoryKey, recordSeen } from "@/lib/playHistory";
import { SearchIcon } from "./icons";

export default function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(Boolean(urlQuery));
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return quizzes
      .filter((quiz) => {
        const cat = getCategory(quiz.category)?.name ?? "";
        return (
          quiz.title.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [query]);

  function surpriseMe() {
    const key = playHistoryKey("surprise");
    const excluded = new Set(getExcluded(key).ids);
    const pool = quizzes.filter((q) => !excluded.has(q.id));
    const pick = (pool.length > 0 ? pool : quizzes)[
      Math.floor(Math.random() * (pool.length > 0 ? pool.length : quizzes.length))
    ];
    recordSeen(key, { ids: [pick.id] });
    router.push(`/quiz/${pick.id}/play`);
  }

  return (
    <div className="flex flex-row items-stretch gap-2">
      <div className="relative min-w-0 flex-1">
        <div className="flex h-full items-center gap-1.5 rounded-full border-[3px] border-ink bg-white px-3 py-2 shadow-[0_3px_0_0_#0d0d0d] sm:gap-2 sm:border-4 sm:px-4 sm:py-3 sm:shadow-[0_4px_0_0_#0d0d0d]">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink/60 sm:h-5 sm:w-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 120);
            }}
            placeholder="Search quizzes…"
            className="w-full min-w-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/40 sm:text-base"
            aria-label="Search quizzes"
          />
        </div>

        {open && results.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]"
            onMouseDown={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
            }}
          >
            {results.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-black/5"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink text-lg"
                    style={{ backgroundColor: quiz.color }}
                  >
                    {quiz.emoji}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-extrabold text-ink">
                      {quiz.title}
                    </span>
                    <span className="truncate text-xs font-bold text-ink/45">
                      {getCategory(quiz.category)?.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {open && query.trim() && results.length === 0 && (
          <div
            className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border-4 border-ink bg-white px-4 py-3 text-sm font-bold text-ink/50 shadow-[0_6px_0_0_#0d0d0d]"
            onMouseDown={(e) => e.preventDefault()}
          >
            No quizzes match “{query.trim()}”.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={surpriseMe}
        className="group relative shrink-0 select-none outline-none"
        aria-label="Surprise me — play a random quiz"
      >
        <span className="absolute inset-0 rounded-full bg-ink" aria-hidden />
        <span className="relative z-10 flex h-full -translate-y-0.5 items-center rounded-full border-[3px] border-ink bg-lime px-3 py-2 text-xs font-extrabold tracking-wide text-ink transition-transform duration-75 group-hover:-translate-y-1 group-active:translate-y-0 sm:-translate-y-1 sm:border-4 sm:px-6 sm:py-2.5 sm:text-base group-hover:sm:-translate-y-1.5">
          <span className="sm:hidden" aria-hidden>🎲</span>
          <span className="hidden sm:inline">🎲 Surprise me</span>
        </span>
      </button>
    </div>
  );
}
