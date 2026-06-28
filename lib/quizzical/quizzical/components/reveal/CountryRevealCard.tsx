import type { CountryReveal } from "@/lib/reveal/types";

function compactPopulation(n: number | null): string | null {
  if (!n) return null;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

export function CountryRevealCard({
  data,
  hideImage,
}: {
  data: CountryReveal;
  hideImage: boolean;
}) {
  const facts: [string, string][] = [];
  if (data.capital) facts.push(["Capital", data.capital]);
  const pop = compactPopulation(data.population);
  if (pop) facts.push(["Population", pop]);
  if (data.region) facts.push(["Continent", data.region]);

  const showImage = !hideImage && data.image_url;

  return (
    <div className="flex flex-col gap-3">
      {showImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl border-[3px] border-ink bg-ink sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src={data.image_url!}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image_url!}
            alt={data.name}
            loading="lazy"
            className="relative h-full w-full object-contain"
          />
          {data.flag_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.flag_url}
              alt={`${data.name} flag`}
              className="absolute bottom-2 left-2 h-9 w-14 rounded-md border-2 border-ink object-cover shadow-[0_2px_0_0_#0d0d0d]"
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {hideImage && data.flag_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.flag_url}
            alt={`${data.name} flag`}
            className="h-9 w-14 shrink-0 rounded-md border-2 border-ink object-cover shadow-[0_2px_0_0_#0d0d0d]"
          />
        )}
        <div className="min-w-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-grass">
            Now you know
          </span>
          <h3 className="font-display text-xl font-extrabold leading-tight text-ink">
            {data.name}
          </h3>
        </div>
      </div>

      {facts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {facts.map(([label, value]) => (
            <span
              key={label}
              className="inline-flex items-baseline gap-1 rounded-full border-2 border-ink bg-cream px-3 py-1 text-sm font-extrabold text-ink"
            >
              <span className="text-[10px] uppercase tracking-wide text-ink/45">
                {label}
              </span>
              {value}
            </span>
          ))}
        </div>
      )}

      {data.extract && (
        <p className="line-clamp-4 text-sm font-semibold leading-relaxed text-ink/75">
          {data.extract}
        </p>
      )}

      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-ink/40 underline hover:text-ink"
        >
          Read more on Wikipedia ↗
        </a>
      )}
    </div>
  );
}
