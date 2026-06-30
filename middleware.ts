import { NextRequest, NextResponse } from "next/server";

const PBS_ORIGIN = "https://pbskids.org";

function shouldProxyToPbs(pathname: string) {
  if (pathname.startsWith("/pbs-proxy/")) return true;
  if (pathname.startsWith("/_next/static/css/")) return true;
  if (pathname.startsWith("/_next/static/media/")) return true;
  if (pathname.startsWith("/puma/")) return true;
  return false;
}

async function proxyToPbs(request: NextRequest) {
  const proxiedPath = request.nextUrl.pathname.startsWith("/pbs-proxy/")
    ? request.nextUrl.pathname.replace(/^\/pbs-proxy/, "")
    : request.nextUrl.pathname;

  const target = new URL(`${proxiedPath}${request.nextUrl.search}`, PBS_ORIGIN);

  const upstream = await fetch(target, {
    headers: {
      accept: request.headers.get("accept") ?? "*/*",
      referer: `${PBS_ORIGIN}/`,
    },
  });

  if (!upstream.ok) {
    return NextResponse.next();
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=86400");

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldProxyToPbs(pathname)) {
    return NextResponse.next();
  }

  return proxyToPbs(request);
}

export const config = {
  matcher: [
    "/_next/static/css/:path*",
    "/_next/static/media/:path*",
    "/pbs-proxy/:path*",
    "/puma/:path*",
  ],
};
