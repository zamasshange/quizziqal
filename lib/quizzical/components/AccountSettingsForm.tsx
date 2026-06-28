"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { playClick } from "@/lib/sound";
import { AVATARS } from "@/lib/avatars";
import { useProgression } from "@/lib/progression/client";
import { updateAccountProfile } from "@/lib/actions/account";
import CountryPicker from "@/components/CountryPicker";

export default function AccountSettingsForm() {
  const { user, isLoaded } = useUser();
  const { state, loaded: progressionLoaded } = useProgression();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("US");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || hydrated) return;

    const metaUsername =
      (user.publicMetadata?.username as string | undefined) ??
      user.username ??
      "";
    const metaAvatar =
      (user.publicMetadata?.avatarId as string | undefined) ?? null;

    setUsername(metaUsername);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setSelectedId(metaAvatar);
    setHydrated(true);
  }, [isLoaded, user, hydrated]);

  useEffect(() => {
    if (progressionLoaded && state.countryCode) {
      setCountryCode(state.countryCode);
    }
  }, [progressionLoaded, state.countryCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || isSaving) return;

    playClick();
    setError(null);
    setSaved(false);
    setIsSaving(true);

    const result = await updateAccountProfile({
      username,
      firstName,
      lastName,
      avatarId: selectedId,
      countryCode,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSaved(true);
    await user?.reload();
  }

  const trimmed = username.trim().toLowerCase();
  const usernameValid = /^[a-z0-9_]{3,20}$/.test(trimmed);
  const nameValid = firstName.trim().length > 0;
  const canSubmit =
    usernameValid && nameValid && selectedId && !isSaving && hydrated;

  if (!isLoaded || !hydrated) {
    return (
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-3xl border-4 border-ink bg-white p-8 shadow-[0_6px_0_0_#0d0d0d]">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-ink/10" />
        <div className="h-12 animate-pulse rounded-xl bg-ink/10" />
        <div className="h-12 animate-pulse rounded-xl bg-ink/10" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border-4 border-ink bg-white p-6 shadow-[0_6px_0_0_#0d0d0d] md:p-8"
    >
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold">Manage account</h1>
        <p className="mt-1 font-semibold text-ink/60">
          Update your username, name, avatar, and country.
        </p>
      </div>

      {user?.primaryEmailAddress && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-extrabold text-ink">Email</span>
          <p className="rounded-xl border-4 border-ink/10 bg-cream/50 px-4 py-3 text-sm font-bold text-ink/60">
            {user.primaryEmailAddress.emailAddress}
          </p>
          <p className="text-xs font-semibold text-ink/45">
            Email is managed through your sign-in provider.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-extrabold text-ink">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={50}
            disabled={isSaving}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-3 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm font-extrabold text-ink">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            maxLength={50}
            disabled={isSaving}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-3 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-extrabold text-ink">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={20}
          disabled={isSaving}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. quiz_master"
          className="rounded-xl border-4 border-ink/20 bg-cream px-4 py-3 font-bold text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none disabled:opacity-60"
        />
        <p className="text-xs font-semibold text-ink/50">
          3–20 characters · letters, numbers, underscores
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-extrabold text-ink">Country</span>
        <CountryPicker
          value={countryCode}
          onChange={setCountryCode}
          disabled={isSaving}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-extrabold text-ink">Avatar</span>
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
      </div>

      {error && (
        <p className="text-center text-sm font-bold text-answer1" role="alert">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-center text-sm font-bold text-grass" role="status">
          Profile saved!
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-full border-4 border-ink bg-grass px-6 py-3 font-display text-lg font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
