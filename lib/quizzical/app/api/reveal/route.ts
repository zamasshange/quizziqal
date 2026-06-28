import { NextResponse } from "next/server";
import { resolveReveal } from "@/lib/reveal";

// Provider-based educational reveal for any quiz answer.
// GET /api/reveal?term=Lionel%20Messi&category=sports
//
// The category decides the provider (TheSportsDB / TMDB / Wikipedia); results
// are cached in Supabase so external APIs are never called twice for the same
// term. Wikipedia is the universal fallback.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = (
    searchParams.get("term") ??
    searchParams.get("topic") ??
    searchParams.get("title") ??
    ""
  ).trim();
  const category = searchParams.get("category");

  if (!term) return NextResponse.json({ data: null });

  const data = await resolveReveal(term, category);
  return NextResponse.json({ data });
}
