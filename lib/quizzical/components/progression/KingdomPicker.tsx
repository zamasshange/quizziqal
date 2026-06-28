"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useProgression } from "@/lib/progression/client";
import { KINGDOMS } from "@/lib/progression/kingdoms";
import { loadRawState, saveRawState } from "@/lib/progression/engine";

export default function KingdomPicker() {
  const { isSignedIn } = useUser();
  const { state, loaded, refresh } = useProgression();
  const [joining, setJoining] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function joinKingdom(kingdomId: string) {
    setJoining(kingdomId);
    try {
      if (isSignedIn) {
        const res = await fetch("/api/progression/kingdoms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kingdomId }),
        });
        if (res.ok) {
          setOpen(false);
          await refresh();
        }
        return;
      }

      const raw = loadRawState();
      raw.kingdomId = kingdomId;
      saveRawState(raw);
      setOpen(false);
      await refresh();
    } finally {
      setJoining(null);
    }
  }

  if (!loaded) return null;

  if (state.kingdom && !open) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]"
      >
        <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
          Your kingdom
        </p>
        <p className="font-display text-lg font-black text-ink">
          {state.kingdom.emoji} {state.kingdom.name}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-xs font-extrabold text-grass hover:underline"
        >
          Switch kingdom →
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]"
    >
      <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
        Knowledge Kingdoms
      </p>
      <p className="text-sm font-bold text-ink/60">
        Join a faction and compete weekly for glory.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {KINGDOMS.map((k) => (
          <button
            key={k.id}
            type="button"
            disabled={joining !== null}
            onClick={() => void joinKingdom(k.id)}
            className={`flex items-center gap-2 rounded-xl border-2 border-ink px-3 py-2 text-left transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
              state.kingdom?.id === k.id ? "bg-lime/30" : "bg-cream"
            }`}
          >
            <span className="text-xl">{k.emoji}</span>
            <span>
              <span className="block text-sm font-extrabold text-ink">{k.name}</span>
              <span className="block text-[10px] font-bold text-ink/50">{k.description}</span>
            </span>
          </button>
        ))}
      </div>
      {state.kingdom && open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 text-xs font-extrabold text-ink/45 hover:underline"
        >
          Cancel
        </button>
      )}
    </motion.div>
  );
}
