import { NextResponse } from "next/server";
import { computeSpotlights } from "@/lib/platform/spotlights";

/** GET /api/activity/spotlights */
export async function GET() {
  const spotlights = await computeSpotlights();
  return NextResponse.json(
    { spotlights },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
