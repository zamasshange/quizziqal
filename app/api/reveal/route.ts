import { NextResponse } from "next/server";
import { resolveReveal } from "@/lib/quizzical/reveal";

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
