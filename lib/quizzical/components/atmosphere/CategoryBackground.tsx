"use client";

import { motion } from "framer-motion";
import { getCategoryTheme } from "@/lib/atmosphere/categoryThemes";
import GameParticles from "./GameParticles";

type Props = {
  categorySlug?: string;
  baseColor?: string;
  showParticles?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Animated orbs + floating emojis behind category banners and quiz intros. */
export default function CategoryBackground({
  categorySlug,
  baseColor,
  showParticles = true,
  className = "",
  children,
}: Props) {
  const theme = getCategoryTheme(categorySlug);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {theme.orbColors.map((color, i) => (
        <motion.span
          key={color + i}
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            backgroundColor: color,
            width: `${120 + i * 40}px`,
            height: `${120 + i * 40}px`,
            left: `${8 + i * 22}%`,
            top: `${10 + (i % 2) * 30}%`,
            opacity: 0.35,
          }}
          animate={{
            x: [0, 12, -8, 0],
            y: [0, -10, 6, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {theme.emojis.slice(0, 5).map((emoji, i) => (
        <motion.span
          key={emoji + i}
          aria-hidden
          className="pointer-events-none absolute select-none text-2xl opacity-20 md:text-4xl"
          style={{
            left: `${6 + i * 18}%`,
            top: `${12 + (i % 3) * 24}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, i % 2 ? 8 : -8, 0],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {showParticles && (
        <GameParticles
          id={`particles-${categorySlug ?? "default"}`}
          color={theme.particleColor}
          density={22}
        />
      )}

      {baseColor && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: baseColor }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
