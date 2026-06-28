import type { ReactNode } from "react";
import Button3D from "./Button3D";

type Variant = "grass" | "sky" | "lime" | "ink" | "white";

type Props = {
  title: string;
  subtitle: ReactNode;
  buttonLabel: string;
  buttonVariant?: Variant;
  buttonHref: string;
  illustration?: ReactNode;
};

export default function BannerCard({
  title,
  subtitle,
  buttonLabel,
  buttonVariant = "grass",
  buttonHref,
  illustration,
}: Props) {
  return (
    <div className="flex h-full items-center justify-between gap-4 overflow-hidden rounded-3xl border-4 border-ink bg-white p-6 shadow-[0_6px_0_0_#0d0d0d] md:p-7">
      <div className="flex flex-col items-start gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold leading-none text-ink md:text-3xl">
            {title}
          </h2>
          <div className="mt-1 flex flex-col text-sm font-bold text-ink/60">
            {subtitle}
          </div>
        </div>
        <Button3D href={buttonHref} variant={buttonVariant} size="md">
          {buttonLabel}
        </Button3D>
      </div>
      {illustration && (
        <div className="hidden shrink-0 sm:block" aria-hidden>
          {illustration}
        </div>
      )}
    </div>
  );
}
