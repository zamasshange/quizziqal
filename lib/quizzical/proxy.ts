import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { CATEGORY_PATHS } from "@/lib/categorySlugs";
import { isValidTopicSlug } from "@/lib/seoTopics";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
  hasCompletedOnboarding,
} from "@/lib/userMetadata";

function normalizeTopicSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Legacy Google URLs used capital /Topics — must be case-sensitive (config redirects loop). */
function legacyTopicsCaseRedirect(req: Request): NextResponse | null {
  const url = new URL(req.url);
  if (!url.pathname.startsWith("/Topics")) return null;
  url.pathname = url.pathname.replace(/^\/Topics/, "/topics");
  return NextResponse.redirect(url, 301);
}

/** Normalize messy slugs; send unknown topics to the homepage. */
function topicRedirect(req: Request): NextResponse | null {
  const url = new URL(req.url);
  const prefix = "/topics/";
  if (!url.pathname.startsWith(prefix) || url.pathname.length <= prefix.length) {
    return null;
  }

  const rawSlug = decodeURIComponent(
    url.pathname.slice(prefix.length).split("/")[0] ?? "",
  );
  const normalized = normalizeTopicSlug(rawSlug);

  if (!normalized) {
    url.pathname = "/";
    return NextResponse.redirect(url, 302);
  }

  if (normalized !== rawSlug) {
    url.pathname = `${prefix}${normalized}`;
    return NextResponse.redirect(url, 301);
  }

  if (!isValidTopicSlug(normalized)) {
    url.pathname = "/";
    return NextResponse.redirect(url, 302);
  }

  return null;
}

// Protect admin dashboard and API routes. Unauthenticated users go to /signin.
// Next.js 16 uses proxy.ts (formerly middleware.ts) for request interception.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/admin(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/signin(.*)",
  "/signup(.*)",
  "/onboarding",
]);

// Guest play + browsing must never redirect to onboarding (breaks fetch/image loads).
const isOnboardingBypass = createRouteMatcher([
  "/api(.*)",
  "/__clerk(.*)",
  "/quiz(.*)",
  "/play(.*)",
  "/ai(.*)",
  "/profile",
  "/account",
  "/leaderboard",
  "/knowledge-book",
  "/achievements",
  "/discover",
  "/country(.*)",
  "/player(.*)",
  "/celebrity(.*)",
  "/movie(.*)",
  "/landmark(.*)",
  "/figure(.*)",
  "/",
  "/topics(.*)",
  "/about",
  "/contact",
  "/founder",
  "/privacy-policy",
  "/status",
  ...CATEGORY_PATHS,
]);

export default clerkMiddleware(async (auth, req) => {
  const legacyTopics = legacyTopicsCaseRedirect(req);
  if (legacyTopics) return legacyTopics;

  const topicRouteRedirect = topicRedirect(req);
  if (topicRouteRedirect) return topicRouteRedirect;

  if (isProtectedRoute(req)) {
    await auth.protect({ unauthenticatedUrl: "/signin" });
  }

  const { userId, sessionClaims } = await auth();

  const onboardingDone = hasCompletedOnboarding(sessionClaims, {
    avatar: req.cookies.get(AVATAR_COOKIE_NAME)?.value,
    onboarded: req.cookies.get(ONBOARDING_COOKIE_NAME)?.value,
  });

  if (
    userId &&
    !isAuthRoute(req) &&
    !isOnboardingBypass(req) &&
    !onboardingDone
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
