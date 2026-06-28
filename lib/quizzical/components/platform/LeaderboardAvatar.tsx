"use client";

import Image from "next/image";
import { getAvatarById } from "@/lib/avatars";
import CountryFlag from "@/components/CountryFlag";

export default function LeaderboardAvatar({
  avatarId,
  username,
  size = 40,
}: {
  avatarId: string | null;
  username: string;
  size?: number;
}) {
  const avatar = getAvatarById(avatarId);
  if (avatar) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-cream"
        style={{ width: size, height: size }}
      >
        <Image
          src={avatar.src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain p-0.5"
        />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-lime/40 font-display text-sm font-black text-ink"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export function LeaderboardIdentity({
  username,
  avatarId,
  countryCode,
  countryName,
}: {
  username: string;
  avatarId: string | null;
  countryCode: string;
  countryName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <LeaderboardAvatar avatarId={avatarId} username={username} size={36} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate font-extrabold text-ink">
          <CountryFlag code={countryCode} width={18} />
          {username}
        </p>
        {countryName && (
          <p className="truncate text-[10px] font-bold text-ink/45">
            {countryName}
          </p>
        )}
      </div>
    </div>
  );
}
