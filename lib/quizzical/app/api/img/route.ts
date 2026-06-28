import { NextResponse } from "next/server";
import {
  isAllowedQuizImageUrl,
  normalizeImageUrl,
} from "@/lib/quizImageUrl";

const UA =
  "Quizzical/1.0 (quiz game; contact: dev@quizzical.app)";

/** Proxy Wikipedia/TMDB images same-origin so they load reliably on quizzical.site. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("u") ?? "";
  const url = normalizeImageUrl(decodeURIComponent(raw));

  if (!url || !isAllowedQuizImageUrl(url)) {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent": UA,
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream image unavailable." },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const contentType =
      upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image fetch failed." }, { status: 502 });
  }
}
