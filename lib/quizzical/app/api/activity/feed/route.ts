import { NextResponse } from "next/server";
import { fetchActivityFeed } from "@/lib/platform/activity";

/** GET /api/activity/feed */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 40);
  const events = await fetchActivityFeed(limit);
  return NextResponse.json(
    { events },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    },
  );
}
