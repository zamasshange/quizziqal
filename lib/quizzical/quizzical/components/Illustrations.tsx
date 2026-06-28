import type { SVGProps } from "react";

export function AiIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      width="96"
      height="96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="20"
        y="28"
        width="56"
        height="44"
        rx="12"
        fill="#6feeff"
        stroke="#0a0a0a"
        strokeWidth="4"
      />
      <circle cx="38" cy="50" r="5" fill="#0a0a0a" />
      <circle cx="58" cy="50" r="5" fill="#0a0a0a" />
      <path
        d="M40 62h16"
        stroke="#0a0a0a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M48 28v-10"
        stroke="#0a0a0a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="14" r="5" fill="#ffc24b" stroke="#0a0a0a" strokeWidth="4" />
      <path
        d="M16 44l-6 4 6 4M80 44l6 4-6 4"
        stroke="#0a0a0a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
