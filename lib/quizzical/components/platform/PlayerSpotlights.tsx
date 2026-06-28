"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAvatarById } from "@/lib/avatars";
import AppIcon from "@/components/icons/AppIcon";
import CountryFlag from "@/components/CountryFlag";

type Spotlight = {
  id: string;
  title: string;
  username: string;
  avatarId: string | null;
  countryCode: string;
  detail: string;
  emoji: string;
};

export default function PlayerSpotlights() {
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);

  useEffect(() => {
    fetch("/api/activity/spotlights")
      .then((r) => r.json())
      .then((d: { spotlights?: Spotlight[] }) => setSpotlights(d.spotlights ?? []))
      .catch(() => setSpotlights([]));
  }, []);

  if (spotlights.length === 0) return null;

  return (
    <section className="mt-5 md:mt-7">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-ink md:text-xl">
        <AppIcon name="trophy" size={22} className="text-grass" />
        Top players
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {spotlights.map((s) => {
          const avatar = getAvatarById(s.avatarId);
          return (
            <Link
              key={s.id}
              href={`/profile/${encodeURIComponent(s.username)}`}
              className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-white p-3 shadow-[0_3px_0_0_#0d0d0d] transition hover:bg-lime/10"
            >
              {avatar ? (
                <Image
                  src={avatar.src}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-xl border-2 border-ink object-contain p-1"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-lime/30 text-xl">
                  {s.emoji}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-grass">
                  {s.title}
                </p>
                <p className="flex items-center gap-1.5 truncate font-extrabold text-ink">
                  <CountryFlag code={s.countryCode} width={16} />
                  {s.username}
                </p>
                <p className="truncate text-xs font-bold text-ink/50">{s.detail}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
