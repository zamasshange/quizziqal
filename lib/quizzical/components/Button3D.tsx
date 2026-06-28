"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { playClick } from "@/lib/sound";

type Variant = "grass" | "sky" | "lime" | "ink" | "white";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  grass: "bg-grass text-white",
  sky: "bg-sky text-ink",
  lime: "bg-lime text-ink",
  ink: "bg-ink text-white",
  white: "bg-white text-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-9 py-3.5 text-lg",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
};

type LinkProps = CommonProps & {
  href: string;
};

const MotionLink = motion.create(Link);

export default function Button3D(props: ButtonProps | LinkProps) {
  const { children, variant = "grass", size = "md", className = "" } = props;

  const face = `relative z-10 block rounded-full border-4 border-ink font-extrabold tracking-wide
    -translate-y-1.5 transition-transform duration-75 group-hover:-translate-y-2 group-active:translate-y-0
    ${variantClasses[variant]} ${sizeClasses[size]}`;

  const inner = (
    <>
      <span className="absolute inset-0 rounded-full bg-ink" aria-hidden />
      <span className={face}>
        <span className="flex items-center justify-center gap-2 whitespace-nowrap">
          {children}
        </span>
      </span>
    </>
  );

  const wrapper = `group relative inline-flex select-none touch-manipulation outline-none ${className}`;

  const motionProps = {
    whileHover: { scale: 1.04, filter: "brightness(1.05)" },
    whileTap: { scale: 0.96 },
    transition: { type: "spring" as const, stiffness: 420, damping: 22 },
  };

  if ("href" in props && props.href !== undefined) {
    return (
      <MotionLink
        href={props.href}
        className={wrapper}
        whileHover={{ scale: 1.04, filter: "brightness(1.05)" }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
      >
        {inner}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={props.type ?? "button"}
      onClick={() => {
        playClick();
        props.onClick?.();
      }}
      className={wrapper}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
