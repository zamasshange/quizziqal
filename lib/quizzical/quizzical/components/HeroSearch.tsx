"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { quizzes, getCategory } from "@/lib/quizzes";
import { getExcluded, playHistoryKey, recordSeen } from "@/lib/playHistory";
import { SearchIcon } from "./icons";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
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
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <div className="flex items-center gap-2 rounded-full border-4 border-ink bg-white px-4 py-3 shadow-[0_4px_0_0_#0d0d0d]">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 120);
            }}
            placeholder="Search quizzes…"
            className="w-full bg-transparent text-base font-bold text-ink outline-none placeholder:text-ink/40"
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
      >
        <span className="absolute inset-0 rounded-full bg-ink" aria-hidden />
        <span className="relative z-10 block -translate-y-1 rounded-full border-4 border-ink bg-lime px-6 py-2.5 font-extrabold tracking-wide text-ink transition-transform duration-75 group-hover:-translate-y-1.5 group-active:translate-y-0">
          🎲 Surprise me
        </span>
      </button>
    </div>
  );
}
