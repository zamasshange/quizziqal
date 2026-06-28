import Link from "next/link";

export type Chip = {
  label: string;
  href: string;
  count: number;
  emoji?: string;
  active?: boolean;
};

export default function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:thin]">
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-extrabold transition-all ${
            chip.active
              ? "border-ink bg-ink text-white shadow-[0_3px_0_0_#0d0d0d]"
              : "border-ink/15 bg-white text-ink hover:-translate-y-0.5 hover:border-ink"
          }`}
        >
          {chip.emoji && <span className="text-base leading-none">{chip.emoji}</span>}
          {chip.label}
          <span className={chip.active ? "text-white/55" : "text-ink/35"}>
            {chip.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
