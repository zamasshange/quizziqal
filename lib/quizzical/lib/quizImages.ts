// Client-side Wikipedia image fetching for text quizzes with visual modes.

import { proxiedQuizImageUrl } from "@/lib/quizImageUrl";

export type QuizImageResult = {
  image_url: string | null;
  title: string;
  description: string | null;
};

const cache = new Map<string, QuizImageResult>();

export async function fetchQuizImage(
  term: string,
): Promise<QuizImageResult | null> {
  const key = term.trim();
  if (!key) return null;

  const cached = cache.get(key);
  if (cached?.image_url) return cached;

  try {
    const res = await fetch(
      `/api/quiz-image?term=${encodeURIComponent(key)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as QuizImageResult;
    if (data.image_url) {
      data.image_url = proxiedQuizImageUrl(data.image_url);
      cache.set(key, data);
    }
    return data;
  } catch {
    return null;
  }
}

export async function fetchQuizImages(
  terms: string[],
): Promise<(QuizImageResult | null)[]> {
  return Promise.all(terms.map((term) => fetchQuizImage(term)));
}
