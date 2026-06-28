import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildContentExclusions,
  fetchUserContentHistory,
  recordContentPlays,
} from "@/lib/platform/contentHistoryServer";
import { imageCategoryToContentType } from "@/lib/platform/contentHistory";

/** GET /api/content/history?contentType=celebrity */
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ exclusions: { contentIds: [], answers: [], images: [] } });
  }

  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType") ?? undefined;
  const exclusions = await buildContentExclusions(userId, contentType);
  const history = await fetchUserContentHistory(userId, { contentType });

  return NextResponse.json({ exclusions, history });
}

/** POST /api/content/history — record played entities */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await req.json()) as {
    items?: { contentId: string; contentType?: string; category?: string }[];
    category?: string;
    answers?: string[];
  };

  const rawItems =
    body.items ??
    (body.answers ?? []).map((a) => ({
      contentId: a,
      contentType: body.category
        ? imageCategoryToContentType(body.category)
        : "general",
      category: body.category,
    }));

  const items = rawItems.map((i) => ({
    contentId: i.contentId,
    contentType: i.contentType ?? "general",
    category: i.category,
  }));

  await recordContentPlays(userId, items);
  return NextResponse.json({ ok: true });
}
