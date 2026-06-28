"use client";

import { useMemo } from "react";
import { Particles, useParticlesProvider } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";

type Props = {
  color?: string;
  density?: number;
  className?: string;
  id?: string;
};

export default function GameParticles({
  color = "#ffc83a",
  density = 28,
  className = "",
  id = "game-particles",
}: Props) {
  const { loaded } = useParticlesProvider();

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: density, density: { enable: true, width: 800, height: 800 } },
        color: { value: color },
        opacity: { value: { min: 0.15, max: 0.55 } },
        size: { value: { min: 1, max: 3.5 } },
        move: {
          enable: true,
          speed: { min: 0.2, max: 0.9 },
          direction: "top",
          outModes: { default: "out" },
        },
        links: { enable: false },
      },
      detectRetina: true,
      interactivity: {
        detectsOn: "canvas",
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
    }),
    [color, density],
  );

  if (!loaded) return null;

  return (
    <Particles
      id={id}
      className={`pointer-events-none absolute inset-0 ${className}`}
      options={options}
    />
  );
}

/** Burst preset for celebrations — higher density, wider spread. */
export function CelebrationParticles({
  color = "#ffd95e",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <GameParticles
      id="celebration-particles"
      color={color}
      density={55}
      className={className}
    />
  );
}
