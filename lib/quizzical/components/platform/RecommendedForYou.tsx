"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Recommendation = {
  id: string;
  title: string;
  href: string;
  emoji: string;
  reason: string;
  kind: string;
};

export default function RecommendedForYou() {
  const { isSignedIn } = useUser();
  const [items, setItems] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      setItems([]);
      return;
    }
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((d: { recommendations?: Recommendation[] }) =>
        setItems(d.recommendations ?? []),
      )
      .catch(() => setItems([]));
  }, [isSignedIn]);

  if (!isSignedIn || items.length === 0) return null;

  return (
    <section className="mt-5 md:mt-7">
      <h2 className="mb-3 text-lg font-black text-ink md:text-xl">
        Recommended for you
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 transition-colors hover:border-ink hover:bg-lime/10"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold text-ink">{item.title}</p>
                <p className="truncate text-xs font-bold text-ink/50">
                  {item.reason}
                </p>
              </div>
              <span className="text-sm font-extrabold text-grass">Play →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
