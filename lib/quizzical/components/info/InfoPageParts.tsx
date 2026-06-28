import type { ReactNode } from "react";
import AppIcon, { type AppIconName } from "@/components/icons/AppIcon";

type InfoHeroProps = {
  /** Lucide icon — preferred over emoji */
  icon?: AppIconName;
  /** Legacy emoji fallback */
  emoji?: string;
  title: string;
  subtitle: string;
  accentClass?: string;
  children?: ReactNode;
};

function IconBadge({
  icon,
  emoji,
  size = "lg",
}: {
  icon?: AppIconName;
  emoji?: string;
  size?: "sm" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-14 w-14 rounded-2xl border-[3px] text-3xl"
      : "h-9 w-9 rounded-xl border-2 text-lg";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border-ink bg-cream shadow-[0_3px_0_0_#0d0d0d] ${box}`}
      aria-hidden
    >
      {icon ? (
        <AppIcon
          name={icon}
          size={size === "lg" ? 28 : 18}
          className="text-grass"
        />
      ) : (
        emoji
      )}
    </span>
  );
}

export function InfoHero({
  icon,
  emoji,
  title,
  subtitle,
  accentClass = "bg-petrol",
  children,
}: InfoHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border-4 border-ink ${accentClass} shadow-[0_6px_0_0_#0d0d0d]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-quiz-pattern opacity-[0.08]" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="mb-4">
          <IconBadge icon={icon} emoji={emoji} size="lg" />
        </div>
        <h1 className="font-display text-3xl font-black leading-tight text-cream md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base font-bold text-cream/75 md:text-lg">
          {subtitle}
        </p>
        {children}
      </div>
    </section>
  );
}

type InfoSectionProps = {
  id?: string;
  title: string;
  icon?: AppIconName;
  emoji?: string;
  children: ReactNode;
  className?: string;
};

export function InfoSection({
  id,
  title,
  icon,
  emoji,
  children,
  className = "",
}: InfoSectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <h2 className="flex items-center gap-2 text-xl font-black text-ink md:text-2xl">
        {(icon || emoji) && (
          <IconBadge icon={icon} emoji={emoji} size="sm" />
        )}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type InfoCardProps = {
  children: ReactNode;
  className?: string;
};

export function InfoCard({ children, className = "" }: InfoCardProps) {
  return (
    <div
      className={`rounded-2xl border-4 border-ink bg-white p-5 shadow-[0_4px_0_0_#0d0d0d] md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

type FeatureGridItem = {
  icon?: AppIconName;
  emoji?: string;
  title: string;
  description: string;
  color: string;
};

export function FeatureGrid({ items }: { items: FeatureGridItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="flex gap-4 rounded-2xl border-4 border-ink bg-white p-5 shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink shadow-[0_3px_0_0_#0d0d0d]"
            style={{ backgroundColor: item.color }}
            aria-hidden
          >
            {item.icon ? (
              <AppIcon name={item.icon} size={24} className="text-ink" />
            ) : (
              <span className="text-2xl">{item.emoji}</span>
            )}
          </span>
          <div>
            <h3 className="font-extrabold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-ink/65">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoProse({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-base font-semibold leading-relaxed text-ink/75">
      {children}
    </div>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-sm font-bold text-ink/75 md:text-base"
        >
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-grass" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}
