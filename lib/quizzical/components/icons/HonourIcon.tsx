import AppIcon from "@/components/icons/AppIcon";
import {
  matchCompetitionLogo,
  type CompetitionLogo,
} from "@/lib/icons/competitionLogos";

type CompetitionLogoProps = {
  honour: string;
  size?: number;
  className?: string;
};

function LogoImage({
  logo,
  size,
  className,
}: {
  logo: CompetitionLogo;
  size: number;
  className: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.image}
      alt={logo.label}
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block shrink-0 rounded-md border border-ink/10 bg-white object-contain p-0.5 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Renders a real competition badge when the honour text matches, else a trophy icon. */
export default function HonourIcon({
  honour,
  size = 22,
  className = "",
}: CompetitionLogoProps) {
  const logo = matchCompetitionLogo(honour);
  if (logo) {
    return <LogoImage logo={logo} size={size} className={className} />;
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-ink/10 bg-cream ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <AppIcon name="trophy" size={Math.round(size * 0.6)} className="text-grass" />
    </span>
  );
}

export function CompetitionLogoBadge({
  honour,
  size = 28,
  className = "",
}: CompetitionLogoProps) {
  const logo = matchCompetitionLogo(honour);
  if (!logo) return null;
  return <LogoImage logo={logo} size={size} className={className} />;
}
