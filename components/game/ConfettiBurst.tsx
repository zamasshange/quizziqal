"use client";

import { useMemo } from "react";

const COLORS = ["#fde047", "#e21b3c", "#1368ce", "#26890c", "#ff6b9d", "#a855f7"];

type Props = {
  active?: boolean;
  count?: number;
};

export default function ConfettiBurst({ active = true, count = 28 }: Props) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 0.04}s`,
        color: COLORS[i % COLORS.length],
        rotate: `${(i * 47) % 360}deg`,
        size: 6 + (i % 4) * 2,
      })),
    [count]
  );

  if (!active) return null;

  return (
    <div className="confetti-burst pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
