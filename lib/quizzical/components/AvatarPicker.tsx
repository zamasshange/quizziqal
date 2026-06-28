"use client";

import Image from "next/image";
import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { playClick } from "@/lib/sound";
import { AVATARS } from "@/lib/avatars";
import { saveAvatarSelection } from "@/lib/actions/avatar";

export default function AvatarPicker() {
  const { user } = useUser();
  const { session } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!selectedId || isSaving) return;

    playClick();
    setError(null);
    setIsSaving(true);

    try {
      await saveAvatarSelection(selectedId);
      await session?.reload();
      await user?.reload();
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border-4 border-ink bg-white p-6 shadow-[0_6px_0_0_#0d0d0d] md:p-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold">
          Pick your profile picture
        </h1>
        <p className="mt-1 font-semibold text-ink/60">
          Choose a quiz mascot — you can always change it later.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
        {AVATARS.map((avatar) => {
          const isSelected = selectedId === avatar.id;

          return (
            <button
              key={avatar.id}
              type="button"
              aria-label={avatar.label}
              aria-pressed={isSelected}
              disabled={isSaving}
              onClick={() => {
                playClick();
                setSelectedId(avatar.id);
              }}
              className={`group flex flex-col items-center gap-1.5 rounded-2xl border-4 bg-cream p-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:p-2.5 ${
                isSelected
                  ? "border-ink ring-4 ring-ink ring-offset-2"
                  : "border-ink/20 hover:border-ink/50"
              }`}
            >
              <Image
                src={avatar.src}
                alt={avatar.label}
                width={72}
                height={72}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
              <span className="line-clamp-1 text-[10px] font-extrabold text-ink/70 sm:text-xs">
                {avatar.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-center text-sm font-bold text-answer1" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!selectedId || isSaving}
        onClick={() => void handleSubmit()}
        className="rounded-full border-4 border-ink bg-grass px-6 py-3 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSaving ? "Saving…" : "Let's go!"}
      </button>
    </div>
  );
}
