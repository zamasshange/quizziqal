"use client";

import { useUnlockForHref } from "@/lib/progression/unlockClient";
import LockedContentPreview from "./LockedContentPreview";

type Props = {
  href: string;
  children: React.ReactNode;
  preview?: React.ReactNode;
};

/** Blocks gameplay when content is locked; shows requirements. */
export default function UnlockGate({ href, children, preview }: Props) {
  const { unlock, locked } = useUnlockForHref(href);

  if (locked && unlock) {
    return (
      <div className="mx-auto max-w-lg py-4">
        <LockedContentPreview unlock={unlock} mode="full">
          {preview ?? (
            <div className="flex aspect-video items-center justify-center rounded-2xl border-4 border-ink bg-cream">
              <span className="text-4xl">{unlock.emoji}</span>
            </div>
          )}
        </LockedContentPreview>
        <p className="mt-4 text-center text-sm font-bold text-ink/60">
          Keep playing to unlock <span className="text-ink">{unlock.title}</span>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
