import { NextResponse } from "next/server";
import { flagImageFromQuery, flagQuizImageFromQuery } from "@/lib/countryData";
import { proxiedQuizImageUrl } from "@/lib/quizImageUrl";
import { fetchWikipediaSummaryWithFallback } from "@/lib/wikipedia";

export type QuizImageResponse = {
  image_url: string | null;
  title: string;
  description: string | null;
};

const memory = new Map<string, QuizImageResponse>();

// GET /api/quiz-image?term=Flag+of+France
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = (searchParams.get("term") ?? "").trim();
  if (!term) {
    return NextResponse.json({
      image_url: null,
      title: "",
      description: null,
    } satisfies QuizImageResponse);
  }

  if (memory.has(term)) {
    return NextResponse.json(memory.get(term));
  }

  const flagUrl = flagQuizImageFromQuery(term) ?? flagImageFromQuery(term);
  if (flagUrl) {
    const result: QuizImageResponse = {
      image_url: proxiedQuizImageUrl(flagUrl),
      title: term,
      description: null,
    };
    memory.set(term, result);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  const summary = await fetchWikipediaSummaryWithFallback(term);
  const result: QuizImageResponse = summary
    ? {
        image_url: proxiedQuizImageUrl(summary.image_url),
        title: summary.title,
        description: summary.description || null,
      }
    : { image_url: null, title: term, description: null };

  if (result.image_url) memory.set(term, result);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
