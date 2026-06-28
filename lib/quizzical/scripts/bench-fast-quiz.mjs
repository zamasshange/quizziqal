import { performance } from "perf_hooks";

const { generateImageQuizBatch } = await import("../lib/quizGenerator.ts");

const categories = [
  "Celebrity",
  "Athlete",
  "Football",
  "Basketball",
  "Cricket",
  "Movie",
  "Music",
];

for (const category of categories) {
  const allAnswers = Array.from({ length: 12 }, (_, i) => `blocked-${i}`);
  const start = performance.now();
  const questions = await generateImageQuizBatch(
    category,
    10,
    "Medium",
    { answers: allAnswers },
    { fastStart: true },
  );
  const ms = Math.round(performance.now() - start);
  console.log(`${category}: ${questions.length}/10 in ${ms}ms`);
}
