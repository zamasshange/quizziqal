import Link from "next/link";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import { listImageQuestions } from "@/lib/imageQuestionsStore";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const all = await listImageQuestions();
  const byCategory = IMAGE_GAME_MODES.map((m) => ({
    ...m,
    count: all.filter((q) => q.category === m.category).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Overview</h1>
        <p className="font-bold text-ink/60">
          Manage admin image questions. Player games use live Wikipedia/TMDB
          generation — not this list.
        </p>
        {!isSupabaseConfigured() && (
          <p className="mt-2 text-sm font-bold text-ink/50">
            Optional Supabase cache is not configured — questions are stored
            locally in{" "}
            <code className="rounded bg-black/5 px-1">.mock-data/</code>.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {byCategory.map((m) => (
          <div
            key={m.slug}
            className="flex flex-col gap-1 rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]"
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="font-display text-3xl font-extrabold">
              {m.count}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-ink/50">
              {m.category}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/image-questions/new"
          className="rounded-full border-4 border-ink bg-grass px-5 py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
        >
          + Add image question
        </Link>
        <Link
          href="/dashboard/image-questions"
          className="rounded-full border-4 border-ink bg-white px-5 py-2.5 font-extrabold shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
        >
          Manage questions
        </Link>
      </div>
    </div>
  );
}
