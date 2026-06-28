/** Shared Framer Motion presets — matches existing ink/cream design system. */

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const cardHover = {
  rest: { scale: 1, rotate: 0, y: 0 },
  hover: { scale: 1.04, rotate: -1.2, y: -4 },
  tap: { scale: 0.97, rotate: 0, y: 1 },
};

export const sectionViewport = {
  once: true,
  margin: "-8% 0px -8% 0px" as const,
  amount: 0.15 as const,
};

export const defaultTransition = {
  duration: 0.35,
  ease: easeOut,
};
