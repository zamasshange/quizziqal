import type { MovieReveal } from "@/lib/reveal/types";

export function MovieRevealCard({ data }: { data: MovieReveal }) {
  return (
    <div className="flex gap-3 rounded-2xl border-4 border-ink bg-white p-3 shadow-[0_4px_0_0_#0d0d0d]">
      {data.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.poster_url}
          alt={data.title}
          loading="lazy"
          className="h-28 w-20 shrink-0 rounded-xl border-2 border-ink object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-answer2">
            Now you know
          </span>
          <span className="truncate text-sm font-extrabold text-ink">
            {data.title}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {data.year && (
            <span className="rounded-full border-2 border-ink/15 bg-cream px-2 py-0.5 text-xs font-extrabold text-ink/70">
              {data.year}
            </span>
          )}
          {data.rating != null && (
            <span className="rounded-full border-2 border-ink/15 bg-cream px-2 py-0.5 text-xs font-extrabold text-ink/70">
              ⭐ {data.rating.toFixed(1)}
            </span>
          )}
          {data.genres.map((g) => (
            <span
              key={g}
              className="rounded-full border-2 border-ink/15 bg-cream px-2 py-0.5 text-xs font-extrabold text-ink/70"
            >
              {g}
            </span>
          ))}
        </div>

        {data.overview && (
          <p className="mt-1.5 line-clamp-3 text-sm font-semibold text-ink/70">
            {data.overview}
          </p>
        )}
      </div>
    </div>
  );
}
