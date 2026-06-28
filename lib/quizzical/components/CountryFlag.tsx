"use client";

import { useState } from "react";
import { flagImageUrl, getCountry } from "@/lib/progression/countries";

type CountryFlagProps = {
  code: string;
  /** Display width in px. Height follows 3:2 aspect. */
  width?: number;
  className?: string;
  title?: string;
};

export default function CountryFlag({
  code,
  width = 40,
  className = "",
  title,
}: CountryFlagProps) {
  const country = getCountry(code);
  const label = title ?? country?.name ?? code;
  const height = Math.round((width * 2) / 3);
  const [failed, setFailed] = useState(false);

  if (failed && country?.flag) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center text-base leading-none ${className}`}
        style={{ width, height, minWidth: width, minHeight: height }}
        aria-label={`${label} flag`}
        role="img"
      >
        {country.flag}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagImageUrl(code, width)}
      alt={`${label} flag`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-sm border border-ink/20 object-cover shadow-[0_1px_0_0_rgba(13,13,13,0.15)] ${className}`}
      style={{ width, height, minWidth: width, minHeight: height }}
    />
  );
}
