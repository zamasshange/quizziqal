import { NextResponse } from "next/server";
import { fetchWikipediaFact } from "@/lib/quizzical/wikipedia";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ fact: null });

  const fact = await fetchWikipediaFact(title);
  return NextResponse.json({ fact });
}
