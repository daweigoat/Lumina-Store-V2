import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // Rate Limiting (apply strict limit to /api and /checkout)
  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/checkout")) {
    const limitResult = await rateLimit(ip, 100, 60000); // 100 req per minute

    if (!limitResult.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": limitResult.limit.toString(),
          "X-RateLimit-Remaining": limitResult.remaining.toString(),
          "X-RateLimit-Reset": limitResult.reset.toString(),
        },
      });
    }
  }

  const response = NextResponse.next();

  // Basic CSRF Protection: Ensure mutating API requests have correct content types
  if (request.nextUrl.pathname.startsWith("/api") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
      return new NextResponse("Invalid Content-Type for mutating request", { status: 415 });
    }
  }

  // Force secure cookies for our custom cookies if any (NextAuth handles its own)
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (setCookieHeader && process.env.NODE_ENV === "production") {
    // Basic regex to inject Secure if missing
    if (!/Secure/i.test(setCookieHeader)) {
      response.headers.set("Set-Cookie", `${setCookieHeader}; Secure`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, and public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
