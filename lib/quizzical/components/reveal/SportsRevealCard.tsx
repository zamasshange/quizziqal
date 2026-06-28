import type { PlayerReveal, TeamReveal } from "@/lib/reveal/types";
import HonourIcon from "@/components/icons/HonourIcon";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border-2 border-ink/15 bg-cream px-2.5 py-0.5 text-xs font-extrabold text-ink/70">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-extrabold uppercase tracking-wide text-ink/40">
        {label}
      </span>
      <span className="text-sm font-extrabold text-ink">{value}</span>
    </div>
  );
}

export function PlayerRevealCard({ data }: { data: PlayerReveal }) {
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-[0_4px_0_0_#0d0d0d]">
      {/* Header strip */}
      <div className="flex items-stretch gap-3 border-b-4 border-ink bg-petrol p-3">
        {data.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image_url}
            alt={data.name}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-xl border-2 border-ink bg-white object-cover"
          />
        )}
        <div className="flex min-w-0 flex-col justify-center gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-sky">
            Player profile
          </span>
          <h3 className="truncate font-display text-xl font-extrabold leading-none text-cream">
            {data.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-cream/80">
            {data.flag && <span className="text-lg leading-none">{data.flag}</span>}
            {data.nationality && <span>{data.nationality}</span>}
            {data.sport && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                {data.sport}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {/* Club + key facts */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {data.team && (
            <div className="flex items-center gap-2">
              {data.team_badge && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.team_badge}
                  alt={data.team}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 object-contain"
                />
              )}
              <Stat label="Club" value={data.team} />
            </div>
          )}
          {data.position && <Stat label="Position" value={data.position} />}
          {data.date_of_birth && (
            <Stat label="Born" value={data.date_of_birth} />
          )}
        </div>

        {/* Honours */}
        {data.honours.length > 0 && (
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-ink/40">
              Honours
            </span>
            <ul className="mt-1 flex flex-col gap-1">
              {data.honours.slice(0, 5).map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm font-bold text-ink/75"
                >
                  <HonourIcon honour={h} size={24} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Former teams */}
        {data.former_teams.length > 0 && (
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-ink/40">
              Former teams
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {data.former_teams.map((t, i) => (
                <Chip key={i}>{t}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* Biography */}
        {data.biography && (
          <p className="line-clamp-4 text-sm font-semibold text-ink/70">
            {data.biography}
          </p>
        )}

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-ink/45 underline hover:text-ink"
          >
            More on TheSportsDB ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function TeamRevealCard({ data }: { data: TeamReveal }) {
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-[0_4px_0_0_#0d0d0d]">
      <div className="flex items-center gap-3 border-b-4 border-ink bg-grass p-3">
        {data.badge && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.badge}
            alt={data.name}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-xl border-2 border-ink bg-white object-contain p-1"
          />
        )}
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-white/70">
            Team profile
          </span>
          <h3 className="truncate font-display text-xl font-extrabold leading-tight text-white">
            {data.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {data.league && <Stat label="League" value={data.league} />}
          {data.country && <Stat label="Country" value={data.country} />}
          {data.founded && <Stat label="Founded" value={data.founded} />}
          {data.stadium && <Stat label="Stadium" value={data.stadium} />}
        </div>

        {data.description && (
          <p className="line-clamp-4 text-sm font-semibold text-ink/70">
            {data.description}
          </p>
        )}

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-ink/45 underline hover:text-ink"
          >
            More on TheSportsDB ↗
          </a>
        )}
      </div>
    </div>
  );
}
