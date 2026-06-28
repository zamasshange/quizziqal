import type { SVGProps } from "react";

export function QuizzicalLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <rect x="2" y="6" width="50" height="46" rx="15" fill="#0f5b5b" />
        <path d="M17 50l9 7 2-11z" fill="#0f5b5b" />
        <path
          d="M20 24a7 7 0 0 1 14 0c0 4-4 5-5.5 7-0.8 1-0.9 2-0.9 3.2"
          stroke="#fffdf4"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="27" cy="42" r="2.8" fill="#fffdf4" />
      </g>
      <text
        x="62"
        y="42"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize="38"
        fontWeight="900"
        letterSpacing="-1"
      >
        <tspan fill="#ff6b6b">Q</tspan>
        <tspan fill="#4d8dff">u</tspan>
        <tspan fill="#00a76d">i</tspan>
        <tspan fill="#ffc24b">z</tspan>
        <tspan fill="#0f5b5b">z</tspan>
        <tspan fill="#ff6b6b">i</tspan>
        <tspan fill="#4d8dff">c</tspan>
        <tspan fill="#00a76d">a</tspan>
        <tspan fill="#ffc24b">l</tspan>
      </text>
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}

export function AccountIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M6 19a6 6 0 0 1 12 0" />
    </svg>
  );
}

export function SoundOnIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function SoundOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M17 9.5l4 5M21 9.5l-4 5" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" />
      <path d="M19 14l.9 2.6L22 17.5l-2.1.9L19 21l-.9-2.6L16 17.5l2.1-.9z" />
    </svg>
  );
}

/* Colorful category icons */

export function StartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" fill="#ff6b6b" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function ArtIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3a9 9 0 0 0 0 18c1.7 0 2-1.2 1.2-2.1-.8-1 0-2.4 1.3-2.4H17a4 4 0 0 0 4-4c0-5-4-7.5-9-7.5z" fill="#fff" stroke="#0a0a0a" strokeWidth="1.6" />
      <circle cx="8" cy="11" r="1.4" fill="#ff6b6b" />
      <circle cx="12" cy="8" r="1.4" fill="#4d8dff" />
      <circle cx="16" cy="10" r="1.4" fill="#ffc24b" />
    </svg>
  );
}

export function EntertainmentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" fill="#ffc24b" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function GeographyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" fill="#00a76d" stroke="#0a0a0a" strokeWidth="1.6" />
      <path d="M3.5 10h17M3.5 14h17M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="#0a0a0a" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l9 4H3z" fill="#c98a3a" stroke="#0a0a0a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 8v9M9.5 8v9M14.5 8v9M19 8v9M3 20h18" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LanguagesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="#4d8dff" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 9h10M7 12h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ScienceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3c-1 3 1 5 1 8a3 3 0 0 1-6 0c0-2 2-3 2-5" fill="#00a76d" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11c1 2 4 2 5 5a3.5 3.5 0 0 1-6.5 1.8" fill="#1fb6a6" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function SportsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" fill="#ff9f43" stroke="#0a0a0a" strokeWidth="1.6" />
      <path d="M12 3v18M3 12h18M5.5 5.5c3 2.5 3 10.5 0 13M18.5 5.5c-3 2.5-3 10.5 0 13" stroke="#0a0a0a" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

export function TriviaIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 6c-2-3-9-2-9 3 0 4 6 5 9 9 3-4 9-5 9-9 0-5-7-6-9-3z" fill="#b15bff" stroke="#0a0a0a" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 6v12" stroke="#0a0a0a" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}
