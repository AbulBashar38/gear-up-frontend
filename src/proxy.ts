import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROLE_HOME, requiredRoleForPath } from "@/lib/auth/dashboard-routes";
import { decodeSessionToken } from "@/lib/auth/session-token";

const AUTH_ROUTES = ["/login", "/register"];

// Keep redirects internal so a crafted returnTo can't bounce to another origin.
function safeReturnTo(pathAndQuery: string): string {
  return pathAndQuery.startsWith("/") && !pathAndQuery.startsWith("//")
    ? pathAndQuery
    : "/dashboard";
}

// Proxy performs only optimistic, cookie-based redirects. It never refreshes
// tokens, calls the backend, or verifies signatures — the frontend has no
// signing secret, so it decodes the JWT purely to route. Authentication and
// authorization are enforced near the data via /auth/me and backend role/
// ownership checks (see requireDashboardRole).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasSession = Boolean(accessToken || refreshToken);

  // The refresh token carries the same payload, so it still yields a role for
  // routing when the access token has been cleared but the session lives on.
  const claims =
    decodeSessionToken(accessToken) ?? decodeSessionToken(refreshToken);
  const role = claims?.role ?? null;
  const home = role ? ROLE_HOME[role] : "/dashboard";

  // Signed-in users have no reason to see login/register.
  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    // Guests are sent to login with a safe path to return to afterwards.
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "returnTo",
        safeReturnTo(`${pathname}${search}`),
      );
      return NextResponse.redirect(loginUrl);
    }

    // Optimistically bounce an obviously wrong-role visitor to their own
    // dashboard. When the role can't be decoded we defer to the page guard.
    const requiredRole = requiredRoleForPath(pathname);
    if (requiredRole && role && role !== requiredRole) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
