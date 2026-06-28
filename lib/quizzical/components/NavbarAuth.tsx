"use client";

import Image from "next/image";
import Link from "next/link";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { AccountIcon } from "./icons";
import { getAvatarSrc } from "@/lib/avatars";

function SettingsMenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function QuizzicalUserButton({
  appearance,
}: {
  appearance?: React.ComponentProps<typeof UserButton>["appearance"];
}) {
  return (
    <UserButton appearance={appearance}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Manage account"
          href="/account"
          labelIcon={<SettingsMenuIcon />}
        />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}

const authButtonClassName =
  "flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 text-sm font-extrabold text-ink shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:px-4";

const signInLinkClassName =
  "hidden text-sm font-extrabold text-ink/60 transition-colors hover:text-ink sm:inline";

function CustomUserButton() {
  const { user } = useUser();
  const avatarId = user?.publicMetadata?.avatarId as string | undefined;
  const avatarSrc = getAvatarSrc(avatarId);

  if (!avatarSrc) {
    return (
      <QuizzicalUserButton
        appearance={{
          elements: {
            avatarBox:
              "h-10 w-10 rounded-full border-2 border-ink/15 shadow-none",
          },
        }}
      />
    );
  }

  return (
    <div className="relative h-10 w-10 shrink-0">
      <Image
        src={avatarSrc}
        alt="Your avatar"
        width={40}
        height={40}
        className="pointer-events-none h-10 w-10 rounded-full border-2 border-ink bg-cream object-contain"
      />
      <QuizzicalUserButton
        appearance={{
          elements: {
            avatarBox:
              "absolute inset-0 h-10 w-10 opacity-0 shadow-none",
          },
        }}
      />
    </div>
  );
}

export default function NavbarAuth() {
  return (
    <>
      <Show when="signed-out">
        <Link href="/signin" className={signInLinkClassName}>
          Sign in
        </Link>
        <Link href="/signup" className={authButtonClassName} aria-label="Sign up">
          <AccountIcon className="h-4 w-4 shrink-0" />
          <span>Sign Up</span>
        </Link>
      </Show>
      <Show when="signed-in">
        <CustomUserButton />
      </Show>
    </>
  );
}
