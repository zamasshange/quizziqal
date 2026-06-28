"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Quiz } from "@/lib/quizzes";
import QuizCard from "./QuizCard";
import {
  defaultTransition,
  fadeUp,
  sectionViewport,
  staggerContainer,
} from "@/lib/motion";

type Props = {
  title: string;
  quizzes: Quiz[];
  seeAllHref?: string;
  seeAllCount?: number;
};

export default function QuizRow({
  title,
  quizzes,
  seeAllHref,
  seeAllCount,
}: Props) {
  if (quizzes.length === 0) return null;

  return (
    <motion.section
      className="mt-7"
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={staggerContainer}
    >
      <motion.div className="mb-3 flex items-baseline gap-2" variants={fadeUp}>
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm font-extrabold text-answer2 hover:underline"
          >
            See all{seeAllCount !== undefined ? ` (${seeAllCount})` : ""}
          </Link>
        )}
      </motion.div>
      <motion.div
        className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]"
        variants={staggerContainer}
      >
        {quizzes.map((quiz, i) => (
          <div
            key={quiz.id}
            className="w-48 shrink-0 snap-start sm:w-56 md:w-64"
          >
            <QuizCard quiz={quiz} index={i} />
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
