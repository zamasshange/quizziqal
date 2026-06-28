"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getAvatarById } from "@/lib/avatars";
import CountryFlag from "@/components/CountryFlag";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

type FeedEvent = {
  id: number;
  username: string;
  avatarId: string | null;
  countryCode: string;
  message: string;
  emoji: string | null;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/activity/feed?limit=12");
      const data = (await res.json()) as { events?: FeedEvent[] };
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const poll = setInterval(() => void refresh(), 20000);

    const sb = getSupabaseBrowser();
    if (!sb) return () => clearInterval(poll);

    const channel = sb
      .channel("activity_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_events" },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      void sb.removeChannel(channel);
    };
  }, [refresh]);

  if (events.length === 0) return null;

  return (
    <section className="mt-5 md:mt-7">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-ink md:text-xl">Live community</h2>
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-grass">
          <span className="h-2 w-2 animate-pulse rounded-full bg-grass" />
          Live
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {events.map((e) => {
          const avatar = getAvatarById(e.avatarId);
          return (
            <li
              key={e.id}
              className="flex items-center gap-2.5 rounded-xl border-2 border-ink/10 bg-white/90 px-3 py-2"
            >
              {avatar ? (
                <Image
                  src={avatar.src}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-lg border border-ink/20 object-contain p-0.5"
                />
              ) : (
                <span className="text-lg" aria-hidden>
                  {e.emoji ?? "✨"}
                </span>
              )}
              <p className="min-w-0 flex-1 text-sm font-bold text-ink/80">
                {e.message}
              </p>
              <CountryFlag code={e.countryCode} width={16} />
              <span className="shrink-0 text-[10px] font-bold text-ink/40">
                {timeAgo(e.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
