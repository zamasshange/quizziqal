import type { Quiz } from "./quizzes";
import { usesQuestionImages } from "./quizzes";
import { flagImageFromQuery, flagQuizImageFromQuery } from "./countryData";
import { proxiedQuizImageUrl } from "./quizImageUrl";
import { fetchWikipediaSummaryWithFallback } from "./wikipedia";

/** Server-side prefetch of Wikipedia images for visual quizzes. */
export async function prefetchQuestionImages(
  quiz: Quiz,
): Promise<Record<string, string>> {
  if (!usesQuestionImages(quiz.visualMode)) return {};

  const queries = [
    ...new Set(
      quiz.questions
        .map((q) => q.imageQuery?.trim())
        .filter((q): q is string => !!q),
    ),
  ];

  const entries = await Promise.all(
    queries.map(async (query) => {
      const flagUrl = flagQuizImageFromQuery(query) ?? flagImageFromQuery(query);
      if (flagUrl) return [query, proxiedQuizImageUrl(flagUrl)] as const;
      const summary = await fetchWikipediaSummaryWithFallback(query);
      return [
        query,
        summary?.image_url ? proxiedQuizImageUrl(summary.image_url) : "",
      ] as const;
    }),
  );

  return Object.fromEntries(entries.filter(([, url]) => url));
}
