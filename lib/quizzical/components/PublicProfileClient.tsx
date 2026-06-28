"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatarById } from "@/lib/avatars";
import CountryFlag from "@/components/CountryFlag";
import AppIcon from "@/components/icons/AppIcon";

type PublicProfile = {
  username: string;
  avatarId: string | null;
  xp: number;
  coins: number;
  level: number;
  title: string;
  countryCode: string;
  countryName: string;
  streak: number;
  achievementsCount: number;
  discoveriesCount: number;
};

export default function PublicProfileClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/progression/profile/${encodeURIComponent(username)}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Player not found.");
        }
        return r.json() as Promise<PublicProfile>;
      })
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-2xl bg-cream-dark" />
        <div className="h-32 rounded-2xl bg-cream-dark" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border-4 border-dashed border-ink/20 p-10 text-center">
        <p className="font-extrabold text-ink/60">{error ?? "Player not found."}</p>
        <Link
          href="/leaderboard"
          className="mt-4 inline-block font-extrabold text-grass underline"
        >
          Back to leaderboard
        </Link>
      </div>
    );
  }

  const avatar = getAvatarById(profile.avatarId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-4">
      <div className="flex flex-wrap items-start gap-4 rounded-2xl border-4 border-ink bg-white p-6 shadow-[0_4px_0_0_#0d0d0d]">
        {avatar ? (
          <Image
            src={avatar.src}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 rounded-2xl border-4 border-ink object-contain p-2"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-ink bg-lime/30 font-display text-3xl font-black">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl font-black text-ink">
            {profile.username}
          </h1>
          <p className="font-extrabold text-grass">
            Level {profile.level} · {profile.title}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-ink/60">
            <CountryFlag code={profile.countryCode} width={22} />
            {profile.countryName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "XP", value: profile.xp.toLocaleString(), icon: "star" as const },
          { label: "Coins", value: profile.coins.toLocaleString(), icon: "cookie" as const },
          {
            label: "Achievements",
            value: String(profile.achievementsCount),
            icon: "trophy" as const,
          },
          {
            label: "Discoveries",
            value: String(profile.discoveriesCount),
            icon: "telescope" as const,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border-[3px] border-ink bg-cream px-3 py-4 text-center shadow-[0_3px_0_0_#0d0d0d]"
          >
            <AppIcon name={stat.icon} size={20} className="mx-auto text-grass" />
            <p className="mt-1 font-display text-2xl font-black text-ink">
              {stat.value}
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink/45">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-[3px] border-ink bg-lime/20 px-4 py-3 text-center">
        <p className="text-sm font-extrabold text-ink">
          🔥 {profile.streak} day streak
        </p>
      </div>

      <Link
        href="/leaderboard"
        className="text-center text-sm font-extrabold text-grass underline"
      >
        View leaderboard
      </Link>
    </div>
  );
}
